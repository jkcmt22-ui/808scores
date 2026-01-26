// ScoringLive.com scraper for Hawaii high school sports
import * as cheerio from 'cheerio'
import { SCHOOL_NAME_MAP, SPORT_URL_MAP, SPORT_IDS } from './mappings'

const BASE_URL = 'https://scoringlive.com'

export interface ScrapedGame {
  sportCode: string
  sportId: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  scheduledAt: Date
  venue: string | null
  status: 'scheduled' | 'in_progress' | 'final'
  externalId: string | null
  league: string | null
  // Tournament/playoff info
  gameType: 'regular_season' | 'playoff' | 'championship' | 'tournament'
  tournamentName: string | null
  roundName: string | null // e.g., "Quarterfinal", "Semifinal", "Final"
}

// Fetch HTML from ScoringLive
async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; 808scores/1.0; +https://hawaiisportscenter.com)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  return response.text()
}

// Normalize school name to match our database
function normalizeSchoolName(name: string): string | null {
  // Clean up the name
  let cleaned = name.trim()
    .replace(/\s+/g, ' ')
    .replace(/^#\d+\s*/, '') // Remove ranking numbers like "#1 "

  // Try exact match first (including Division II teams like "Iolani II")
  let mappedName = SCHOOL_NAME_MAP[cleaned]

  if (!mappedName) {
    // Try case-insensitive match
    for (const [key, value] of Object.entries(SCHOOL_NAME_MAP)) {
      if (key.toLowerCase() === cleaned.toLowerCase()) {
        mappedName = value
        break
      }
    }
  }

  // If still no match, check for Division II suffix and try base name
  if (!mappedName) {
    const isDivisionII = cleaned.endsWith(' II') || cleaned.endsWith('-II')
    if (isDivisionII) {
      const baseName = cleaned.replace(/\s*-?II$/, '').trim()

      // Try exact match on base name
      let baseMapped = SCHOOL_NAME_MAP[baseName]

      if (!baseMapped) {
        // Try case-insensitive match on base name
        for (const [key, value] of Object.entries(SCHOOL_NAME_MAP)) {
          if (key.toLowerCase() === baseName.toLowerCase()) {
            baseMapped = value
            break
          }
        }
      }

      if (baseMapped) {
        return `${baseMapped} II`
      }
    }
  }

  if (!mappedName) {
    // Try partial match (school name contains key)
    for (const [key, value] of Object.entries(SCHOOL_NAME_MAP)) {
      if (cleaned.toLowerCase().includes(key.toLowerCase())) {
        mappedName = value
        break
      }
    }
  }

  if (!mappedName) {
    console.warn(`Unknown school: "${name}"`)
    return null
  }

  return mappedName
}

// Parse game date and time to Date object
function parseGameDateTime(dateStr: string, timeStr: string): Date {
  const months: Record<string, number> = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3,
    'May': 4, 'June': 5, 'July': 6, 'August': 7,
    'September': 8, 'October': 9, 'November': 10, 'December': 11
  }

  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth()
  let day = now.getDate()

  // Parse date from "Monday, January 19" format
  for (const [monthName, monthNum] of Object.entries(months)) {
    if (dateStr.includes(monthName)) {
      month = monthNum
      const dayMatch = dateStr.match(/(\d+)/)
      if (dayMatch) {
        day = parseInt(dayMatch[1], 10)
      }
      break
    }
  }

  // Parse time from "7:00pm" or "5:30pm" format
  let hour = 19 // Default 7pm
  let minute = 0

  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i)
  if (timeMatch) {
    hour = parseInt(timeMatch[1], 10)
    minute = parseInt(timeMatch[2], 10)
    const ampm = timeMatch[3].toLowerCase()

    if (ampm === 'pm' && hour !== 12) {
      hour += 12
    } else if (ampm === 'am' && hour === 12) {
      hour = 0
    }
  }

  // Create date in Hawaii time (UTC-10)
  // We store in UTC, so add 10 hours to convert Hawaii time to UTC
  const date = new Date(Date.UTC(year, month, day, hour + 10, minute))
  return date
}

