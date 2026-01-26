import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { GameClient } from './game-client'

const SITE_URL = 'https://www.hawaiisportscenter.com'

interface GamePageProps {
  params: Promise<{ id: string }>
}

// Helper to fetch game data
async function getGame(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return null

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data } = await supabase
    .from('games')
    .select(`
      *,
      sport:sports(name, display_name),
      home_team:schools!games_home_team_id_fkey(name, short_name),
      away_team:schools!games_away_team_id_fkey(name, short_name)
    `)
    .eq('id', id)
    .single()

  return data
}

// Generate JSON-LD structured data for SportsEvent
function generateJsonLd(game: Awaited<ReturnType<typeof getGame>>, id: string) {
  if (!game) return null

  const sportName = game.sport.display_name || game.sport.name
  const isLive = game.status === 'in_progress'
  const isFinal = game.status === 'final'

  // Determine event status
  let eventStatus = 'https://schema.org/EventScheduled'
  if (isLive) {
    eventStatus = 'https://schema.org/EventScheduled' // No "in progress" status in schema.org
  } else if (isFinal) {
    eventStatus = 'https://schema.org/EventScheduled'
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${game.away_team.name} vs ${game.home_team.name}`,
    description: `${sportName} game between ${game.away_team.name} and ${game.home_team.name}`,
    startDate: game.scheduled_at,
    eventStatus,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: game.venue ? {
      '@type': 'Place',
      name: game.venue,
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'HI',
        addressCountry: 'US',
      },
    } : undefined,
    competitor: [
      {
        '@type': 'SportsTeam',
        name: game.away_team.name,
        ...(isFinal || isLive ? { score: game.away_score } : {}),
      },
      {
        '@type': 'SportsTeam',
        name: game.home_team.name,
        ...(isFinal || isLive ? { score: game.home_score } : {}),
      },
    ],
    sport: sportName,
    url: `${SITE_URL}/game/${id}`,
    organizer: {
      '@type': 'Organization',
      name: 'Hawaii Sports Center',
      url: SITE_URL,
    },
  }

  return jsonLd
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { id } = await params
  const game = await getGame(id)

  if (!game) {
    return {
      title: 'Game Not Found | Hawaii Sports Center',
      description: 'This game could not be found.',
    }
  }

  const awayTeam = game.away_team.short_name
  const homeTeam = game.home_team.short_name
  const sportName = game.sport.display_name || game.sport.name
  const isLive = game.status === 'in_progress'
  const isFinal = game.status === 'final'

  // Build dynamic title
  let title = `${awayTeam} vs ${homeTeam}`
  if (isLive) {
    title = `LIVE: ${awayTeam} ${game.away_score} - ${homeTeam} ${game.home_score} | ${sportName}`
  } else if (isFinal) {
    title = `Final: ${awayTeam} ${game.away_score} - ${homeTeam} ${game.home_score} | ${sportName}`
  } else {
    title = `${awayTeam} vs ${homeTeam} | ${sportName} | Hawaii Sports Center`
  }

  // Build description
  let description = `${game.away_team.name} vs ${game.home_team.name} - ${sportName}`
  if (isLive) {
    description = `Live score: ${game.away_team.name} ${game.away_score}, ${game.home_team.name} ${game.home_score}. Watch the game unfold in real-time!`
  } else if (isFinal) {
    description = `Final score: ${game.away_team.name} ${game.away_score}, ${game.home_team.name} ${game.home_score}. ${sportName} game results.`
  } else {
    const gameDate = new Date(game.scheduled_at).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
    description = `${game.away_team.name} vs ${game.home_team.name} - ${sportName} on ${gameDate}. Get live scores and updates.`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/game/${id}`,
      siteName: 'Hawaii Sports Center',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/game/${id}`,
    },
  }
}

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params
  const game = await getGame(id)
  const jsonLd = generateJsonLd(game, id)

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <GameClient params={params} />
    </>
  )
}
