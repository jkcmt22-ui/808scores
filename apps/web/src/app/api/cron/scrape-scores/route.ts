import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { scrapeAllSports, ScrapedGame } from '@/lib/scraper/scoringlive'
import { getActiveSports } from '@/lib/scraper/mappings'

// Create Supabase client lazily (not at module load time)
function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(url, key)
}

// Verify cron secret for Vercel Cron
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // SECURITY: Require CRON_SECRET in all environments
  if (!cronSecret) {
    console.error('CRON_SECRET not configured - request denied for security')
    return false
  }

  return authHeader === `Bearer ${cronSecret}`
}

// Find school ID by short_name
async function findSchoolId(supabase: SupabaseClient, shortName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('schools')
    .select('id')
    .eq('short_name', shortName)
    .single()

  if (error || !data) {
    console.error(`School not found: ${shortName}`, error)
    return null
  }

  return data.id
}

// Check if game already exists (by external_id first, then by teams and date)
async function findExistingGame(
  supabase: SupabaseClient,
  sportId: string,
  homeTeamId: string,
  awayTeamId: string,
  scheduledAt: Date,
  externalId: string | null
): Promise<string | null> {
  // First try to find by external_id (most reliable)
  if (externalId) {
    const { data: extData } = await supabase
      .from('games')
      .select('id')
      .eq('external_id', externalId)
      .single()

    if (extData) {
      return extData.id
    }
  }

  // Fall back to finding by teams and date
  const startOfDay = new Date(scheduledAt)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(scheduledAt)
  endOfDay.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from('games')
    .select('id')
    .eq('sport_id', sportId)
    .eq('home_team_id', homeTeamId)
    .eq('away_team_id', awayTeamId)
    .gte('scheduled_at', startOfDay.toISOString())
    .lte('scheduled_at', endOfDay.toISOString())
    .single()

  if (error || !data) {
    return null
  }

  return data.id
}

// Map round name to tournament_round enum
function mapRoundToEnum(roundName: string | null): string | null {
  if (!roundName) return null

  const roundMap: Record<string, string> = {
    'Final': 'final',
    'Championship': 'final',
    'Semifinal': 'semifinal',
    'Semi-final': 'semifinal',
    'Quarterfinal': 'quarterfinal',
    'Quarter-final': 'quarterfinal',
    'First Round': 'round_of_16',
    'Second Round': 'quarterfinal',
    'Third Place': 'third_place',
    'Consolation': 'third_place',
  }

  return roundMap[roundName] || null
}

// Find matching tournament for a game
async function findMatchingTournament(
  supabase: SupabaseClient,
  sportId: string,
  league: string | null,
  gameDate: Date,
  gameType: string
): Promise<string | null> {
  if (gameType === 'regular_season') return null

  // Look for tournaments that match sport, league, and date range
  let query = supabase
    .from('tournaments')
    .select('id, name, league, start_date, end_date')
    .eq('sport_id', sportId)
    .lte('start_date', gameDate.toISOString().split('T')[0])

  // Filter by league if available
  if (league) {
    query = query.eq('league', league)
  }

  const { data: tournaments } = await query

  if (!tournaments || tournaments.length === 0) return null

  // Find the best match - tournament where game date falls within range
  const gameDateStr = gameDate.toISOString().split('T')[0]

  for (const tournament of tournaments) {
    const startDate = tournament.start_date
    const endDate = tournament.end_date || tournament.start_date

    if (gameDateStr >= startDate && gameDateStr <= endDate) {
      console.log(`Matched game to tournament: ${tournament.name}`)
      return tournament.id
    }
  }

  // If no exact date match, return first matching tournament (closest by start date)
  return tournaments[0]?.id || null
}

