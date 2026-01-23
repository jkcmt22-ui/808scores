import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://808scores.vercel.app'

// Create a Supabase client for server-side use
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
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
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/standings`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Fetch recent games (last 30 days + upcoming 7 days)
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

  return [...staticPages, ...gamePages]
}
