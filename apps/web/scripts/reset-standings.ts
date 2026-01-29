/**
 * Reset Standings Script
 *
 * Safely resets all standings configuration in local/dev environment.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/reset-standings.ts           # Dry run (safe)
 *   npx tsx --env-file=.env.local scripts/reset-standings.ts --execute # Actually reset
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'MISSING')
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'set' : 'MISSING')
  console.error('\nRun with: npx tsx --env-file=.env.local scripts/reset-standings.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const isExecute = process.argv.includes('--execute')

async function getAffectedCounts() {
  // Count teams with standings configuration
  const { count: teamsWithLeague } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })
    .not('league', 'is', null)

  const { count: teamsWithDivision } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })
    .not('division', 'is', null)

  const { count: teamsWithRegion } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })
    .not('region', 'is', null)

  // Count season_standings rows
  const { count: standingsCount } = await supabase
    .from('season_standings')
    .select('*', { count: 'exact', head: true })

  return {
    teamsWithLeague: teamsWithLeague ?? 0,
    teamsWithDivision: teamsWithDivision ?? 0,
    teamsWithRegion: teamsWithRegion ?? 0,
    standingsCount: standingsCount ?? 0,
  }
}

async function exportBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupsDir = path.join(process.cwd(), 'backups')

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true })
  }

  const backupPath = path.join(backupsDir, `standings-${timestamp}.sql`)

  // Get all teams with standings config
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, league, division, region')
    .or('league.not.is.null,division.not.is.null,region.not.is.null')

  if (teamsError) {
    console.error('Error fetching teams:', teamsError.message)
    return null
  }

  // Get all season_standings
  const { data: standings, error: standingsError } = await supabase
    .from('season_standings')
    .select('*')

  if (standingsError) {
    console.error('Error fetching season_standings:', standingsError.message)
    return null
  }

  // Generate restore SQL
  let sql = `-- Standings Backup: ${timestamp}\n`
  sql += `-- This file can be used to restore standings after a reset\n\n`

  // Teams restore
  if (teams && teams.length > 0) {
    sql += `-- Restore teams standings configuration (${teams.length} teams)\n`
    for (const team of teams) {
      const league = team.league ? `'${team.league}'` : 'NULL'
      const division = team.division ? `'${team.division}'` : 'NULL'
      const region = team.region ? `'${team.region}'` : 'NULL'
      sql += `UPDATE teams SET league = ${league}, division = ${division}, region = ${region} WHERE id = '${team.id}';\n`
    }
    sql += '\n'
  }

  // Season standings restore
  if (standings && standings.length > 0) {
    sql += `-- Restore season_standings (${standings.length} rows)\n`
    for (const s of standings) {
      sql += `INSERT INTO season_standings (id, school_id, sport_id, season_year, league, league_wins, league_losses, league_ties, overall_wins, overall_losses, overall_ties, points, created_at, updated_at) VALUES (\n`
      sql += `  '${s.id}',\n`
      sql += `  '${s.school_id}',\n`
      sql += `  '${s.sport_id}',\n`
      sql += `  ${s.season_year},\n`
      sql += `  ${s.league ? `'${s.league}'` : 'NULL'},\n`
      sql += `  ${s.league_wins ?? 0},\n`
      sql += `  ${s.league_losses ?? 0},\n`
      sql += `  ${s.league_ties ?? 0},\n`
      sql += `  ${s.overall_wins ?? 0},\n`
      sql += `  ${s.overall_losses ?? 0},\n`
      sql += `  ${s.overall_ties ?? 0},\n`
      sql += `  ${s.points ?? 0},\n`
      sql += `  '${s.created_at}',\n`
      sql += `  '${s.updated_at}'\n`
      sql += `) ON CONFLICT (id) DO UPDATE SET\n`
      sql += `  league = EXCLUDED.league,\n`
      sql += `  league_wins = EXCLUDED.league_wins,\n`
      sql += `  league_losses = EXCLUDED.league_losses,\n`
      sql += `  league_ties = EXCLUDED.league_ties,\n`
      sql += `  overall_wins = EXCLUDED.overall_wins,\n`
      sql += `  overall_losses = EXCLUDED.overall_losses,\n`
      sql += `  overall_ties = EXCLUDED.overall_ties,\n`
      sql += `  points = EXCLUDED.points;\n\n`
    }
  }

  fs.writeFileSync(backupPath, sql)
  return backupPath
}

async function executeReset() {
  console.log('\nExecuting reset...\n')

  // Update teams: set league, division, region to NULL
  const { error: teamsError } = await supabase
    .from('teams')
    .update({ league: null, division: null, region: null })
    .or('league.not.is.null,division.not.is.null,region.not.is.null')

  if (teamsError) {
    console.error('Error updating teams:', teamsError.message)
    return false
  }

  // Verify the update
  const { count: remainingTeams } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })
    .not('league', 'is', null)

  console.log(`  Updated teams (${remainingTeams ?? 0} still have league set - should be 0)`)

  // Delete all season_standings
  const { error: standingsError } = await supabase
    .from('season_standings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Match all rows

  if (standingsError) {
    console.error('Error deleting season_standings:', standingsError.message)
    return false
  }

  // Verify the delete
  const { count: remainingStandings } = await supabase
    .from('season_standings')
    .select('*', { count: 'exact', head: true })

  console.log(`  Deleted season_standings (${remainingStandings ?? 0} remaining - should be 0)`)

  return true
}

async function main() {
  console.log('='.repeat(60))
  console.log('  STANDINGS RESET SCRIPT')
  console.log('='.repeat(60))
  console.log()
  console.log(`Mode: ${isExecute ? 'EXECUTE (will make changes)' : 'DRY RUN (safe, no changes)'}`)
  console.log()

  // Get affected counts
  console.log('Analyzing affected data...\n')
  const counts = await getAffectedCounts()

  console.log('Tables to be affected:')
  console.log('-'.repeat(40))
  console.log(`  teams (league column):    ${counts.teamsWithLeague} rows`)
  console.log(`  teams (division column):  ${counts.teamsWithDivision} rows`)
  console.log(`  teams (region column):    ${counts.teamsWithRegion} rows`)
  console.log(`  season_standings:         ${counts.standingsCount} rows to DELETE`)
  console.log()

  const totalAffected = counts.teamsWithLeague + counts.teamsWithDivision +
                        counts.teamsWithRegion + counts.standingsCount

  if (totalAffected === 0) {
    console.log('No standings data to reset. Nothing to do.')
    return
  }

  console.log('Tables NOT touched:')
  console.log('-'.repeat(40))
  console.log('  games       (source data - preserved)')
  console.log('  schools     (source data - preserved)')
  console.log('  sports      (source data - preserved)')
  console.log()

  if (!isExecute) {
    console.log('='.repeat(60))
    console.log('  DRY RUN COMPLETE')
    console.log('='.repeat(60))
    console.log()
    console.log('To actually reset standings, run with --execute flag:')
    console.log('  npx tsx --env-file=.env.local scripts/reset-standings.ts --execute')
    console.log()
    return
  }

  // Execute mode: create backup first
  console.log('Creating backup before reset...')
  const backupPath = await exportBackup()

  if (backupPath) {
    console.log(`  Backup saved to: ${backupPath}`)
  } else {
    console.error('  Failed to create backup. Aborting.')
    process.exit(1)
  }

  // Execute the reset
  const success = await executeReset()

  if (success) {
    console.log()
    console.log('='.repeat(60))
    console.log('  RESET COMPLETE')
    console.log('='.repeat(60))
    console.log()
    console.log('To restore from backup, run the SQL file in Supabase:')
    console.log(`  ${backupPath}`)
    console.log()
    console.log('Or re-run migration 064 to backfill from schools.')
  } else {
    console.error()
    console.error('Reset failed. Check errors above.')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})
