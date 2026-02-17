import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isScoreReasonable } from '@/lib/verification/engine'

interface SubmitScoreRequest {
  submission_type: 'period_score' | 'final_score' | 'live_update'
  home_score: number
  away_score: number
  period?: string | null
  time_remaining?: string | null
  is_overtime?: boolean
  overtime_count?: number
  photo_url?: string | null
  at_game?: boolean
}

interface RateLimitResult {
  allowed: boolean
  reason: string
  recent_count: number
}

interface GameRow {
  id: string
  home_score: number
  away_score: number
  status: string
  is_verified: boolean
  official_submission_id: string | null
  golden_game: boolean
  sport?: { code: string } | null
}

interface SubmissionRow {
  id: string
  status: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params
    const supabase = await createClient()

    // 1. Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1b. Check if user is banned
    const { data: permData } = await supabase.rpc('get_user_permissions', { p_user_id: user.id } as never)
    const perms = (Array.isArray(permData) ? permData[0] : permData) as { is_banned?: boolean } | null
    if (perms?.is_banned) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    // 2. Parse request body
    const body: SubmitScoreRequest = await request.json()
    const {
      submission_type,
      home_score,
      away_score,
      period,
      time_remaining,
      is_overtime = false,
      overtime_count = 0,
      photo_url,
      at_game = false,
    } = body

