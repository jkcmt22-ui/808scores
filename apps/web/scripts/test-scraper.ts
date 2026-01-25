// Test script to debug scraper extraction
import * as cheerio from 'cheerio'

const BASE_URL = 'https://scoringlive.com'

// Parse game date and time to Date object (same as scraper)
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

async function testScraper() {
  const sport = 'boysbasketball'
  const url = `${BASE_URL}/${sport}/schedules.php`

  console.log(`Fetching ${url}...`)
  const html = await fetchPage(url)

  const $ = cheerio.load(html)

  // Find date headers
  console.log('\n=== DATE HEADERS ===')
  $('h5 b').each((i, el) => {
    const text = $(el).text().trim()
    if (/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+\w+\s+\d+$/.test(text)) {
      console.log(`Date header: "${text}"`)
    }
  })

  // Find game tables
  console.log('\n=== GAME TABLES ===')
  $('table.table-condensed').each((tableIndex, tableEl) => {
    const table = $(tableEl)

    // Find game links
    const gameLinks = table.find('a[href*="gamesummary.php?gameid="]')
    if (gameLinks.length === 0) return

    const firstLink = gameLinks.first()
    const href = firstLink.attr('href') || ''
    const gameIdMatch = href.match(/gameid=(\d+)/)
    if (!gameIdMatch) return

    const gameId = gameIdMatch[1]

    console.log(`\n--- Game ${gameId} ---`)

    // Extract team names
    const rows = table.find('tr')
    rows.each((idx, row) => {
      const $row = $(row)
      const teamLink = $row.find(`a[href*="gameid=${gameId}"] b`).first()
      const teamName = teamLink.text().trim()

      if (teamName && !teamName.match(/^\d+-\d+$/) && !teamName.match(/^\d+$/)) {
        console.log(`  Team: "${teamName}"`)

        // Look for score
        const cells = $row.find('td')
        cells.each((_, cell) => {
          const cellText = $(cell).find('b').text().trim()
          if (/^\d+$/.test(cellText)) {
            console.log(`    Score: ${cellText}`)
          }
        })
      }
    })

    // Get time/status from rowspan cell
    const statusCell = table.find('td[rowspan="2"]').first()
    const statusText = statusCell.text().trim()
    console.log(`  Status cell text: "${statusText}"`)

    // Try to extract time
    const timeMatch = statusText.match(/(\d{1,2}:\d{2}\s*(?:am|pm))/i)
    if (timeMatch) {
      console.log(`  Extracted time: "${timeMatch[1]}"`)
    } else {
      console.log(`  No time found in status cell`)
    }

    // Try to find the date for this game
    const htmlBefore = $.html().split(`gameid=${gameId}`)[0]
    const dateMatches = htmlBefore.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+(\w+)\s+(\d+)/g)
    let gameDate = ''
    if (dateMatches && dateMatches.length > 0) {
      gameDate = dateMatches[dateMatches.length - 1]
      console.log(`  Date from HTML context: "${gameDate}"`)
    } else {
      console.log(`  No date found in HTML context`)
    }

    // Show parsed datetime
    if (gameDate) {
      const time = timeMatch ? timeMatch[1] : '7:00pm'
      const parsedDate = parseGameDateTime(gameDate, time)
      console.log(`  Parsed DateTime (UTC): ${parsedDate.toISOString()}`)
      // Show in Hawaii time for reference
      const hawaiiTime = new Date(parsedDate.getTime() - 10 * 60 * 60 * 1000)
      console.log(`  Hawaii Time: ${hawaiiTime.toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' })}`)
    }
  })
}

testScraper().catch(console.error)
