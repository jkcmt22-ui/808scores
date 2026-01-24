'use client'

import { use, useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  Share2,
  Bell,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trophy,
  Swords,
  User,
  Check,
  Copy,
  Building2,
  BarChart3,
  ChevronRight,
} from 'lucide-react'
import { Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { Breadcrumbs } from '@/components/layout'
import { GameChat } from '@/components/chat'
import { useGame } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn, formatGameTime, isGameLive, isGameFinal } from '@/lib/utils'
import type { GameType, SubmissionWithUser } from '@/types/database'

interface GamePageProps {
  params: Promise<{ id: string }>
}

// Helper to get game type display info
function getGameTypeBadge(gameType: GameType): { label: string; variant: 'default' | 'warning' | 'success' | 'secondary'; icon?: React.ReactNode } | null {
  switch (gameType) {
    case 'playoff':
      return { label: 'Playoff', variant: 'warning', icon: <Trophy className="h-3 w-3" /> }
    case 'championship':
      return { label: 'Championship', variant: 'success', icon: <Trophy className="h-3 w-3" /> }
    case 'tournament':
      return { label: 'Tournament', variant: 'warning', icon: <Swords className="h-3 w-3" /> }
    case 'exhibition':
      return { label: 'Exhibition', variant: 'secondary' }
    case 'scrimmage':
      return { label: 'Scrimmage', variant: 'secondary' }
    default:
      return null
  }
}

