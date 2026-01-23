import { parseSchedulePage } from '../src/lib/scraper/scoringlive'
import { SCHOOL_NAME_MAP } from '../src/lib/scraper/mappings'

const BASE_URL = 'https://scoringlive.com'

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; 808scores/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  return response.text()
}

async function debugScraper() {
  const sports = ['boysbasketball', 'girlsbasketball', 'boyssoccer', 'girlssoccer']

  for (const sport of sports) {
    console.log(`\n=== ${sport.toUpperCase()} ===`)
    const url = `${BASE_URL}/${sport}/schedules.php`
    const html = await fetchPage(url)
    const games = parseSchedulePage(html, sport)

    console.log(`Parsed ${games.length} games`)

    // Show games for today (Jan 23) and tomorrow (Jan 24)
    const todayGames = games.filter(g => {
      const date = g.scheduledAt
      const hawaiiDate = date.toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu' })
      return hawaiiDate === '2026-01-23' || hawaiiDate === '2026-01-24'
    })

    console.log(`Games for Jan 23-24: ${todayGames.length}`)
    todayGames.forEach(g => {
      const hawaiiDate = g.scheduledAt.toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu' })
      const hawaiiTime = g.scheduledAt.toLocaleTimeString('en-US', { timeZone: 'Pacific/Honolulu', hour: 'numeric', minute: '2-digit' })
      console.log(`  ${hawaiiDate} ${hawaiiTime}: ${g.awayTeam} @ ${g.homeTeam} (${g.status})`)
    })
  }
}

debugScraper().catch(console.error)
