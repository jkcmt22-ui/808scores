import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    if (home_score < 0 || away_score < 0) {
      return NextResponse.json(
        { error: 'Invalid scores', message: 'Scores cannot be negative' },
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
      }
      return NextResponse.json(
        { error: 'Submission not allowed', message: messages[rateLimit?.reason] || rateLimit?.reason },
        { status: 429 }
      )
    }

    // 5. Get user role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: roleData } = await (supabase.rpc as any)('get_submission_role', { p_user_id: user.id })

    const userRole = (roleData as string) || 'general'
    const isTrustedOrHigher = ['trusted_reporter', 'admin', 'super_admin'].includes(userRole)

    // 6. Get current game state
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, home_score, away_score, status, is_verified, official_submission_id')
      .eq('id', gameId)
      .single()

    if (gameError || !game) {
      return NextResponse.json(
        { error: 'Game not found', message: 'The specified game does not exist' },
        { status: 404 }
      )
    }

    const gameData = game as unknown as GameRow

    // 7. Calculate points
    let basePoints = 0
    if (submission_type === 'final_score') basePoints = 10
    else if (submission_type === 'period_score') basePoints = 5
    else if (submission_type === 'live_update') basePoints = 5

    const photoBonus = photo_url ? 3 : 0
    const locationBonus = at_game ? 2 : 0
    const totalPoints = basePoints + photoBonus + locationBonus

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
      await supabase
        .from('submissions')
        .update({ status: 'rejected' } as never)
        .eq('game_id', gameId)
        .eq('status', 'pending')
        .neq('id', submissionData.id)

      // Log the promotion
      await supabase
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
    }

    // 10. Award points
    const pointsBreakdown = {
      base: basePoints,
      photo_bonus: photoBonus,
      location_bonus: locationBonus,
      submission_type,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.rpc as any)('award_points', {
      p_user_id: user.id,
      p_event_type: 'submission',
      p_points: totalPoints,
      p_source_type: 'submission',
      p_source_id: submissionData.id,
      p_metadata: pointsBreakdown,
    })

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