// Helper to format overtime display
function getOvertimeDisplay(overtimeCount: number): string | null {
  if (overtimeCount === 0) return null
  if (overtimeCount === 1) return 'OT'
  return `${overtimeCount}OT`
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function GameClient({ params }: GamePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { game, isLoading, error } = useGame(id)
  const [submissions, setSubmissions] = useState<SubmissionWithUser[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(true)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle')

  const supabase = useMemo(() => createClient()!, [])

  // Share functionality
  const handleShare = useCallback(async () => {
    if (!game) return

    const isLive = game.status === 'in_progress'
    const isFinal = game.status === 'final'
    const sportName = game.sport.display_name || game.sport.name

    // Build share text
    let shareText = `${game.away_team.short_name} vs ${game.home_team.short_name}`
    if (isLive) {
      shareText = `LIVE: ${game.away_team.short_name} ${game.away_score} - ${game.home_team.short_name} ${game.home_score} | ${sportName}`
    } else if (isFinal) {
      shareText = `Final: ${game.away_team.short_name} ${game.away_score} - ${game.home_team.short_name} ${game.home_score} | ${sportName}`
    }

    const shareUrl = `https://808scores.vercel.app/game/${id}`
    const shareData = {
      title: shareText,
      text: `${shareText}\n\nFollow live on Hawaii Sports Center`,
      url: shareUrl,
    }

    // Try native share first (mobile)
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        setShareStatus('shared')
        setTimeout(() => setShareStatus('idle'), 2000)
        return
      } catch (err) {
        // User cancelled or error - fall through to clipboard
        if ((err as Error).name === 'AbortError') return
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [game, id])

  // Fetch submissions for this game
  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoadingSubmissions(true)
      const { data, error: subError } = await supabase
        .from('submissions')
        .select(`
          *,
          user:users(id, display_name, tier, is_trusted_reporter)
        `)
        .eq('game_id', id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(20)

      if (!subError && data) {
        setSubmissions(data as SubmissionWithUser[])
      }
      setLoadingSubmissions(false)
    }

    if (id) {
      fetchSubmissions()
    }

    // Subscribe to new submissions
    const channel = supabase
      .channel(`submissions-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submissions',
          filter: `game_id=eq.${id}`,
        },
        () => {
          fetchSubmissions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
          <span className="font-display text-sm text-foreground-muted uppercase tracking-wider">Loading...</span>
        </div>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <AlertCircle className="mb-4 h-12 w-12 text-neon-pink" />
        <h1 className="mb-2 font-display text-xl font-bold text-foreground uppercase">Game Not Found</h1>
        <p className="mb-4 text-foreground-muted text-sm">This game may have been removed or doesn&apos;t exist.</p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    )
  }

  const isLive = isGameLive(game.status)
  const isFinal = isGameFinal(game.status)
  const isScheduled = game.status === 'scheduled'
  const gameTypeBadge = getGameTypeBadge(game.game_type)
  const overtimeDisplay = getOvertimeDisplay(game.overtime_count)
  const sportName = game.sport.display_name || game.sport.name

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-display text-xs uppercase tracking-wider">Back</span>
          </button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className={cn(
                shareStatus === 'copied' && 'text-neon-green',
                shareStatus === 'shared' && 'text-neon-green'
              )}
            >
              {shareStatus === 'copied' ? (
                <Check className="h-5 w-5" />
              ) : shareStatus === 'shared' ? (
                <Check className="h-5 w-5" />
              ) : (
                <Share2 className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Breadcrumbs */}
        <div className="px-4 border-t border-border bg-background-secondary">
          <Breadcrumbs
            items={[
              { label: sportName, href: `/standings?sport=${game.sport.code}` },
              { label: `${game.away_team.short_name} vs ${game.home_team.short_name}` },
            ]}
          />
        </div>
      </header>

      <main className="px-4 py-6 pb-24">
        {/* Main Scoreboard */}
        <div className={cn(
          'scoreboard-panel p-6 mb-6',
          isLive && 'border-neon-pink/50'
        )}
        style={isLive ? { boxShadow: '0 0 20px rgba(255, 42, 109, 0.2)' } : undefined}
        >
          {/* Status Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              {isLive && (
                <span className="flex items-center gap-2 neon-text-pink font-display text-sm font-bold uppercase tracking-wider animate-live-pulse">
                  <span className="h-2.5 w-2.5 bg-neon-pink" style={{ boxShadow: '0 0 8px var(--neon-pink)' }} />
                  Live
                </span>
              )}
              {isFinal && (
                <span className="font-display text-sm font-bold text-foreground-muted uppercase tracking-wider">
                  Final{overtimeDisplay && ` (${overtimeDisplay})`}
                </span>
              )}
              {isScheduled && (
                <span className="font-display text-sm font-bold neon-text-yellow uppercase tracking-wider">
                  Scheduled
                </span>
              )}
              {gameTypeBadge && (
                <Badge variant={gameTypeBadge.variant} className="gap-1 font-display">
                  {gameTypeBadge.icon}
                  {gameTypeBadge.label}
                </Badge>
              )}
              {game.golden_game && (
                <Badge variant="warning" className="gap-1 font-display">
                  <Star className="h-3 w-3" />
                  3x Points
                </Badge>
              )}
            </div>
            <span className="font-display text-[10px] font-bold text-neon-blue uppercase tracking-widest">
              {sportName}
            </span>
          </div>

          {/* Scoreboard Display */}
          <div className="space-y-4">
            {/* Away Team */}
            <div className="flex items-center justify-between">
              <Link href={`/school/${game.away_team.id}`} className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                <div className="flex h-14 w-14 items-center justify-center bg-background-tertiary text-lg font-display font-black text-neon-blue border-2 border-neon-blue/30">
                  {game.away_team.short_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-lg text-foreground truncate">
                    {game.away_team.name}
                  </p>
                  <p className="text-xs text-foreground-subtle font-display">
                    {game.away_team.league} &bull; {game.away_team.island}
                  </p>
                </div>
              </Link>
              <div className={cn(
                'score-led score-led-white text-4xl tabular-nums min-w-[100px] text-center',
                isLive && 'animate-led-blink'
              )}>
                {!isScheduled ? game.away_score : '--'}
              </div>
            </div>

            {/* Home Team */}
            <div className="flex items-center justify-between">
              <Link href={`/school/${game.home_team.id}`} className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                <div className="flex h-14 w-14 items-center justify-center bg-background-tertiary text-lg font-display font-black text-neon-pink border-2 border-neon-pink/30">
                  {game.home_team.short_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-lg text-foreground truncate">
                    {game.home_team.name}
                  </p>
                  <p className="text-xs text-foreground-subtle font-display">
                    {game.home_team.league} &bull; {game.home_team.island}
                  </p>
                </div>
              </Link>
              <div className={cn(
                'score-led score-led-white text-4xl tabular-nums min-w-[100px] text-center',
                isLive && 'animate-led-blink'
              )}>
                {!isScheduled ? game.home_score : '--'}
              </div>
            </div>
          </div>

          {/* Game Info Footer */}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t-2 border-border pt-4">
            {isLive && game.current_period && (
              <div className="flex items-center gap-1.5 text-sm neon-text-pink font-display">
                <Clock className="h-4 w-4" />
                <span>
                  {overtimeDisplay || game.current_period}
                  {game.time_remaining && ` - ${game.time_remaining}`}
                </span>
              </div>
            )}
            {!isLive && (
              <div className="flex items-center gap-1.5 text-sm text-foreground-muted font-display">
                <Clock className="h-4 w-4" />
                <span>{formatGameTime(game.scheduled_at)}</span>
              </div>
            )}
            {game.venue && (
              <div className="flex items-center gap-1.5 text-sm text-foreground-muted">
                <MapPin className="h-4 w-4" />
                <span>{game.venue}</span>
              </div>
            )}
          </div>

          {/* Verification Status */}
          {game.is_verified && (
            <div className="mt-4 flex items-center gap-2 text-sm neon-text-green font-display">
              <CheckCircle2 className="h-4 w-4" />
              <span className="uppercase tracking-wider">Verified Score</span>
            </div>
          )}
        </div>

        {/* Tabs for Chat/Updates/Report */}
        <Tabs defaultValue="chat" className="mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
            <TabsTrigger value="updates" className="flex-1">Updates</TabsTrigger>
            <TabsTrigger value="report" className="flex-1">Report</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <GameChat gameId={id} />
          </TabsContent>

          <TabsContent value="updates">
            <div className="scoreboard-panel p-4">
              <h3 className="mb-4 font-display font-bold neon-text-yellow uppercase tracking-wider text-sm">Score Updates</h3>

              {loadingSubmissions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-neon-yellow" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-foreground-muted text-sm font-display">No updates yet</p>
                  <p className="text-foreground-subtle text-xs mt-1">
                    Score updates will appear here as they&apos;re reported
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border-2 border-border bg-background-secondary p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center bg-background-tertiary border border-border">
                            <User className="h-4 w-4 text-foreground-muted" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-sm text-foreground truncate">
                                {submission.user?.display_name || 'Anonymous'}
                              </span>
                              {submission.user?.is_trusted_reporter && (
                                <Badge variant="success" className="text-[9px] py-0 px-1">
                                  Trusted
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-foreground-subtle font-display">
                              {formatRelativeTime(submission.created_at)}
                            </p>
                          </div>
                        </div>
                        {submission.points_earned > 0 && (
                          <Badge variant="warning" className="text-[10px] shrink-0">
                            +{submission.points_earned} pts
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2 pl-10">
                        {submission.submission_type === 'period_score' && (
                          <p className="font-display text-sm">
                            <span className="text-foreground-muted">Reported </span>
                            <span className="text-neon-blue font-bold">{submission.away_score}</span>
                            <span className="text-foreground-muted"> - </span>
                            <span className="text-neon-pink font-bold">{submission.home_score}</span>
                            {submission.period && (
                              <span className="text-foreground-muted"> in {submission.period}</span>
                            )}
                          </p>
                        )}
                        {submission.submission_type === 'final_score' && (
                          <p className="font-display text-sm">
                            <span className="neon-text-green font-bold">Final: </span>
                            <span className="text-neon-blue font-bold">{submission.away_score}</span>
                            <span className="text-foreground-muted"> - </span>
                            <span className="text-neon-pink font-bold">{submission.home_score}</span>
                          </p>
                        )}
                        {submission.submission_type === 'live_update' && submission.event_description && (
                          <p className="font-display text-sm text-foreground-muted">
                            {submission.event_description}
                          </p>
                        )}
                        {submission.submission_type === 'status_change' && submission.event_description && (
                          <p className="font-display text-sm text-neon-yellow">
                            {submission.event_description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="report">
            <div className="scoreboard-panel p-4">
              <h3 className="mb-2 font-display font-bold neon-text-green uppercase tracking-wider text-sm">At the Game?</h3>
              <p className="mb-4 text-sm text-foreground-muted">
                Help the community by reporting the score. Earn points and climb the leaderboard!
              </p>
              <Link href={`/submit/${game.id}`}>
                <Button className="w-full">Report Score</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Section */}
        <div className="scoreboard-panel p-4">
          <h3 className="mb-4 font-display font-bold text-foreground-muted uppercase tracking-wider text-sm">
            Related
          </h3>
          <div className="space-y-2">
            {/* Away Team School */}
            <Link
              href={`/school/${game.away_team.id}`}
              className="flex items-center justify-between p-3 border-2 border-border bg-background-secondary hover:border-neon-blue transition-colors"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-neon-blue" />
                <div>
                  <p className="font-display font-bold text-sm">{game.away_team.name}</p>
                  <p className="text-xs text-foreground-muted">{game.away_team.league}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground-muted" />
            </Link>

            {/* Home Team School */}
            <Link
              href={`/school/${game.home_team.id}`}
              className="flex items-center justify-between p-3 border-2 border-border bg-background-secondary hover:border-neon-pink transition-colors"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-neon-pink" />
                <div>
                  <p className="font-display font-bold text-sm">{game.home_team.name}</p>
                  <p className="text-xs text-foreground-muted">{game.home_team.league}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground-muted" />
            </Link>

            {/* Sport Standings */}
            <Link
              href={`/standings?sport=${game.sport.code}`}
              className="flex items-center justify-between p-3 border-2 border-border bg-background-secondary hover:border-neon-yellow transition-colors"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="h-4 w-4 text-neon-yellow" />
                <div>
                  <p className="font-display font-bold text-sm">{sportName} Standings</p>
                  <p className="text-xs text-foreground-muted">League standings</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground-muted" />
            </Link>

            {/* Tournament (if applicable) */}
            {game.tournament_id && (
              <Link
                href={`/tournaments/${game.tournament_id}`}
                className="flex items-center justify-between p-3 border-2 border-border bg-background-secondary hover:border-neon-green transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="h-4 w-4 text-neon-green" />
                  <div>
                    <p className="font-display font-bold text-sm">View Tournament</p>
                    <p className="text-xs text-foreground-muted">Bracket & schedule</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-foreground-muted" />
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