// Send playoff notification
async function sendPlayoffNotification(
  gameId: string,
  homeTeamId: string,
  awayTeamId: string,
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number,
  status: string,
  gameType: string,
  sportName?: string
) {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    await fetch(`${baseUrl}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhookSecret ? { 'Authorization': `Bearer ${webhookSecret}` } : {})
      },
      body: JSON.stringify({
        gameId,
        homeTeam,
        awayTeam,
        homeTeamId,
        awayTeamId,
        homeScore,
        awayScore,
        status,
        gameType,
        notificationType: 'playoff_alert',
        sportName
      })
    })
    console.log(`Sent playoff notification for game ${gameId}`)
  } catch (error) {
    console.error('Failed to send playoff notification:', error)
  }
}

// Upsert game in database
async function upsertGame(
  supabase: SupabaseClient,
  game: ScrapedGame
): Promise<{
  action: 'inserted' | 'updated' | 'skipped'
  id?: string
  homeTeamId?: string
  awayTeamId?: string
  scoreChanged?: boolean
  previousStatus?: string
}> {
  // Find team IDs
  const homeTeamId = await findSchoolId(supabase, game.homeTeam)
  const awayTeamId = await findSchoolId(supabase, game.awayTeam)

  if (!homeTeamId || !awayTeamId) {
    console.warn(`Skipping game - missing team: ${game.awayTeam} @ ${game.homeTeam}`)
    return { action: 'skipped', homeTeamId: undefined, awayTeamId: undefined }
  }

  // Find matching tournament for playoff/championship games
  const tournamentId = await findMatchingTournament(
    supabase,
    game.sportId,
    game.league,
    game.scheduledAt,
    game.gameType
  )

  // Map round name to enum
  const tournamentRound = mapRoundToEnum(game.roundName)

  // Check if game exists
  const existingGameId = await findExistingGame(
    supabase,
    game.sportId,
    homeTeamId,
    awayTeamId,
    game.scheduledAt,
    game.externalId
  )

  if (existingGameId) {
    // Fetch existing game to check for score changes
    const { data: existingGame } = await supabase
      .from('games')
      .select('home_score, away_score, status')
      .eq('id', existingGameId)
      .single()

    const previousStatus = existingGame?.status
    const scoreChanged = existingGame
      ? (existingGame.home_score !== (game.homeScore ?? 0) ||
         existingGame.away_score !== (game.awayScore ?? 0) ||
         existingGame.status !== game.status)
      : false

    // Update existing game
    const { error } = await supabase
      .from('games')
      .update({
        scheduled_at: game.scheduledAt.toISOString(),
        status: game.status,
        home_score: game.homeScore ?? 0,
        away_score: game.awayScore ?? 0,
        venue: game.venue,
        is_verified: game.status === 'final',
        verification_method: game.status === 'final' ? 'trusted' : null,
        updated_at: new Date().toISOString(),
        external_id: game.externalId,
        source: 'scoringlive',
        game_type: game.gameType,
        tournament_id: tournamentId,
        tournament_round: tournamentRound,
      })
      .eq('id', existingGameId)

    if (error) {
      console.error(`Failed to update game ${existingGameId}:`, error)
      return { action: 'skipped', homeTeamId, awayTeamId }
    }

    return {
      action: 'updated',
      id: existingGameId,
      homeTeamId,
      awayTeamId,
      scoreChanged,
      previousStatus
    }
  } else {
    // Insert new game
    const { data, error } = await supabase
      .from('games')
      .insert({
        sport_id: game.sportId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        scheduled_at: game.scheduledAt.toISOString(),
        venue: game.venue,
        status: game.status,
        home_score: game.homeScore ?? 0,
        away_score: game.awayScore ?? 0,
        is_verified: game.status === 'final',
        verification_method: game.status === 'final' ? 'trusted' : null,
        game_type: game.gameType,
        external_id: game.externalId,
        source: 'scoringlive',
        tournament_id: tournamentId,
        tournament_round: tournamentRound,
      })
      .select('id')
      .single()

    if (error) {
      console.error(`Failed to insert game:`, error)
      return { action: 'skipped', homeTeamId, awayTeamId }
    }

    return {
      action: 'inserted',
      id: data.id,
      homeTeamId,
      awayTeamId,
      scoreChanged: game.status === 'in_progress' || game.status === 'final'
    }
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('Starting score scrape...')
  const startTime = Date.now()

  try {
    // Get Supabase client
    const supabase = getSupabase()

    // Get active sports for current season
    const activeSports = getActiveSports()
    console.log(`Active sports for current season: ${activeSports.join(', ')}`)

    if (activeSports.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active sports for current season',
        stats: { scraped: 0, inserted: 0, updated: 0, skipped: 0 }
      })
    }

    // Scrape all active sports
    const games = await scrapeAllSports(activeSports)
    console.log(`Scraped ${games.length} total games`)

    // Process each game
    const stats = {
      scraped: games.length,
      inserted: 0,
      updated: 0,
      skipped: 0,
      playoffNotifications: 0,
    }

    // Collect playoff games to send notifications for
    const playoffGamesToNotify: Array<{
      gameId: string
      game: ScrapedGame
      homeTeamId: string
      awayTeamId: string
    }> = []

    for (const game of games) {
      const result = await upsertGame(supabase, game)
      stats[result.action]++

      // Check if this game should trigger notifications
      const isPlayoffGame = game.gameType === 'playoff' || game.gameType === 'championship' || game.gameType === 'tournament'
      const isRegularSeason = game.gameType === 'regular_season'
      const hasScoreActivity = game.status === 'in_progress' || game.status === 'final'

      // Send notifications for playoff games OR regular season games (regular season will be filtered to opted-in users)
      if ((isPlayoffGame || isRegularSeason) && hasScoreActivity && result.scoreChanged && result.id && result.homeTeamId && result.awayTeamId) {
        playoffGamesToNotify.push({
          gameId: result.id,
          game,
          homeTeamId: result.homeTeamId,
          awayTeamId: result.awayTeamId
        })
      }
    }

    // Send playoff notifications asynchronously (don't wait)
    for (const { gameId, game, homeTeamId, awayTeamId } of playoffGamesToNotify) {
      // Get sport name for notification
      const { data: sportData } = await supabase
        .from('sports')
        .select('display_name, name')
        .eq('id', game.sportId)
        .single()

      const sportName = sportData?.display_name || sportData?.name

      await sendPlayoffNotification(
        gameId,
        homeTeamId,
        awayTeamId,
        game.homeTeam,
        game.awayTeam,
        game.homeScore ?? 0,
        game.awayScore ?? 0,
        game.status,
        game.gameType,
        sportName
      )
      stats.playoffNotifications++
    }

    const duration = Date.now() - startTime

    console.log(`Scrape complete in ${duration}ms:`, stats)
    if (playoffGamesToNotify.length > 0) {
      console.log(`Sent ${playoffGamesToNotify.length} playoff notifications`)
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${games.length} games`,
      stats,
      duration: `${duration}ms`,
    })
  } catch (error) {
    console.error('Scrape failed:', error)
    return NextResponse.json(
      { error: 'Scrape failed', details: String(error) },
      { status: 500 }
    )
  }
}

// Also allow POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
