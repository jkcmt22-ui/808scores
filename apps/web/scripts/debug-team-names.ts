import * as cheerio from 'cheerio'
import { SCHOOL_NAME_MAP } from '../src/lib/scraper/mappings'

const BASE_URL = 'https://scoringlive.com'

// Same normalizeSchoolName as in scraper
function normalizeSchoolName(name: string): string | null {
  const cleaned = name.trim()
    .replace(/\s+/g, ' ')
    .replace(/^#\d+\s*/, '')

  // Try exact match first
  let mappedName = SCHOOL_NAME_MAP[cleaned]

  if (!mappedName) {
    for (const [key, value] of Object.entries(SCHOOL_NAME_MAP)) {
      if (key.toLowerCase() === cleaned.toLowerCase()) {
        mappedName = value
        break
      }
    }
  }

  // Check Division II
  if (!mappedName) {
    const isDivisionII = cleaned.endsWith(' II') || cleaned.endsWith('-II')
    if (isDivisionII) {
      const baseName = cleaned.replace(/\s*-?II$/, '').trim()
      let baseMapped = SCHOOL_NAME_MAP[baseName]
      if (!baseMapped) {
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
    for (const [key, value] of Object.entries(SCHOOL_NAME_MAP)) {
      if (cleaned.toLowerCase().includes(key.toLowerCase())) {
        mappedName = value
        break
      }
    }
  }

  return mappedName || null
}

async function debugTeamNames() {
  const sports = ['boysbasketball', 'girlsbasketball', 'boyssoccer', 'girlssoccer']
  const teamResults = new Map<string, { raw: string, mapped: string | null }>()

  for (const sport of sports) {
    const url = `${BASE_URL}/${sport}/schedules.php`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; 808scores/1.0)' }
    })
    const html = await response.text()
    const $ = cheerio.load(html)

    $('table.table-condensed a[href*="gamesummary.php"] b').each((_, el) => {
      const raw = $(el).text().trim()
      // Skip scores and records
      if (/^\d+$/.test(raw) || /^\d+-\d+(-\d+)?$/.test(raw) || raw === 'TBD' || raw === '') return

      const mapped = normalizeSchoolName(raw)
      if (!teamResults.has(raw)) {
        teamResults.set(raw, { raw, mapped })
      }
    })
  }

  console.log('=== Team Name Mappings ===\n')

  // Sort by mapped status
  const sorted = [...teamResults.values()].sort((a, b) => {
    if (!a.mapped && b.mapped) return -1
    if (a.mapped && !b.mapped) return 1
    return a.raw.localeCompare(b.raw)
  })

  const unmapped = sorted.filter(t => !t.mapped)
  const mapped = sorted.filter(t => t.mapped)

  if (unmapped.length > 0) {
    console.log('UNMAPPED (will be skipped):')
    unmapped.forEach(t => console.log(`  "${t.raw}" -> null`))
    console.log()
  }

  console.log(`MAPPED (${mapped.length} schools):`)
  // Show just a sample
  mapped.slice(0, 20).forEach(t => console.log(`  "${t.raw}" -> "${t.mapped}"`))
  if (mapped.length > 20) {
    console.log(`  ... and ${mapped.length - 20} more`)
  }
}

debugTeamNames().catch(console.error)
