import * as cheerio from 'cheerio'
import { SCHOOL_NAME_MAP } from '../src/lib/scraper/mappings'

const BASE_URL = 'https://scoringlive.com'

async function findUnknownSchools() {
  const sports = ['boysbasketball', 'girlsbasketball', 'boyssoccer', 'girlssoccer']
  const unknownSchools = new Set<string>()

  for (const sport of sports) {
    console.log(`Checking ${sport}...`)
    const url = `${BASE_URL}/${sport}/schedules.php`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; 808scores/1.0)' }
    })
    const html = await response.text()
    const $ = cheerio.load(html)

    $('table.table-condensed a[href*="gamesummary.php"] b').each((_, el) => {
      const name = $(el).text().trim()
        .replace(/\s+/g, ' ')
        .replace(/^#\d+\s*/, '')

      // Skip scores and records
      if (/^\d+$/.test(name) || /^\d+-\d+$/.test(name)) return

      // Check if we can map this school
      let mapped = SCHOOL_NAME_MAP[name]
      if (!mapped) {
        // Try case-insensitive
        for (const [key, value] of Object.entries(SCHOOL_NAME_MAP)) {
          if (key.toLowerCase() === name.toLowerCase()) {
            mapped = value
            break
          }
        }
      }

      // Check Division II
      if (!mapped && (name.endsWith(' II') || name.endsWith('-II'))) {
        const baseName = name.replace(/\s*-?II$/, '').trim()
        mapped = SCHOOL_NAME_MAP[baseName]
        if (mapped) mapped = mapped + ' II'
      }

      if (!mapped) {
        unknownSchools.add(name)
      }
    })
  }

  console.log('\nUnknown schools:', [...unknownSchools].sort())
}

findUnknownSchools().catch(console.error)