    // 3. Validate required fields
    if (!submission_type || home_score === undefined || away_score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'submission_type, home_score, and away_score are required' },
        { status: 400 }
      )
    }

    if (typeof home_score !== 'number' || typeof away_score !== 'number' ||
        !Number.isFinite(home_score) || !Number.isFinite(away_score) ||
        !Number.isInteger(home_score) || !Number.isInteger(away_score)) {
      return NextResponse.json(
        { error: 'Invalid scores', message: 'Scores must be whole numbers' },
        { status: 400 }
      )
    }

    if (home_score < 0 || away_score < 0) {
      return NextResponse.json(
        { error: 'Invalid scores', message: 'Scores cannot be negative' },
        { status: 400 }
      )
    }

    // Hard cap — no sport has scores above 999
    if (home_score > 999 || away_score > 999) {
      return NextResponse.json(
        { error: 'Invalid scores', message: 'Scores exceed maximum allowed value' },
        { status: 400 }
      )
    }

    // 4. Check rate limiting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rateLimitData, error: rateLimitError } = await (supabase.rpc as any)('can_submit_score', {
      p_user_id: user.id,
      p_game_id: gameId,
    })

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
      return NextResponse.json(
        { error: 'Failed to check submission eligibility', message: rateLimitError.message },
        { status: 500 }
      )
    }

    const rateLimit = (Array.isArray(rateLimitData) ? rateLimitData[0] : rateLimitData) as RateLimitResult

    if (!rateLimit?.allowed) {
      const messages: Record<string, string> = {
        rate_limited: 'Too many submissions. Please wait a few minutes.',
        cooldown: 'Please wait 30 seconds between submissions.',
        game_score_locked: 'This game\'s score is locked. Only trusted reporters can update it.',
        game_not_active: 'Scores can only be submitted for active games.',
        game_not_found: 'Game not found.',
        global_rate_limited: 'Too many submissions across games. Please wait a few minutes.',
      }
      return NextResponse.json(
        { error: 'Submission not allowed', message: messages[rateLimit?.reason] || rateLimit?.reason },
        { status: 429 }
      )
    }

    // 5. Get user role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: roleData, error: roleError } = await (supabase.rpc as any)('get_submission_role', { p_user_id: user.id })

    if (roleError) {
      console.error('Role lookup error:', roleError)
      return NextResponse.json(
        { error: 'Failed to determine user role', message: roleError.message },
        { status: 500 }
      )
    }

    const userRole = (roleData as string) || 'general'
    const isTrustedOrHigher = ['trusted_reporter', 'admin', 'super_admin'].includes(userRole)

    // 6. Get current game state
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, home_score, away_score, status, is_verified, official_submission_id, golden_game, sport:sports(code)')
      .eq('id', gameId)
      .single()

    if (gameError || !game) {
      return NextResponse.json(
        { error: 'Game not found', message: 'The specified game does not exist' },
        { status: 404 }
      )
    }

    const gameData = game as unknown as GameRow

    // 6b. Block submissions for non-active games (defense in depth — SQL also checks)
    if (!['scheduled', 'in_progress'].includes(gameData.status)) {
      return NextResponse.json(
        { error: 'Game not active', message: 'Scores can only be submitted for active games' },
        { status: 400 }
      )
    }

    // 6c. Sport-specific score validation
    const sportCode = gameData.sport?.code
    if (sportCode && !isScoreReasonable(home_score, away_score, sportCode)) {
      return NextResponse.json(
        { error: 'Invalid scores', message: 'Scores are outside the reasonable range for this sport' },
        { status: 400 }
      )
    }

    // 7. Calculate points — simplified 1:1 system
    // 1 point per submission, +1 for first reporter, 3x for golden game
    const MAX_POINTS_PER_GAME = 3
    const MAX_DAILY_SUBMISSION_POINTS = 50

    // Query points already earned for this game by this user
    const { data: existingPoints } = await supabase
      .from('submissions')
      .select('points_earned')
      .eq('game_id', gameId)
      .eq('user_id', user.id)
      .in('status', ['published', 'pending'])

    const currentGamePoints = (existingPoints || []).reduce(
      (sum, s) => sum + ((s as { points_earned: number }).points_earned || 0),
      0
    )

    // Query daily submission points (Hawaii day boundaries: midnight HST = 10:00 UTC)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dailyPointsData } = await (supabase.rpc as any)('get_daily_submission_points', {
      p_user_id: user.id,
    })
    const currentDailyPoints = (dailyPointsData as number) || 0
    const remainingDailyCap = Math.max(0, MAX_DAILY_SUBMISSION_POINTS - currentDailyPoints)

    // Base: 1 point per submission
    const basePoints = 1

    // Check if first to report for this game (any user, any status)
    const { count: priorSubmissionCount } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('game_id', gameId)
      .neq('user_id', user.id)

    const isFirstToReport = (priorSubmissionCount ?? 0) === 0
    const firstToReportBonus = isFirstToReport ? 1 : 0

    // Golden game multiplier (3x)
    const goldenGameMultiplier = gameData.golden_game ? 3 : 1

    const subtotal = basePoints + firstToReportBonus
    const remainingGameCap = Math.max(0, MAX_POINTS_PER_GAME - currentGamePoints)
    const totalPoints = Math.min(
      Math.round(subtotal * goldenGameMultiplier),
      remainingGameCap,
      remainingDailyCap
    )

    // 8. Create submission record
    const submissionStatus = isTrustedOrHigher ? 'published' : 'pending'
    const promotionReason = isTrustedOrHigher ? `${userRole}_instant` : null

    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        game_id: gameId,
        user_id: user.id,
        submission_type,
        period: submission_type === 'final_score' ? null : period,
        home_score,
        away_score,
        time_remaining: time_remaining || null,
        photo_url: photo_url || null,
        at_game,
        is_overtime: is_overtime || false,
        overtime_count: overtime_count || 0,
        status: submissionStatus,
        submitted_by_role: userRole,
        promoted_at: isTrustedOrHigher ? new Date().toISOString() : null,
        promotion_reason: promotionReason,
        points_earned: totalPoints,
      } as never)
      .select()
      .single()

    if (submissionError) {
      console.error('Submission creation error:', submissionError)
      return NextResponse.json(
        { error: 'Failed to create submission', message: submissionError.message },
        { status: 500 }
      )
    }

    const submissionData = submission as unknown as SubmissionRow

    // 9. If trusted or higher: update game immediately
    if (isTrustedOrHigher) {
      // Determine new game status
      const newStatus = submission_type === 'final_score' ? 'final' : 'in_progress'

      // Update game with verified score
      const { error: gameUpdateError } = await supabase
        .from('games')
        .update({
          home_score,
          away_score,
          status: newStatus,
          current_period: submission_type === 'final_score' ? null : period,
          time_remaining: submission_type === 'final_score' ? null : time_remaining,
          is_overtime,
          overtime_count,
          is_verified: true,
          verified_at: new Date().toISOString(),
          verified_by_user_id: user.id,
          official_submission_id: submissionData.id,
          last_score_update_at: new Date().toISOString(),
          verification_method: 'trusted',
          score_locked: submission_type === 'final_score',
        } as never)
        .eq('id', gameId)

      if (gameUpdateError) {
        console.error('Game update error:', gameUpdateError)
        // Game update failed — revert submission to pending so the cron job can retry
        await supabase
          .from('submissions')
          .update({ status: 'pending', promoted_at: null, promotion_reason: null } as never)
          .eq('id', submissionData.id)

        return NextResponse.json({
          success: true,
          submission: {
            id: submissionData.id,
            status: 'pending',
            points_earned: totalPoints,
          },
          game_updated: false,
          is_verified: false,
          message: 'Score submitted but game update failed. It will be promoted automatically.',
        })
      }

      // Mark any other pending submissions as superseded
      const { error: rejectError } = await supabase
        .from('submissions')
        .update({ status: 'rejected' } as never)
        .eq('game_id', gameId)
        .eq('status', 'pending')
        .neq('id', submissionData.id)

      if (rejectError) {
        console.error('Failed to reject other pending submissions:', rejectError)
      }

      // Log the promotion
      const { error: logError } = await supabase
        .from('score_promotion_log')
        .insert({
          game_id: gameId,
          submission_id: submissionData.id,
          promotion_type: `${userRole}_instant`,
          home_score,
          away_score,
          promoted_by_user_id: user.id,
          previous_home_score: gameData.home_score,
          previous_away_score: gameData.away_score,
          previous_submission_id: gameData.official_submission_id,
          metadata: {
            submission_type,
            period,
            at_game,
          },
        } as never)

      if (logError) {
        console.error('Failed to log score promotion:', logError)
      }
    }

    // 10. Award points (only for published submissions — pending ones get points when promoted)
    if (submissionStatus === 'published') {
      const pointsBreakdown = {
        base: basePoints,
        first_to_report: firstToReportBonus,
        golden_game_multiplier: goldenGameMultiplier,
        submission_type,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: pointsError } = await (supabase.rpc as any)('award_points', {
        p_user_id: user.id,
        p_event_type: 'submission',
        p_points: totalPoints,
        p_source_type: 'submission',
        p_source_id: submissionData.id,
        p_metadata: pointsBreakdown,
      })

      if (pointsError) {
        console.error('Points award error:', pointsError)
        // Non-fatal: submission was saved, but log for investigation
      }
    }

    // 11. Return response
    return NextResponse.json({
      success: true,
      submission: {
        id: submissionData.id,
        status: submissionStatus,
        points_earned: totalPoints,
      },
      game_updated: isTrustedOrHigher,
      is_verified: isTrustedOrHigher,
      message: isTrustedOrHigher
        ? 'Score submitted and verified immediately'
        : 'Score submitted and pending verification. It will become official after 60 seconds if no conflicts.',
    })
  } catch (error) {
    console.error('Score submission error:', error)
    return NextResponse.json(
      {
        error: 'Failed to submit score',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
