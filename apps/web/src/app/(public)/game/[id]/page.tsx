import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { GameClient } from './game-client'

const SITE_URL = 'https://808scores.vercel.app'

interface GamePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { id } = await params

  // Create Supabase client inside function to avoid build-time errors
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return {
      title: 'Game | Hawaii Sports Center',
      description: 'Hawaii high school sports scores and updates.',
    }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Fetch game data for metadata
  const { data: game } = await supabase
    .from('games')
    .select(`
      *,
      sport:sports(name, display_name),
      home_team:schools!games_home_team_id_fkey(name, short_name),
      away_team:schools!games_away_team_id_fkey(name, short_name)
    `)
    .eq('id', id)
    .single()

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

export default function GamePage({ params }: GamePageProps) {
  return <GameClient params={params} />
}
