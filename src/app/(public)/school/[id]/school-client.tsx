'use client'

import { use, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Heart,
  Bell,
  BellOff,
  Calendar,
  Trophy,
  Loader2,
} from 'lucide-react'
import { Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useFavoriteTeams } from '@/hooks/use-favorite-teams'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { cn, formatGameTime } from '@/lib/utils'
import type { School, GameWithTeams, Sport } from '@/types/database'

interface SchoolPageProps {
  params: Promise<{ id: string }>
}

interface SchoolWithGames extends School {
  upcomingGames: GameWithTeams[]
  recentGames: GameWithTeams[]
  sports: Sport[]
}

export function SchoolClient({ params }: SchoolPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { favoriteTeams, addFavorite, removeFavorite, toggleNotify, isFavorite, isLoading: favoritesLoading } = useFavoriteTeams(user?.id)

  const [school, setSchool] = useState<SchoolWithGames | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [followLoading, setFollowLoading] = useState(false)

  const supabase = useMemo(() => createClient()!, [])

  const isFollowing = isFavorite(id)
  const currentFollow = favoriteTeams.find(f => f.school_id === id)
  const notificationsEnabled = currentFollow?.notify ?? true

  // Fetch school data
  useEffect(() => {
    const fetchSchool = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch school details
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('*')
          .eq('id', id)
          .single()

        if (schoolError) throw schoolError
        if (!schoolData) throw new Error('School not found')

        // Fetch upcoming games (where school is home or away)
        const now = new Date().toISOString()
        const { data: upcomingData } = await supabase
          .from('games')
          .select(`
            *,
            sport:sports(*),
            home_team:schools!games_home_team_id_fkey(*),
            away_team:schools!games_away_team_id_fkey(*)
          `)
          .or(`home_team_id.eq.${id},away_team_id.eq.${id}`)
          .gte('scheduled_at', now)
          .in('status', ['scheduled', 'in_progress'])
          .order('scheduled_at', { ascending: true })
          .limit(10)

        // Fetch recent games (completed)
        const { data: recentData } = await supabase
          .from('games')
          .select(`
            *,
            sport:sports(*),
            home_team:schools!games_home_team_id_fkey(*),
            away_team:schools!games_away_team_id_fkey(*)
          `)
          .or(`home_team_id.eq.${id},away_team_id.eq.${id}`)
          .eq('status', 'final')
          .order('scheduled_at', { ascending: false })
          .limit(15)

        // Get unique sports from games
        const allGames = [...(upcomingData || []), ...(recentData || [])] as GameWithTeams[]
        const uniqueSports = Array.from(
          new Map(allGames.map(g => [g.sport.id, g.sport])).values()
        ) as Sport[]

        setSchool({
          ...(schoolData as School),
          upcomingGames: (upcomingData || []) as GameWithTeams[],
          recentGames: (recentData || []) as GameWithTeams[],
          sports: uniqueSports,
        })
      } catch (err) {
        console.error('Error fetching school:', err)
        setError(err instanceof Error ? err.message : 'Failed to load school')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchool()
  }, [id, supabase])

  const handleFollow = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setFollowLoading(true)
    if (isFollowing) {
      await removeFavorite(id)
    } else {
      await addFavorite(id, true)
    }
    setFollowLoading(false)
  }

  const handleToggleNotify = async () => {
    if (!user || !isFollowing) return
    setFollowLoading(true)
    await toggleNotify(id, !notificationsEnabled)
    setFollowLoading(false)
  }

  // Helper to determine if school won the game
  const didSchoolWin = (game: GameWithTeams): boolean | null => {
    if (game.status !== 'final') return null
    const isHome = game.home_team_id === id
    if (isHome) {
      return game.home_score > game.away_score
    }
    return game.away_score > game.home_score
  }

  // Get opponent for display
  const getOpponent = (game: GameWithTeams): School => {
    return game.home_team_id === id ? game.away_team : game.home_team
  }

  // Check if school is home team
  const isHomeTeam = (game: GameWithTeams): boolean => {
    return game.home_team_id === id
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-xl font-bold">School Not Found</h1>
        <p className="text-foreground-muted">{error || 'This school could not be found.'}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  // Parse colors if available
  const colors = school.colors as { primary?: string; secondary?: string } | null

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground-muted">
            Team
          </span>
        </div>
      </div>

      {/* School Info Card */}
      <div className="px-4 py-6">
        <div className="rounded-xl border-2 border-border bg-surface p-6">
          {/* School Name & Mascot */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold">{school.name}</h1>
              {school.mascot && (
                <p className="mt-1 text-lg text-foreground-muted">{school.mascot}</p>
              )}
            </div>

            {/* Color indicator */}
            {colors?.primary && (
              <div
                className="h-12 w-12 rounded-lg border-2 border-border"
                style={{ backgroundColor: colors.primary }}
              />
            )}
          </div>

          {/* League & Island */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {school.league && (
              <Badge variant="secondary">{school.league}</Badge>
            )}
            {school.division && (
              <Badge variant="secondary">{school.division}</Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-foreground-muted">
              <MapPin className="h-4 w-4" />
              {school.island}
            </div>
          </div>

          {/* Sports tags */}
          {school.sports.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {school.sports.map(sport => (
                <Badge key={sport.id} variant="default" className="text-xs">
                  {sport.display_name || sport.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Follow Button */}
          <div className="mt-6 flex gap-2">
            <Button
              onClick={handleFollow}
              disabled={followLoading || favoritesLoading}
              variant={isFollowing ? 'secondary' : 'default'}
              className={cn(
                'flex-1',
                isFollowing && 'border-neon-pink text-neon-pink'
              )}
            >
              {followLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Heart
                  className={cn(
                    'mr-2 h-4 w-4',
                    isFollowing && 'fill-neon-pink'
                  )}
                />
              )}
              {isFollowing ? 'Following' : 'Follow'}
            </Button>

            {isFollowing && (
              <Button
                onClick={handleToggleNotify}
                disabled={followLoading}
                variant="ghost"
                size="icon"
                className={cn(
                  notificationsEnabled && 'text-neon-blue'
                )}
              >
                {notificationsEnabled ? (
                  <Bell className="h-5 w-5" />
                ) : (
                  <BellOff className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Games Tabs */}
      <div className="px-4">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="upcoming" className="flex-1">
              <Calendar className="mr-2 h-4 w-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="results" className="flex-1">
              <Trophy className="mr-2 h-4 w-4" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            {school.upcomingGames.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface p-8 text-center">
                <Calendar className="mx-auto h-8 w-8 text-foreground-muted" />
                <p className="mt-2 text-foreground-muted">No upcoming games scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {school.upcomingGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    schoolId={id}
                    isHomeTeam={isHomeTeam(game)}
                    opponent={getOpponent(game)}
                    result={null}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            {school.recentGames.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface p-8 text-center">
                <Trophy className="mx-auto h-8 w-8 text-foreground-muted" />
                <p className="mt-2 text-foreground-muted">No recent games</p>
              </div>
            ) : (
              <div className="space-y-3">
                {school.recentGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    schoolId={id}
                    isHomeTeam={isHomeTeam(game)}
                    opponent={getOpponent(game)}
                    result={didSchoolWin(game)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Game Card Component
interface GameCardProps {
  game: GameWithTeams
  schoolId: string
  isHomeTeam: boolean
  opponent: School
  result: boolean | null // true = win, false = loss, null = not final
}

function GameCard({ game, schoolId, isHomeTeam, opponent, result }: GameCardProps) {
  const isLive = game.status === 'in_progress'
  const isFinal = game.status === 'final'

  // Get scores for display
  const schoolScore = isHomeTeam ? game.home_score : game.away_score
  const opponentScore = isHomeTeam ? game.away_score : game.home_score

  return (
    <Link href={`/game/${game.id}`}>
      <div className={cn(
        'rounded-lg border-2 bg-surface p-4 transition-all hover:border-neon-blue',
        isLive ? 'border-neon-pink' : 'border-border',
        result === true && 'border-l-4 border-l-score-green',
        result === false && 'border-l-4 border-l-score-red'
      )}>
        <div className="flex items-center justify-between">
          {/* Game Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground-muted">
                {isHomeTeam ? 'vs' : '@'}
              </span>
              <span className="font-bold">{opponent.short_name}</span>
              {opponent.mascot && (
                <span className="text-sm text-foreground-muted">{opponent.mascot}</span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 text-sm text-foreground-muted">
              <span>{game.sport.display_name || game.sport.name}</span>
              <span>•</span>
              <span>{formatGameTime(game.scheduled_at)}</span>
            </div>

            {game.game_type !== 'regular_season' && (
              <Badge variant="warning" className="mt-2 text-xs">
                {game.game_type === 'playoff' && 'Playoff'}
                {game.game_type === 'championship' && 'Championship'}
                {game.game_type === 'tournament' && 'Tournament'}
              </Badge>
            )}
          </div>

          {/* Score / Status */}
          <div className="text-right">
            {isLive && (
              <Badge variant="destructive" className="mb-1 animate-pulse">
                LIVE
              </Badge>
            )}

            {(isLive || isFinal) && (
              <div className="flex items-center gap-2">
                <span className={cn(
                  'font-mono text-xl font-bold',
                  result === true && 'text-score-green',
                  result === false && 'text-foreground-muted'
                )}>
                  {schoolScore}
                </span>
                <span className="text-foreground-muted">-</span>
                <span className={cn(
                  'font-mono text-xl font-bold',
                  result === false && 'text-score-green',
                  result === true && 'text-foreground-muted'
                )}>
                  {opponentScore}
                </span>
              </div>
            )}

            {isFinal && (
              <div className={cn(
                'text-sm font-bold',
                result === true && 'text-score-green',
                result === false && 'text-score-red'
              )}>
                {result === true ? 'W' : 'L'}
              </div>
            )}

            {!isLive && !isFinal && (
              <div className="text-sm text-foreground-muted">
                {new Date(game.scheduled_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
