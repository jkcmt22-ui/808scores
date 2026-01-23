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

  // Allow if no secret configured (development)
  if (!cronSecret) {
    console.warn('CRON_SECRET not configured - allowing request')
    return true
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

// Upsert game in database
async function upsertGame(
  supabase: SupabaseClient,
  game: ScrapedGame
): Promise<{ action: 'inserted' | 'updated' | 'skipped'; id?: string }> {
  // Find team IDs
  const homeTeamId = await findSchoolId(supabase, game.homeTeam)
  const awayTeamId = await findSchoolId(supabase, game.awayTeam)

  if (!homeTeamId || !awayTeamId) {
    console.warn(`Skipping game - missing team: ${game.awayTeam} @ ${game.homeTeam}`)
    return { action: 'skipped' }
  }

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
    // Update existing game
    const { error } = await supabase
      .from('games')
      .update({
        status: game.status,
        home_score: game.homeScore ?? 0,
        away_score: game.awayScore ?? 0,
        venue: game.venue,
        is_verified: game.status === 'final',
        verification_method: game.status === 'final' ? 'trusted' : null,
        updated_at: new Date().toISOString(),
        external_id: game.externalId,
        source: 'scoringlive',
      })
      .eq('id', existingGameId)

    if (error) {
      console.error(`Failed to update game ${existingGameId}:`, error)
      return { action: 'skipped' }
    }

    return { action: 'updated', id: existingGameId }
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
        game_type: 'regular_season',
        external_id: game.externalId,
        source: 'scoringlive',
      })
      .select('id')
      .single()

    if (error) {
      console.error(`Failed to insert game:`, error)
      return { action: 'skipped' }
    }

    return { action: 'inserted', id: data.id }
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
    }

    for (const game of games) {
      const result = await upsertGame(supabase, game)
      stats[result.action]++
    }

    const duration = Date.now() - startTime

    console.log(`Scrape complete in ${duration}ms:`, stats)

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
