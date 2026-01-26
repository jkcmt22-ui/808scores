import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://www.hawaiisportscenter.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages - prioritized for SEO
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/live`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/schools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/standings`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/tournaments`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/community`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Fetch recent games (last 30 days + upcoming 7 days)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Return static pages only if Supabase isn't configured (build time)
    return staticPages
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  const { data: games } = await supabase
    .from('games')
    .select('id, updated_at, status')
    .gte('scheduled_at', thirtyDaysAgo.toISOString())
    .lte('scheduled_at', sevenDaysFromNow.toISOString())
    .order('scheduled_at', { ascending: false })
    .limit(500)

  // Generate game pages
  const gamePages: MetadataRoute.Sitemap = (games || []).map((game) => ({
    url: `${SITE_URL}/game/${game.id}`,
    lastModified: new Date(game.updated_at),
    changeFrequency: game.status === 'in_progress' ? 'always' : 'daily' as const,
    priority: game.status === 'in_progress' ? 0.9 : 0.8,
  }))

  // Fetch all schools for school pages
  const { data: schools } = await supabase
    .from('schools')
    .select('id, updated_at')
    .order('name')

  const schoolPages: MetadataRoute.Sitemap = (schools || []).map((school) => ({
    url: `${SITE_URL}/school/${school.id}`,
    lastModified: school.updated_at ? new Date(school.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Fetch active tournaments
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, updated_at, status')
    .in('status', ['active', 'completed'])
    .order('start_date', { ascending: false })
    .limit(50)

  const tournamentPages: MetadataRoute.Sitemap = (tournaments || []).map((tournament) => ({
    url: `${SITE_URL}/tournaments/${tournament.id}`,
    lastModified: tournament.updated_at ? new Date(tournament.updated_at) : new Date(),
    changeFrequency: tournament.status === 'active' ? 'hourly' : 'weekly' as const,
    priority: tournament.status === 'active' ? 0.85 : 0.6,
  }))

  return [...staticPages, ...schoolPages, ...tournamentPages, ...gamePages]
}
