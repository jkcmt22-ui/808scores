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
  Loader2,
  Trophy,
  Swords,
  User,
  Check,
  Building2,
  BarChart3,
  ChevronRight,
  Camera,
  ExternalLink,
  Play,
} from 'lucide-react'
import { Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { Breadcrumbs } from '@/components/layout'
import { GameChat } from '@/components/chat'
import { ShareButtons, RemindMeButton, VerificationBadge } from '@/components/game'
import { PredictionForm, AudienceExpectation, PredictionResults } from '@/components/predictions'
import { useGame, useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn, formatGameTime, formatRelativeTime, isGameLive, isGameFinal } from '@/lib/utils'
import type { GameType, SubmissionWithUser } from '@/types/database'
import { getHomeSchool, getAwaySchool } from '@/types/database'

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


export function GameClient({ params }: GamePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { game, isLoading, error } = useGame(id)
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<SubmissionWithUser[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(true)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle')

  const supabase = useMemo(() => createClient(), [])

  // Share functionality
  const handleShare = useCallback(async () => {
    if (!game) return

    const isLive = game.status === 'in_progress'
    const isFinal = game.status === 'final'
    const sportName = game.sport.display_name || game.sport.name

    // After migration 072: Get school data from team or directly
    const homeSchool = getHomeSchool(game)
    const awaySchool = getAwaySchool(game)

    // Build share text
    let shareText = `${awaySchool.short_name} vs ${homeSchool.short_name}`
    if (isLive) {
      shareText = `LIVE: ${awaySchool.short_name} ${game.away_score} - ${homeSchool.short_name} ${game.home_score} | ${sportName}`
    } else if (isFinal) {
      shareText = `Final: ${awaySchool.short_name} ${game.away_score} - ${homeSchool.short_name} ${game.home_score} | ${sportName}`
    }

    const shareUrl = `https://www.hawaiisportscenter.com/game/${id}`
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
    } catch {
      // Failed to copy
    }
  }, [game, id])

  // Cleanup share status timeout
  useEffect(() => {
    if (shareStatus !== 'idle') {
      const timeoutId = setTimeout(() => setShareStatus('idle'), 2000)
      return () => clearTimeout(timeoutId)
    }
  }, [shareStatus])

  // Fetch submissions callback
  const fetchSubmissions = useCallback(async () => {
    if (!supabase) {
      setLoadingSubmissions(false)
      return
    }

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
  }, [supabase, id])

  // Fetch submissions for this game and subscribe to updates
  useEffect(() => {
    if (!supabase || !id) return

    // fetchSubmissions is a stable useCallback - this pattern is correct
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSubmissions()

    // Subscribe to new and promoted submissions (INSERT + UPDATE)
    const channel = supabase
      .channel(`submissions-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
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
  }, [supabase, id, fetchSubmissions])

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

  // After migration 072: Get school data from team or directly
  const homeSchool = getHomeSchool(game)
  const awaySchool = getAwaySchool(game)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            onClick={() => router.back()}
            aria-label="Go back to previous page"
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors min-h-[44px] px-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-display text-xs uppercase tracking-wider">Back</span>
          </button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              aria-label={shareStatus === 'copied' ? 'Link copied' : shareStatus === 'shared' ? 'Shared' : 'Share game'}
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
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Breadcrumbs */}
        <div className="px-4 border-t border-border bg-background-secondary">
          <Breadcrumbs
            items={[
              { label: sportName, href: `/standings?sport=${game.sport.code}` },
              { label: `${awaySchool.short_name} vs ${homeSchool.short_name}` },
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
              <Link href={`/school/${awaySchool.id}`} className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                <div className="flex h-14 w-14 items-center justify-center bg-background-tertiary text-lg font-display font-black text-neon-blue border-2 border-neon-blue/30">
                  {awaySchool.short_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-lg text-foreground truncate">
                    {awaySchool.name}
                  </p>
                  <p className="text-xs text-foreground-subtle font-display">
                    {awaySchool.league} &bull; {awaySchool.island}
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
              <Link href={`/school/${homeSchool.id}`} className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                <div className="flex h-14 w-14 items-center justify-center bg-background-tertiary text-lg font-display font-black text-neon-pink border-2 border-neon-pink/30">
                  {homeSchool.short_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-lg text-foreground truncate">
                    {homeSchool.name}
                  </p>
                  <p className="text-xs text-foreground-subtle font-display">
                    {homeSchool.league} &bull; {homeSchool.island}
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

          {/* Verification Status - shown for live and final games */}
          {(isLive || isFinal) && (
            <div className="mt-4">
              <VerificationBadge
                isVerified={game.is_verified}
                verifiedAt={(game as { verified_at?: string | null }).verified_at}
                size="md"
              />
            </div>
          )}
        </div>

        {/* Share & Remind Section */}
        <div className="mb-6 flex items-center justify-between gap-3 p-4 border-2 border-border bg-background-secondary">
          <div className="flex items-center gap-3">
            {isScheduled && (
              <RemindMeButton
                gameId={id}
                scheduledAt={game.scheduled_at}
                homeTeam={homeSchool.short_name}
                awayTeam={awaySchool.short_name}
                sport={sportName}
              />
            )}
            <div className="text-sm text-foreground-muted font-display">
              {isScheduled ? 'Get notified before this game' : `Share this ${isLive ? 'live game' : 'final score'}`}
            </div>
          </div>
          <ShareButtons
            title={`${awaySchool.short_name} vs ${homeSchool.short_name}`}
            text={
              isLive
                ? `LIVE: ${awaySchool.short_name} ${game.away_score} - ${homeSchool.short_name} ${game.home_score} | ${sportName}`
                : isFinal
                ? `Final: ${awaySchool.short_name} ${game.away_score} - ${homeSchool.short_name} ${game.home_score} | ${sportName}`
                : `${awaySchool.short_name} vs ${homeSchool.short_name} | ${sportName}`
            }
            url={`/game/${id}`}
          />
        </div>

        {/* Game Media Section - Only show if photos, Instagram, or stream links exist */}
        {((game as { photos_url?: string | null }).photos_url || (game as { instagram_url?: string | null }).instagram_url || (game as { streaming_url?: string | null }).streaming_url) && (
          <div className="mb-6 scoreboard-panel p-4">
            <h3 className="mb-3 font-display font-bold text-foreground-muted uppercase tracking-wider text-sm flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Game Media
            </h3>
            <div className="flex flex-wrap gap-3">
              {/* Watch Live - shown prominently first if stream exists */}
              {(game as { streaming_url?: string | null }).streaming_url && (
                <a
                  href={(game as { streaming_url?: string | null }).streaming_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Watch live stream"
                  className="flex items-center gap-2 px-4 py-2 border-2 border-neon-yellow bg-neon-yellow/10 hover:bg-neon-yellow/20 transition-colors font-display text-sm font-bold text-neon-yellow"
                >
                  <Play className="h-4 w-4" />
                  Watch Live
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {(game as { photos_url?: string | null }).photos_url && (
                <a
                  href={(game as { photos_url?: string | null }).photos_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View photos"
                  className="flex items-center gap-2 px-4 py-2 border-2 border-neon-blue bg-neon-blue/10 hover:bg-neon-blue/20 transition-colors font-display text-sm font-bold text-neon-blue"
                >
                  <Camera className="h-4 w-4" />
                  View Photos
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {(game as { instagram_url?: string | null }).instagram_url && (
                <a
                  href={(game as { instagram_url?: string | null }).instagram_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Instagram post"
                  className="flex items-center gap-2 px-4 py-2 border-2 border-neon-pink bg-neon-pink/10 hover:bg-neon-pink/20 transition-colors font-display text-sm font-bold text-neon-pink"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram Post
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Tabs for Chat/Updates/Predictions/Report */}
        <Tabs defaultValue="chat" className="mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
            {(game as { predictions_enabled?: boolean }).predictions_enabled && (
              <TabsTrigger value="predictions" className="flex-1">Predict</TabsTrigger>
            )}
            <TabsTrigger value="updates" className="flex-1">Updates</TabsTrigger>
            <TabsTrigger value="report" className="flex-1">Report</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <GameChat gameId={id} />
          </TabsContent>

          {/* Predictions Tab - Only shown when predictions_enabled */}
          {(game as { predictions_enabled?: boolean }).predictions_enabled && (
            <TabsContent value="predictions">
              <div className="space-y-4">
                {/* Before game: Show prediction form and audience expectation */}
                {isScheduled && (
                  <>
                    <PredictionForm
                      gameId={id}
                      userId={user?.id}
                      homeTeam={homeSchool}
                      awayTeam={awaySchool}
                    />
                    <AudienceExpectation
                      gameId={id}
                      homeTeam={homeSchool}
                      awayTeam={awaySchool}
                    />
                  </>
                )}

                {/* During game: Show locked notice and audience expectation */}
                {isLive && (
                  <>
                    <div className="scoreboard-panel p-4 text-center">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-foreground-muted" />
                      <p className="font-display font-bold text-foreground mb-1">Predictions Locked</p>
                      <p className="text-sm text-foreground-muted">
                        The game has started. Check back after the final whistle to see results!
                      </p>
                    </div>
                    <AudienceExpectation
                      gameId={id}
                      homeTeam={homeSchool}
                      awayTeam={awaySchool}
                    />
                  </>
                )}

                {/* After game: Show results */}
                {isFinal && (
                  <PredictionResults
                    gameId={id}
                    userId={user?.id}
                    homeTeam={homeSchool}
                    awayTeam={awaySchool}
                    actualHomeScore={game.home_score}
                    actualAwayScore={game.away_score}
                  />
                )}
              </div>
            </TabsContent>
          )}

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
              href={`/school/${awaySchool.id}`}
              className="flex items-center justify-between p-3 border-2 border-border bg-background-secondary hover:border-neon-blue transition-colors"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-neon-blue" />
                <div>
                  <p className="font-display font-bold text-sm">{awaySchool.name}</p>
                  <p className="text-xs text-foreground-muted">{awaySchool.league}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground-muted" />
            </Link>

            {/* Home Team School */}
            <Link
              href={`/school/${homeSchool.id}`}
              className="flex items-center justify-between p-3 border-2 border-border bg-background-secondary hover:border-neon-pink transition-colors"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-neon-pink" />
                <div>
                  <p className="font-display font-bold text-sm">{homeSchool.name}</p>
                  <p className="text-xs text-foreground-muted">{homeSchool.league}</p>
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