// Parse the schedules page HTML
export function parseSchedulePage(html: string, sportUrlPath: string): ScrapedGame[] {
  const $ = cheerio.load(html)
  const games: ScrapedGame[] = []
  const sportCode = SPORT_URL_MAP[sportUrlPath]
  const sportId = SPORT_IDS[sportCode]

  if (!sportCode || !sportId) {
    console.error('Unknown sport:', sportUrlPath)
    return games
  }

  // Track processed game IDs to avoid duplicates
  const processedGameIds = new Set<string>()

  // Find all date headers and build a map of positions
  const dateHeaders: { date: string; element: ReturnType<typeof $> }[] = []

  $('h5 b').each((_, el) => {
    const text = $(el).text().trim()
    // Match "Monday, January 19" format
    if (/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+\w+\s+\d+$/.test(text)) {
      dateHeaders.push({
        date: text,
        element: $(el).closest('.rowclear, .row, div')
      })
    }
  })

  console.log(`Found ${dateHeaders.length} date headers`)

  // Process each game table
  $('table.table-condensed').each((_, tableEl) => {
    const table = $(tableEl)

    // Find game links in this table
    const gameLinks = table.find('a[href*="gamesummary.php?gameid="]')
    if (gameLinks.length === 0) return

    // Get the game ID
    const firstLink = gameLinks.first()
    const href = firstLink.attr('href') || ''
    const gameIdMatch = href.match(/gameid=(\d+)/)
    if (!gameIdMatch) return

    const gameId = gameIdMatch[1]
    if (processedGameIds.has(gameId)) return
    processedGameIds.add(gameId)

    // Extract team names from rows
    const rows = table.find('tr')
    const teams: { name: string; score: number | null }[] = []

    rows.each((idx, row) => {
      const $row = $(row)
      // Find team name in bold tag within game link
      const teamLink = $row.find(`a[href*="gameid=${gameId}"] b`).first()
      const teamName = teamLink.text().trim()

      if (teamName && !teamName.match(/^\d+-\d+$/) && !teamName.match(/^\d+$/)) {
        // This is a team name, not a record or score
        // Look for score in the same row
        const cells = $row.find('td')
        let score: number | null = null

        cells.each((_, cell) => {
          const cellText = $(cell).find('b').text().trim()
          // Score is just a number (not a record like "5-2")
          if (/^\d+$/.test(cellText)) {
            score = parseInt(cellText, 10)
          }
        })

        teams.push({ name: teamName, score })
      }
    })

    if (teams.length < 2) return

    // Get time/status from the rowspan cell
    const statusCell = table.find('td[rowspan="2"]').first()
    const statusText = statusCell.text().trim().toLowerCase()

    let status: 'scheduled' | 'in_progress' | 'final' = 'scheduled'
    let timeStr = '7:00pm'

    if (statusText.includes('final')) {
      status = 'final'
    } else if (statusText.includes('live') || /\d+(st|nd|rd|th)/.test(statusText)) {
      status = 'in_progress'
    }

    // Extract time from status text
    const timeMatch = statusText.match(/(\d{1,2}:\d{2}\s*(?:am|pm))/i)
    if (timeMatch) {
      timeStr = timeMatch[1]
    }

    // Find the date for this game by looking at previous date headers
    let gameDate = ''
    const tableParents = table.parents()

    // Walk up and back to find the nearest date header
    let searchEl = table.prev()
    let found = false
    let iterations = 0

    while (!found && iterations < 50) {
      if (searchEl.length === 0) {
        // Go up to parent and try siblings
        const parent = table.parent()
        searchEl = parent.prev()
        if (searchEl.length === 0) {
          searchEl = parent.parent().prev()
        }
      }

      const text = searchEl.find('h5 b').text().trim()
      if (/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+\w+\s+\d+$/.test(text)) {
        gameDate = text
        found = true
      } else {
        // Check if searchEl itself contains the date
        const directText = searchEl.text()
        const dateMatch = directText.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+(\w+)\s+(\d+)/)
        if (dateMatch) {
          gameDate = dateMatch[0]
          found = true
        }
      }

      searchEl = searchEl.prev()
      iterations++
    }

    // If still no date found, search in the entire HTML before this table
    if (!gameDate) {
      const htmlBefore = $.html().split(`gameid=${gameId}`)[0]
      const dateMatches = htmlBefore.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+(\w+)\s+(\d+)/g)
      if (dateMatches && dateMatches.length > 0) {
        gameDate = dateMatches[dateMatches.length - 1]
      }
    }

    if (!gameDate) {
      console.warn(`No date found for game ${gameId}`)
      return
    }

    // Parse the scheduled time
    const scheduledAt = parseGameDateTime(gameDate, timeStr)
    console.log(`Game ${gameId}: date="${gameDate}" time="${timeStr}" -> ${scheduledAt.toISOString()}`)

    // Normalize team names
    const awayTeam = normalizeSchoolName(teams[0].name)
    const homeTeam = normalizeSchoolName(teams[1].name)

    if (!awayTeam || !homeTeam) {
      return
    }

    // Get venue from the table (usually in a row with "at" text)
    let venue: string | null = null
    const venueRow = table.find('td:contains("at ")').last()
    if (venueRow.length) {
      const venueText = venueRow.text().trim()
      const venueMatch = venueText.match(/at\s+(.+)/)
      if (venueMatch) {
        venue = venueMatch[1].trim()
      }
    }

    // Get league from the table
    let league: string | null = null
    const leagueCell = table.find('small small').first()
    if (leagueCell.length) {
      const leagueText = leagueCell.text().trim().toUpperCase()
      if (['OIA', 'ILH', 'BIIF', 'MIL', 'KIF', 'HHSAA'].includes(leagueText)) {
        league = leagueText
      }
    }

    // Detect game type and tournament info from table text
    const tableText = table.text().toLowerCase()
    const fullTableText = table.parent().text().toLowerCase()

    let gameType: 'regular_season' | 'playoff' | 'championship' | 'tournament' = 'regular_season'
    let tournamentName: string | null = null
    let roundName: string | null = null

    // Check for playoff/tournament indicators
    const playoffPatterns = [
      /playoff/i,
      /postseason/i,
      /elimination/i,
      /bracket/i,
    ]

    const championshipPatterns = [
      /state\s*championship/i,
      /hhsaa/i,
      /championship\s*game/i,
      /title\s*game/i,
      /finals?(?:\s|$)/i,
    ]

    const roundPatterns = [
      { pattern: /final(?:s)?(?:\s|$)/i, round: 'Final' },
      { pattern: /championship\s*game/i, round: 'Final' },
      { pattern: /semifinal/i, round: 'Semifinal' },
      { pattern: /semi-final/i, round: 'Semifinal' },
      { pattern: /quarterfinal/i, round: 'Quarterfinal' },
      { pattern: /quarter-final/i, round: 'Quarterfinal' },
      { pattern: /first\s*round/i, round: 'First Round' },
      { pattern: /second\s*round/i, round: 'Second Round' },
      { pattern: /third\s*place/i, round: 'Third Place' },
      { pattern: /consolation/i, round: 'Consolation' },
    ]

    // Check for championship
    if (championshipPatterns.some(p => p.test(fullTableText))) {
      gameType = 'championship'
      if (league === 'HHSAA' || /hhsaa|state/i.test(fullTableText)) {
        tournamentName = 'HHSAA State Championship'
      }
    }
    // Check for playoffs
    else if (playoffPatterns.some(p => p.test(fullTableText))) {
      gameType = 'playoff'
      if (league) {
        tournamentName = `${league} Playoffs`
      }
    }

    // Detect round
    for (const { pattern, round } of roundPatterns) {
      if (pattern.test(fullTableText)) {
        roundName = round
        // If we found a round indicator but haven't set game type, it's likely a playoff
        if (gameType === 'regular_season') {
          gameType = 'playoff'
        }
        break
      }
    }

    games.push({
      sportCode,
      sportId,
      awayTeam,
      homeTeam,
      awayScore: status === 'final' || status === 'in_progress' ? teams[0].score : null,
      homeScore: status === 'final' || status === 'in_progress' ? teams[1].score : null,
      scheduledAt,
      venue,
      status,
      externalId: gameId,
      league,
      gameType,
      tournamentName,
      roundName,
    })
  })

  return games
}

// Main scraper function for a single sport
export async function scrapeSport(sportUrlPath: string): Promise<ScrapedGame[]> {
  const url = `${BASE_URL}/${sportUrlPath}/schedules.php`

  console.log(`Scraping ${sportUrlPath} from ${url}`)

  try {
    const html = await fetchPage(url)
    const games = parseSchedulePage(html, sportUrlPath)
    console.log(`Found ${games.length} games for ${sportUrlPath}`)
    return games
  } catch (error) {
    console.error(`Error scraping ${sportUrlPath}:`, error)
    return []
  }
}

// Scrape all specified sports
export async function scrapeAllSports(sports: string[]): Promise<ScrapedGame[]> {
  const allGames: ScrapedGame[] = []

  for (const sport of sports) {
    const games = await scrapeSport(sport)
    allGames.push(...games)

    // Rate limiting - wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  return allGames
}
