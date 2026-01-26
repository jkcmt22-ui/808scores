import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SchoolClient } from './school-client'

const SITE_URL = 'https://www.hawaiisportscenter.com'

interface SchoolPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: SchoolPageProps): Promise<Metadata> {
  const { id } = await params

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return {
      title: 'School | Hawaii Sports Center',
      description: 'Hawaii high school sports scores and updates.',
    }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('id', id)
    .single()

  if (!school) {
    return {
      title: 'School Not Found | Hawaii Sports Center',
      description: 'This school could not be found.',
    }
  }

  const title = school.mascot
    ? `${school.name} ${school.mascot} | Hawaii Sports Center`
    : `${school.name} | Hawaii Sports Center`

  const description = `Follow ${school.name}${school.mascot ? ` ${school.mascot}` : ''} sports. Get live scores, schedules, and results for ${school.league || 'Hawaii'} high school athletics.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/school/${id}`,
      siteName: 'Hawaii Sports Center',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/school/${id}`,
    },
  }
}

export default function SchoolPage({ params }: SchoolPageProps) {
  return <SchoolClient params={params} />
}
