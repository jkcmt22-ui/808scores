import type { GameWithTeams, School } from '@/types/database'

export interface TeamStanding {
  school: School
  wins: number
  losses: number
  ties: number
  winPct: number
  pointsFor: number
  pointsAgainst: number
  pointDiff: number
  streak: string
  gamesPlayed: number
  leagueWins: number
  leagueLosses: number
  leagueTies: number
  leagueWinPct: number
  leagueGamesPlayed: number
}

export interface LeagueStandings {
  league: string
  division: string | null
  region: string | null
  displayName: string
  teams: TeamStanding[]
}

interface StandingsOptions {
  leagueOnly?: boolean
}

// Get streak string from recent results
function calculateStreak(results: ('W' | 'L' | 'T')[]): string {
  if (results.length === 0) return '-'

  const lastResult = results[results.length - 1]
  let count = 0

  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i] === lastResult) {
      count++
    } else {
      break
    }
  }

  return `${lastResult}${count}`
}

// Check if two schools are in the same league for league record calculation
function sameLeague(school1: School, school2: School): boolean {
  return school1.league === school2.league
}

// Calculate standings from games
export function calculateStandings(
  games: GameWithTeams[],
  schools: School[],
  options: StandingsOptions = {}
): LeagueStandings[] {
  const { leagueOnly = true } = options

  // Filter to only final games, and only regular season for league standings
  const finalGames = games.filter(game => {
    if (game.status !== 'final') return false
    if (leagueOnly && game.game_type !== 'regular_season') return false
    return true
  })

  // Initialize team stats
  const teamStats = new Map<string, {
    school: School
    wins: number
    losses: number
    ties: number
    pointsFor: number
    pointsAgainst: number
    results: ('W' | 'L' | 'T')[]
    leagueWins: number
    leagueLosses: number
    leagueTies: number
  }>()

  // Initialize all schools
  for (const school of schools) {
    teamStats.set(school.id, {
      school,
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      results: [],
      leagueWins: 0,
      leagueLosses: 0,
      leagueTies: 0
    })
  }

  // Process each game
  for (const game of finalGames) {
    const homeStats = teamStats.get(game.home_team_id)
    const awayStats = teamStats.get(game.away_team_id)

    if (!homeStats || !awayStats) continue

    const homeScore = game.home_score
    const awayScore = game.away_score
    const isLeagueGame = sameLeague(homeStats.school, awayStats.school)

    // Update points
    homeStats.pointsFor += homeScore
    homeStats.pointsAgainst += awayScore
    awayStats.pointsFor += awayScore
    awayStats.pointsAgainst += homeScore

    // Determine winner and update records
    if (homeScore > awayScore) {
      // Home team wins
      homeStats.wins++
      homeStats.results.push('W')
      awayStats.losses++
      awayStats.results.push('L')

      if (isLeagueGame) {
        homeStats.leagueWins++
        awayStats.leagueLosses++
      }
    } else if (awayScore > homeScore) {
      // Away team wins
      awayStats.wins++
      awayStats.results.push('W')
      homeStats.losses++
      homeStats.results.push('L')

      if (isLeagueGame) {
        awayStats.leagueWins++
        homeStats.leagueLosses++
      }
    } else {
      // Tie (common in soccer)
      homeStats.ties++
      homeStats.results.push('T')
      awayStats.ties++
      awayStats.results.push('T')

      if (isLeagueGame) {
        homeStats.leagueTies++
        awayStats.leagueTies++
      }
    }
  }

  // Group schools by league/division/region
  const groupedStandings = new Map<string, TeamStanding[]>()

  for (const [, stats] of teamStats) {
    const { school } = stats
    const gamesPlayed = stats.wins + stats.losses + stats.ties

    // Skip schools with no games played
    if (gamesPlayed === 0) continue

    // Create group key
    const league = school.league || 'Other'
    const division = school.division || null

    // Parse region from division if present (e.g., "Division I East")
    let region: string | null = null
    let cleanDivision = division
    if (division) {
      const regionMatch = division.match(/^(.+?)\s+(East|West)$/i)
      if (regionMatch) {
        cleanDivision = regionMatch[1]
        region = regionMatch[2]
      }
    }

    const groupKey = `${league}|${cleanDivision || ''}|${region || ''}`

    if (!groupedStandings.has(groupKey)) {
      groupedStandings.set(groupKey, [])
    }

    const winPct = gamesPlayed > 0
      ? (stats.wins + stats.ties * 0.5) / gamesPlayed
      : 0

    const leagueGamesPlayed = stats.leagueWins + stats.leagueLosses + stats.leagueTies
    const leagueWinPct = leagueGamesPlayed > 0
      ? (stats.leagueWins + stats.leagueTies * 0.5) / leagueGamesPlayed
      : 0

    groupedStandings.get(groupKey)!.push({
      school,
      wins: stats.wins,
      losses: stats.losses,
      ties: stats.ties,
      winPct,
      pointsFor: stats.pointsFor,
      pointsAgainst: stats.pointsAgainst,
      pointDiff: stats.pointsFor - stats.pointsAgainst,
      streak: calculateStreak(stats.results),
      gamesPlayed,
      leagueWins: stats.leagueWins,
      leagueLosses: stats.leagueLosses,
      leagueTies: stats.leagueTies,
      leagueWinPct,
      leagueGamesPlayed
    })
  }

  // Convert to array and sort
  const result: LeagueStandings[] = []

  for (const [groupKey, teams] of groupedStandings) {
    const [league, division, region] = groupKey.split('|')

    // Sort teams by: league win%, then league wins, then overall win%, then point differential
    teams.sort((a, b) => {
      if (b.leagueWinPct !== a.leagueWinPct) return b.leagueWinPct - a.leagueWinPct
      if (b.leagueWins !== a.leagueWins) return b.leagueWins - a.leagueWins
      if (b.winPct !== a.winPct) return b.winPct - a.winPct
      if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff
      return b.pointsFor - a.pointsFor
    })

    // Create display name
    let displayName = league
    if (division) {
      displayName += ` ${division}`
    }
    if (region) {
      displayName += ` ${region}`
    }

    result.push({
      league,
      division: division || null,
      region: region || null,
      displayName,
      teams
    })
  }

  // Sort groups by league name, then division, then region
  result.sort((a, b) => {
    const leagueOrder = ['OIA', 'ILH', 'BIIF', 'MIL', 'KIF', 'Other']
    const aLeagueIdx = leagueOrder.indexOf(a.league)
    const bLeagueIdx = leagueOrder.indexOf(b.league)

    if (aLeagueIdx !== bLeagueIdx) {
      return (aLeagueIdx === -1 ? 999 : aLeagueIdx) - (bLeagueIdx === -1 ? 999 : bLeagueIdx)
    }

    // Open division first, then Division I, II, III
    const divOrder = ['Open', 'Division I', 'Division II', 'Division III']
    const aDivIdx = a.division ? divOrder.indexOf(a.division) : -1
    const bDivIdx = b.division ? divOrder.indexOf(b.division) : -1

    if (aDivIdx !== bDivIdx) {
      return (aDivIdx === -1 ? 999 : aDivIdx) - (bDivIdx === -1 ? 999 : bDivIdx)
    }

    // East before West
    if (a.region && b.region) {
      return a.region.localeCompare(b.region)
    }

    return 0
  })

  return result
}
