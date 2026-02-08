'use client'

import { use, useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Camera,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  Clock,
  WifiOff,
  CloudOff,
} from 'lucide-react'
import { Button, Card, Input, Badge, Skeleton } from '@/components/ui'
import { useGame, useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { addToQueue, isOnline, onOnlineStatusChange } from '@/lib/offline-queue'
import { cn } from '@/lib/utils'
import { getOvertimePeriods } from '@/lib/sport-periods'
import type { PeriodsConfig, SubmissionType as DBSubmissionType } from '@/types/database'
import { getHomeSchool, getAwaySchool } from '@/types/database'
import { awardSubmissionPoints } from '@/lib/points/ledger'
import type { PointsBreakdown } from '@/lib/points/calculator'

type SubmissionType = 'period_score' | 'final_score' | 'live_update' | 'event'

interface SubmitPageProps {
  params: Promise<{ gameId: string }>
}

export default function SubmitPage({ params }: SubmitPageProps) {
  const { gameId } = use(params)
  const router = useRouter()
  const { game, isLoading: gameLoading } = useGame(gameId)
  const { user, profile } = useAuth()
  const supabase = createClient()

  const [step, setStep] = useState<'type' | 'score' | 'extras' | 'confirm' | 'success' | 'queued'>('type')
  const [submissionType, setSubmissionType] = useState<SubmissionType | null>(null)
  const [period, setPeriod] = useState<string>('')
  const [inningHalf, setInningHalf] = useState<'top' | 'bottom'>('top')
  const [homeScore, setHomeScore] = useState<string>('')
  const [awayScore, setAwayScore] = useState<string>('')
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [hasPhoto, setHasPhoto] = useState(false)
  const [hasLocation, setHasLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOvertimePeriods, setShowOvertimePeriods] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [online, setOnline] = useState(true)
  const [submissionResult, setSubmissionResult] = useState<{
    isVerified: boolean
    gameUpdated: boolean
    message: string
    pointsEarned: number
  } | null>(null)

  // Track online/offline status
  useEffect(() => {
    setOnline(isOnline())
    return onOnlineStatusChange(setOnline)
  }, [])

  // Parse periods config
  const periodsConfig = useMemo(() => {
    if (!game) return null
    return game.sport.periods_config as unknown as PeriodsConfig
  }, [game])

  // Loading state
  if (gameLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-background-secondary">
          <div className="flex h-14 items-center px-4">
            <Skeleton className="h-6 w-20" />
          </div>
        </header>
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (!game || !periodsConfig) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <AlertCircle className="mb-4 h-12 w-12 text-foreground-muted" />
        <h1 className="mb-2 text-xl font-semibold text-foreground">Game not found</h1>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    )
  }

  // Block submissions to finalized/verified games (general users only)
  const isUserTrustedOrHigher = profile?.is_trusted_reporter || profile?.is_admin || profile?.is_super_admin
  if (game.status === 'final' && game.is_verified && !isUserTrustedOrHigher) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <CheckCircle className="mb-4 h-12 w-12 text-neon-green" />
        <h1 className="mb-2 text-xl font-semibold text-foreground">Score Already Verified</h1>
        <p className="mb-4 text-sm text-foreground-muted text-center">
          This game&apos;s final score has been verified. Only trusted reporters can update it.
        </p>
        <Button onClick={() => router.push(`/game/${gameId}`)}>View Game</Button>
      </div>
    )
  }

  // After migration 072: Get school data from team or directly
  const homeSchool = getHomeSchool(game)
  const awaySchool = getAwaySchool(game)

  const regularPeriods = periodsConfig.names || ['Q1', 'Q2', 'Q3', 'Q4']
  const overtimePeriods = periodsConfig.overtime ? getOvertimePeriods(periodsConfig) : []
  const periods = showOvertimePeriods ? [...regularPeriods, ...overtimePeriods] : regularPeriods
  const hasOvertimeOption = periodsConfig.overtime !== null && periodsConfig.overtime !== undefined
  const isInningsBased = periodsConfig.type === 'innings'

  // Get the full period string including inning half
  const getFullPeriod = () => {
    if (isInningsBased && period) {
      return `${inningHalf === 'top' ? 'Top' : 'Bot'} ${period}`
    }
    return period
  }

  const isTrustedOrHigher = profile?.is_trusted_reporter || profile?.is_admin || profile?.is_super_admin

  // Simplified 1:1 points: 1 point per submission, 3x for golden game
  const calculatePoints = () => {
    const base = 1
    const goldenGameMultiplier = game.golden_game ? 3 : 1
    return Math.min(Math.round(base * goldenGameMultiplier), 3)
  }

  // Build a points breakdown for the ledger
  const buildPointsBreakdown = (): PointsBreakdown => {
    const base = 1
    const goldenGameMultiplier = game.golden_game ? 3 : 1
    const total = Math.min(Math.round(base * goldenGameMultiplier), 3)

    const breakdown: string[] = ['Score submitted: +1 pt']
    if (game.golden_game) breakdown.push('Golden game: 3x')

    return {
      base,
      firstToReport: 0,
      goldenGameMultiplier,
      total,
      breakdown,
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      router.push(`/login?redirect=/submit/${gameId}`)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    const fullPeriod = getFullPeriod()

    // If offline, queue the submission for later
    if (!online) {
      try {
        const isOT = overtimePeriods.includes(period)
        const otCount = isOT ? overtimePeriods.indexOf(period) + 1 : 0
        await addToQueue({
          gameId,
          gameName: `${awaySchool.short_name} @ ${homeSchool.short_name}`,
          submissionType: submissionType as 'period_score' | 'final_score' | 'live_update',
          period: submissionType === 'final_score' ? null : fullPeriod,
          homeScore: parseInt(homeScore),
          awayScore: parseInt(awayScore),
          timeRemaining: timeRemaining || null,
          isOvertime: isOT,
          overtimeCount: otCount,
          hasPhoto,
          hasLocation,
          pointsEarned: calculatePoints(),
        })
        setStep('queued')
      } catch (err) {
        console.error('Failed to queue submission:', err)
        setSubmitError('Failed to save offline. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // Check database connection
    if (!supabase) {
      setSubmitError('Database connection not available')
      setIsSubmitting(false)
      return
    }

    // Online submission via API (handles rate limiting, verification, points)
    try {
      const isOT = overtimePeriods.includes(period)
      const otCount = isOT ? overtimePeriods.indexOf(period) + 1 : 0

      const response = await fetch(`/api/games/${gameId}/submit-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission_type: submissionType,
          home_score: parseInt(homeScore),
          away_score: parseInt(awayScore),
          period: submissionType === 'final_score' ? null : fullPeriod,
          time_remaining: timeRemaining || null,
          is_overtime: isOT,
          overtime_count: otCount,
          photo_url: hasPhoto ? 'pending_upload' : null,
          at_game: hasLocation,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 429) {
          throw new Error(result.message || 'Too many submissions. Please wait.')
        }
        throw new Error(result.message || 'Failed to submit score')
      }

      // Update submission count locally
      if (profile && supabase) {
        const { error: countError } = await supabase
          .from('users')
          .update({ submission_count: (profile.submission_count || 0) + 1 } as never)
          .eq('id', user.id)

        if (countError) console.error('Error updating submission count:', countError)
      }

      // Store verification status for success message
      setSubmissionResult({
        isVerified: result.is_verified,
        gameUpdated: result.game_updated,
        message: result.message,
        pointsEarned: result.submission?.points_earned ?? calculatePoints(),
      })

      setStep('success')
    } catch (err) {
      console.error('Submission error:', err)
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit score')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'type':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold font-display text-foreground">What are you reporting?</h2>
            <div className="grid gap-3">
              <button
                onClick={() => {
                  setSubmissionType('final_score')
                  setStep('score')
                }}
                className="border-2 border-border bg-background-secondary p-4 text-left transition-colors hover:border-neon-blue"
              >
                <p className="font-semibold font-display text-foreground">Final Score</p>
                <p className="text-sm text-foreground-muted">The game has ended</p>
                <Badge className="mt-2">+10 pts</Badge>
              </button>
              <button
                onClick={() => {
                  setSubmissionType('period_score')
                  setStep('score')
                }}
                className="border-2 border-border bg-background-secondary p-4 text-left transition-colors hover:border-neon-blue"
              >
                <p className="font-semibold font-display text-foreground">Period Score</p>
                <p className="text-sm text-foreground-muted">End of quarter/half/set</p>
                <Badge className="mt-2">+5 pts</Badge>
              </button>
              <button
                onClick={() => {
                  setSubmissionType('live_update')
                  setStep('score')
                }}
                className="border-2 border-border bg-background-secondary p-4 text-left transition-colors hover:border-neon-blue"
              >
                <p className="font-semibold font-display text-foreground">Live Update</p>
                <p className="text-sm text-foreground-muted">Current score during play</p>
                <Badge className="mt-2">+5 pts</Badge>
              </button>
            </div>
          </div>
        )

      case 'score':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold font-display text-foreground">
              {submissionType === 'final_score' ? 'Enter Final Score' : 'Enter Score'}
            </h2>

            {/* Period selector (not for final) */}
            {submissionType !== 'final_score' && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-foreground">
                    {isInningsBased ? 'Inning' : 'Period'}
                  </label>
                  {hasOvertimeOption && (
                    <button
                      onClick={() => setShowOvertimePeriods(!showOvertimePeriods)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs font-medium px-2 py-1 transition-colors',
                        showOvertimePeriods
                          ? 'bg-neon-pink/20 text-neon-pink'
                          : 'bg-background-tertiary text-foreground-muted hover:text-foreground'
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      {showOvertimePeriods ? 'Hide Extra' : 'Show Extra'}
                    </button>
                  )}
                </div>

                {/* Top/Bottom selector for innings */}
                {isInningsBased && (
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setInningHalf('top')}
                      className={cn(
                        'flex-1 px-4 py-2 text-sm font-medium font-display transition-colors border-2',
                        inningHalf === 'top'
                          ? 'bg-neon-blue text-black border-neon-blue'
                          : 'bg-background-tertiary text-foreground-muted border-border hover:border-neon-blue'
                      )}
                    >
                      Top (Away Batting)
                    </button>
                    <button
                      onClick={() => setInningHalf('bottom')}
                      className={cn(
                        'flex-1 px-4 py-2 text-sm font-medium font-display transition-colors border-2',
                        inningHalf === 'bottom'
                          ? 'bg-neon-pink text-white border-neon-pink'
                          : 'bg-background-tertiary text-foreground-muted border-border hover:border-neon-pink'
                      )}
                    >
                      Bottom (Home Batting)
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {periods.map((p) => {
                    const isOvertimePeriod = overtimePeriods.includes(p)
                    return (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={cn(
                          'px-4 py-2 text-sm font-medium transition-colors border-2',
                          period === p
                            ? isOvertimePeriod
                              ? 'bg-neon-pink text-white border-neon-pink'
                              : 'bg-neon-blue text-black border-neon-blue'
                            : isOvertimePeriod
                              ? 'bg-neon-pink/20 text-neon-pink border-neon-pink/30 hover:border-neon-pink'
                              : 'bg-background-tertiary text-foreground-muted border-border hover:border-neon-blue'
                        )}
                      >
                        {isInningsBased ? `${p}${p === '1' ? 'st' : p === '2' ? 'nd' : p === '3' ? 'rd' : 'th'}` : p}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Time remaining (for live updates) */}
            {submissionType === 'live_update' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Time Remaining (optional)</label>
                <Input
                  type="text"
                  placeholder="e.g., 5:42"
                  value={timeRemaining}
                  onChange={(e) => setTimeRemaining(e.target.value)}
                />
              </div>
            )}

            {/* Score inputs */}
            <div className="space-y-4">
              {/* Away Team */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-background-tertiary text-sm font-bold font-display text-neon-blue border-2 border-neon-blue/30">
                  {awaySchool.short_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-sm font-medium text-foreground">{awaySchool.short_name}</p>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Score"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="text-2xl font-bold text-center h-14"
                  />
                </div>
              </div>

              {/* Home Team */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-background-tertiary text-sm font-bold font-display text-neon-pink border-2 border-neon-pink/30">
                  {homeSchool.short_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-sm font-medium text-foreground">{homeSchool.short_name}</p>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Score"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="text-2xl font-bold text-center h-14"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep('extras')}
              disabled={!homeScore || !awayScore || (submissionType !== 'final_score' && !period)}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        )

      case 'extras':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold font-display text-foreground">Add extras for bonus points</h2>

            <div className="space-y-3">
              {/* Photo */}
              <button
                onClick={() => setHasPhoto(!hasPhoto)}
                className={cn(
                  'flex w-full items-center justify-between border-2 p-4 transition-colors',
                  hasPhoto
                    ? 'border-neon-green bg-neon-green/10'
                    : 'border-border bg-background-secondary hover:border-neon-blue'
                )}
              >
                <div className="flex items-center gap-3">
                  <Camera className={cn('h-5 w-5', hasPhoto ? 'text-neon-green' : 'text-foreground-muted')} />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Add Photo</p>
                    <p className="text-sm text-foreground-muted">Photo of scoreboard</p>
                  </div>
                </div>
                <Badge variant={hasPhoto ? 'success' : 'secondary'}>+3 pts</Badge>
              </button>

              {/* Location */}
              <button
                onClick={() => setHasLocation(!hasLocation)}
                className={cn(
                  'flex w-full items-center justify-between border-2 p-4 transition-colors',
                  hasLocation
                    ? 'border-neon-green bg-neon-green/10'
                    : 'border-border bg-background-secondary hover:border-neon-blue'
                )}
              >
                <div className="flex items-center gap-3">
                  <MapPin className={cn('h-5 w-5', hasLocation ? 'text-neon-green' : 'text-foreground-muted')} />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Share Location</p>
                    <p className="text-sm text-foreground-muted">Verify you&apos;re at the game</p>
                  </div>
                </div>
                <Badge variant={hasLocation ? 'success' : 'secondary'}>+2 pts</Badge>
              </button>
            </div>

            <Button onClick={() => setStep('confirm')} className="w-full">
              Review Submission
            </Button>
          </div>
        )

      case 'confirm':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold font-display text-foreground">Confirm your submission</h2>

            <Card>
              <div className="p-4 space-y-4">
                {/* Game */}
                <div className="text-center">
                  <p className="text-sm text-foreground-muted">{game.sport.display_name || game.sport.name}</p>
                  <p className="font-semibold text-foreground">
                    {awaySchool.short_name} @ {homeSchool.short_name}
                  </p>
                </div>

                {/* Score */}
                <div className="flex items-center justify-center gap-4 text-3xl font-bold font-display">
                  <span className="text-neon-blue">{awayScore}</span>
                  <span className="text-foreground-muted">-</span>
                  <span className="text-neon-pink">{homeScore}</span>
                </div>

                {/* Type/Period */}
                <div className="text-center text-sm text-foreground-muted">
                  {submissionType === 'final_score' ? 'Final Score' : `${getFullPeriod()} ${isInningsBased ? '' : 'Score'}`}
                  {timeRemaining && ` • ${timeRemaining} remaining`}
                </div>

                {/* Extras */}
                {(hasPhoto || hasLocation) && (
                  <div className="flex justify-center gap-2">
                    {hasPhoto && (
                      <Badge variant="success">
                        <Camera className="mr-1 h-3 w-3" />
                        Photo
                      </Badge>
                    )}
                    {hasLocation && (
                      <Badge variant="success">
                        <MapPin className="mr-1 h-3 w-3" />
                        At Game
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Points preview */}
            <Card className={cn(game.golden_game && 'border-neon-yellow bg-neon-yellow/10')}>
              <div className="p-4 text-center">
                {game.golden_game && (
                  <div className="mb-2 flex items-center justify-center gap-1 text-neon-yellow">
                    <Star className="h-4 w-4" />
                    <span className="text-sm font-medium font-display">Golden Game - 3x Points!</span>
                  </div>
                )}
                <p className="text-sm text-foreground-muted">You&apos;ll earn</p>
                <p className="text-4xl font-bold font-display neon-text-blue">{calculatePoints()} pts</p>
              </div>
            </Card>

            {submitError && (
              <div className="flex items-center gap-2 p-3 text-sm text-neon-pink bg-neon-pink/10 border border-neon-pink/30">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('score')} className="flex-1">
                Edit
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Score'
                )}
              </Button>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className={cn(
              "mb-4 flex h-20 w-20 items-center justify-center border-2",
              submissionResult?.isVerified
                ? "bg-neon-green/20 border-neon-green"
                : "bg-neon-yellow/20 border-neon-yellow"
            )}>
              <CheckCircle className={cn(
                "h-10 w-10",
                submissionResult?.isVerified ? "text-neon-green" : "text-neon-yellow"
              )} />
            </div>
            <h2 className="mb-2 text-2xl font-bold font-display text-foreground">
              {submissionResult?.isVerified ? 'Score Verified!' : 'Score Submitted!'}
            </h2>
            <p className="mb-4 text-foreground-muted max-w-xs">
              {submissionResult?.message || 'Thanks for contributing.'}
            </p>
            {!submissionResult?.isVerified && (
              <div className="mb-4 px-3 py-2 bg-neon-yellow/10 border border-neon-yellow/30 text-sm text-neon-yellow">
                <Clock className="inline h-4 w-4 mr-1" />
                Will become official in 60 seconds if no conflicts
              </div>
            )}
            <div className="mb-8 p-6 bg-neon-blue/10 border-2 border-neon-blue/30">
              <p className="text-sm text-neon-blue">Points earned</p>
              <p className="text-5xl font-bold font-display neon-text-blue">
                +{submissionResult?.pointsEarned || calculatePoints()}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push(`/game/${gameId}`)}>
                View Game
              </Button>
              <Button onClick={() => router.push('/')}>Go Home</Button>
            </div>
          </div>
        )

      case 'queued':
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center bg-neon-yellow/20 border-2 border-neon-yellow">
              <CloudOff className="h-10 w-10 text-neon-yellow" />
            </div>
            <h2 className="mb-2 text-2xl font-bold font-display text-foreground">Saved Offline!</h2>
            <p className="mb-6 text-foreground-muted max-w-xs">
              Your score has been saved and will be submitted automatically when you&apos;re back online.
            </p>
            <div className="mb-8 p-6 bg-neon-yellow/10 border-2 border-neon-yellow/30">
              <p className="text-sm text-neon-yellow">Points pending</p>
              <p className="text-5xl font-bold font-display text-neon-yellow">+{calculatePoints()}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push(`/game/${gameId}`)}>
                View Game
              </Button>
              <Button onClick={() => router.push('/')}>Go Home</Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background-secondary">
        <div className="flex h-14 items-center px-4">
          <button
            onClick={() => {
              if (step === 'type') router.back()
              else if (step === 'score') setStep('type')
              else if (step === 'extras') setStep('score')
              else if (step === 'confirm') setStep('extras')
              else router.push('/')
            }}
            className="flex items-center gap-2 text-foreground-muted hover:text-neon-blue transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-display">Back</span>
          </button>
        </div>
      </header>

      {/* Offline indicator */}
      {!online && step !== 'success' && step !== 'queued' && (
        <div className="flex items-center gap-2 px-4 py-2 bg-neon-yellow/20 border-b border-neon-yellow/30">
          <WifiOff className="h-4 w-4 text-neon-yellow" />
          <span className="text-sm text-neon-yellow font-display">
            You&apos;re offline. Score will be saved and synced later.
          </span>
        </div>
      )}

      {/* Game info banner */}
      {step !== 'success' && step !== 'queued' && (
        <div className="border-b-2 border-border bg-background-secondary px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">{game.sport.display_name || game.sport.name}</p>
              <p className="font-semibold font-display text-foreground">
                {awaySchool.short_name} @ {homeSchool.short_name}
              </p>
            </div>
            {game.golden_game && (
              <Badge variant="warning" className="gap-1">
                <Star className="h-3 w-3" />
                3x
              </Badge>
            )}
          </div>
        </div>
      )}

      <main className="p-4">{renderStep()}</main>
    </div>
  )
}
