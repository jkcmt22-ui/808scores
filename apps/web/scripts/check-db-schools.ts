import { createClient } from '@supabase/supabase-js'
import { SCHOOL_NAME_MAP } from '../src/lib/scraper/mappings'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkDbSchools() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get all unique mapped school names (the values)
  const mappedNames = new Set(Object.values(SCHOOL_NAME_MAP))

  // Also include Division II versions
  for (const name of [...mappedNames]) {
    mappedNames.add(`${name} II`)
  }

  console.log(`Checking ${mappedNames.size} mapped school names...`)

  // Get all schools from database
  const { data: schools, error } = await supabase
    .from('schools')
    .select('short_name')

  if (error) {
    console.error('Error fetching schools:', error)
    return
  }

  const dbSchoolNames = new Set(schools.map(s => s.short_name))
  console.log(`Found ${dbSchoolNames.size} schools in database`)

  // Find missing schools
  const missingSchools: string[] = []
  for (const name of mappedNames) {
    if (!dbSchoolNames.has(name)) {
      missingSchools.push(name)
    }
  }

  if (missingSchools.length > 0) {
    console.log('\nSchools in mappings but NOT in database:')
    missingSchools.sort().forEach(s => console.log(`  - ${s}`))
  } else {
    console.log('\nAll mapped schools exist in database!')
  }
}

checkDbSchools().catch(console.error)
