/**
 * Seed upcoming Hawaii high school tournaments
 * Run with: npx tsx --env-file=.env.local scripts/seed-tournaments.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

interface TournamentSeed {
  name: string
  sportCode: string
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'pool_play'
  startDate: string
  endDate?: string
  venue?: string
  island?: string
  league: string
  division: string
  season: string
  numTeams: number
  teams?: { shortName: string; seed: number }[]
}

// 2025-26 State Championships (HHSAA)
const upcomingTournaments: TournamentSeed[] = [
  // Boys Basketball - Division I State Championship
  {
    name: '2026 HHSAA Boys Basketball Division I State Championship',
    sportCode: 'boys-basketball',
    format: 'single_elimination',
    startDate: '2026-02-19',
    endDate: '2026-02-22',
    venue: 'Neal Blaisdell Arena',
    island: 'Oahu',
    league: 'HHSAA',
    division: 'Division I',
    season: '2025-26',
    numTeams: 8,
    // Seeds TBD - will be determined after league playoffs
  },
  // Boys Basketball - Division II State Championship
  {
    name: '2026 HHSAA Boys Basketball Division II State Championship',
    sportCode: 'boys-basketball',
    format: 'single_elimination',
    startDate: '2026-02-19',
    endDate: '2026-02-22',
    venue: 'Neal Blaisdell Arena',
    island: 'Oahu',
    league: 'HHSAA',
    division: 'Division II',
    season: '2025-26',
    numTeams: 8,
  },
  // Girls Basketball - Division I State Championship
  {
    name: '2026 HHSAA Girls Basketball Division I State Championship',
    sportCode: 'girls-basketball',
    format: 'single_elimination',
    startDate: '2026-02-19',
    endDate: '2026-02-22',
    venue: 'Neal Blaisdell Arena',
    island: 'Oahu',
    league: 'HHSAA',
    division: 'Division I',
    season: '2025-26',
    numTeams: 8,
  },
  // Girls Basketball - Division II State Championship
  {
    name: '2026 HHSAA Girls Basketball Division II State Championship',
    sportCode: 'girls-basketball',
    format: 'single_elimination',
    startDate: '2026-02-19',
    endDate: '2026-02-22',
    venue: 'Neal Blaisdell Arena',
    island: 'Oahu',
    league: 'HHSAA',
    division: 'Division II',
    season: '2025-26',
    numTeams: 8,
  },
  // Boys Soccer - State Championship
  {
    name: '2026 HHSAA Boys Soccer State Championship',
    sportCode: 'boys-soccer',
    format: 'single_elimination',
    startDate: '2026-02-07',
    endDate: '2026-02-15',
    venue: 'Waipio Peninsula Soccer Stadium',
    island: 'Oahu',
    league: 'HHSAA',
    division: 'Open',
    season: '2025-26',
    numTeams: 8,
  },
  // Girls Soccer - State Championship
  {
    name: '2026 HHSAA Girls Soccer State Championship',
    sportCode: 'girls-soccer',
    format: 'single_elimination',
    startDate: '2026-02-07',
    endDate: '2026-02-15',
    venue: 'Waipio Peninsula Soccer Stadium',
    island: 'Oahu',
    league: 'HHSAA',
    division: 'Open',
    season: '2025-26',
    numTeams: 8,
  },
  // OIA Boys Basketball Playoffs (D1)
  {
    name: '2026 OIA Boys Basketball Division I Playoffs',
    sportCode: 'boys-basketball',
    format: 'single_elimination',
    startDate: '2026-02-01',
    endDate: '2026-02-08',
    island: 'Oahu',
    league: 'OIA',
    division: 'Division I',
    season: '2025-26',
    numTeams: 8,
  },
  // OIA Girls Basketball Playoffs (D1)
  {
    name: '2026 OIA Girls Basketball Division I Playoffs',
    sportCode: 'girls-basketball',
    format: 'single_elimination',
    startDate: '2026-02-01',
    endDate: '2026-02-08',
    island: 'Oahu',
    league: 'OIA',
    division: 'Division I',
    season: '2025-26',
    numTeams: 8,
  },
  // ILH Boys Basketball Playoffs
  {
    name: '2026 ILH Boys Basketball Playoffs',
    sportCode: 'boys-basketball',
    format: 'single_elimination',
    startDate: '2026-02-03',
    endDate: '2026-02-10',
    island: 'Oahu',
    league: 'ILH',
    division: 'Open',
    season: '2025-26',
    numTeams: 6,
  },
  // ILH Girls Basketball Playoffs
  {
    name: '2026 ILH Girls Basketball Playoffs',
    sportCode: 'girls-basketball',
    format: 'single_elimination',
    startDate: '2026-02-03',
    endDate: '2026-02-10',
    island: 'Oahu',
    league: 'ILH',
    division: 'Open',
    season: '2025-26',
    numTeams: 6,
  },
  // BIIF Boys Basketball Playoffs (Big Island)
  {
    name: '2026 BIIF Boys Basketball Playoffs',
    sportCode: 'boys-basketball',
    format: 'single_elimination',
    startDate: '2026-02-01',
    endDate: '2026-02-08',
    island: 'Hawaii',
    league: 'BIIF',
    division: 'Open',
    season: '2025-26',
    numTeams: 8,
  },
  // BIIF Girls Basketball Playoffs
  {
    name: '2026 BIIF Girls Basketball Playoffs',
    sportCode: 'girls-basketball',
    format: 'single_elimination',
    startDate: '2026-02-01',
    endDate: '2026-02-08',
    island: 'Hawaii',
    league: 'BIIF',
    division: 'Open',
    season: '2025-26',
    numTeams: 8,
  },
  // BIIF Boys Soccer Playoffs
  {
    name: '2026 BIIF Boys Soccer Playoffs',
    sportCode: 'boys-soccer',
    format: 'single_elimination',
    startDate: '2026-01-25',
    endDate: '2026-02-01',
    island: 'Hawaii',
    league: 'BIIF',
    division: 'Open',
    season: '2025-26',
    numTeams: 6,
  },
  // BIIF Girls Soccer Playoffs
  {
    name: '2026 BIIF Girls Soccer Playoffs',
    sportCode: 'girls-soccer',
    format: 'single_elimination',
    startDate: '2026-01-25',
    endDate: '2026-02-01',
    island: 'Hawaii',
    league: 'BIIF',
    division: 'Open',
    season: '2025-26',
    numTeams: 6,
  },
  // MIL Boys Basketball Playoffs (Maui)
  {
    name: '2026 MIL Boys Basketball Playoffs',
    sportCode: 'boys-basketball',
    format: 'single_elimination',
    startDate: '2026-02-01',
    endDate: '2026-02-08',
    island: 'Maui',
    league: 'MIL',
    division: 'Open',
    season: '2025-26',
    numTeams: 6,
  },
  // MIL Girls Basketball Playoffs
  {
    name: '2026 MIL Girls Basketball Playoffs',
    sportCode: 'girls-basketball',
    format: 'single_elimination',
    startDate: '2026-02-01',
    endDate: '2026-02-08',
    island: 'Maui',
    league: 'MIL',
    division: 'Open',
    season: '2025-26',
    numTeams: 6,
  },
  // MIL Boys Soccer Playoffs
  {
    name: '2026 MIL Boys Soccer Playoffs',
    sportCode: 'boys-soccer',
    format: 'single_elimination',
    startDate: '2026-01-25',
    endDate: '2026-02-01',
    island: 'Maui',
    league: 'MIL',
    division: 'Open',
    season: '2025-26',
    numTeams: 6,
  },
  // MIL Girls Soccer Playoffs
  {
    name: '2026 MIL Girls Soccer Playoffs',
    sportCode: 'girls-soccer',
    format: 'single_elimination',
    startDate: '2026-01-25',
    endDate: '2026-02-01',
    island: 'Maui',
    league: 'MIL',
    division: 'Open',
    season: '2025-26',
    numTeams: 6,
  },
  // KIF Boys Basketball Playoffs (Kauai)
  {
    name: '2026 KIF Boys Basketball Playoffs',
    sportCode: 'boys-basketball',
    format: 'single_elimination',
    startDate: '2026-02-01',
    endDate: '2026-02-08',
    island: 'Kauai',
    league: 'KIF',
    division: 'Open',
    season: '2025-26',
    numTeams: 4,
  },
  // KIF Girls Basketball Playoffs
  {
    name: '2026 KIF Girls Basketball Playoffs',
    sportCode: 'girls-basketball',
    format: 'single_elimination',
    startDate: '2026-02-01',
    endDate: '2026-02-08',
    island: 'Kauai',
    league: 'KIF',
    division: 'Open',
    season: '2025-26',
    numTeams: 4,
  },
  // KIF Boys Soccer Playoffs
  {
    name: '2026 KIF Boys Soccer Playoffs',
    sportCode: 'boys-soccer',
    format: 'single_elimination',
    startDate: '2026-01-25',
    endDate: '2026-02-01',
    island: 'Kauai',
    league: 'KIF',
    division: 'Open',
    season: '2025-26',
    numTeams: 4,
  },
  // KIF Girls Soccer Playoffs
  {
    name: '2026 KIF Girls Soccer Playoffs',
    sportCode: 'girls-soccer',
    format: 'single_elimination',
    startDate: '2026-01-25',
    endDate: '2026-02-01',
    island: 'Kauai',
    league: 'KIF',
    division: 'Open',
    season: '2025-26',
    numTeams: 4,
  },
]

async function getSportId(code: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('sports')
    .select('id')
    .eq('code', code)
    .single()

  if (error || !data) {
    console.error(`Sport not found: ${code}`)
    return null
  }

  return data.id
}

async function getSchoolId(shortName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('schools')
    .select('id')
    .eq('short_name', shortName)
    .single()

  if (error || !data) {
    console.error(`School not found: ${shortName}`)
    return null
  }

  return data.id
}

async function seedTournaments() {
  console.log('Seeding tournaments...\n')

  let created = 0
  let skipped = 0

  for (const tournament of upcomingTournaments) {
    // Get sport ID
    const sportId = await getSportId(tournament.sportCode)
    if (!sportId) {
      console.log(`Skipping ${tournament.name} - sport not found`)
      skipped++
      continue
    }

    // Check if tournament already exists
    const { data: existing } = await supabase
      .from('tournaments')
      .select('id')
      .eq('name', tournament.name)
      .eq('season', tournament.season)
      .single()

    if (existing) {
      console.log(`Already exists: ${tournament.name}`)
      skipped++
      continue
    }

    // Create tournament
    const { data: newTournament, error: createError } = await supabase
      .from('tournaments')
      .insert({
        name: tournament.name,
        sport_id: sportId,
        format: tournament.format,
        status: 'upcoming',
        start_date: tournament.startDate,
        end_date: tournament.endDate || null,
        venue: tournament.venue || null,
        island: tournament.island || null,
        league: tournament.league,
        division: tournament.division,
        season: tournament.season,
        num_teams: tournament.numTeams,
      })
      .select()
      .single()

    if (createError) {
      console.error(`Error creating ${tournament.name}:`, createError.message)
      skipped++
      continue
    }

    console.log(`Created: ${tournament.name}`)
    created++

    // Add teams if specified
    if (tournament.teams && tournament.teams.length > 0) {
      for (const team of tournament.teams) {
        const schoolId = await getSchoolId(team.shortName)
        if (!schoolId) continue

        await supabase
          .from('tournament_teams')
          .insert({
            tournament_id: newTournament.id,
            school_id: schoolId,
            seed: team.seed,
          })
      }
      console.log(`  Added ${tournament.teams.length} teams`)
    }
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`)
}

seedTournaments().catch(console.error)
