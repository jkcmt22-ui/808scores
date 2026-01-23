'use client'

import { use, useState, useMemo } from 'react'
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
} from 'lucide-react'
import { Button, Card, Input, Badge, Skeleton } from '@/components/ui'
import { useGame, useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { PeriodsConfig, SubmissionType as DBSubmissionType } from '@/types/database'

type SubmissionType = 'period_score' | 'final_score' | 'live_update' | 'event'

// Helper to generate overtime period names based on sport type
function getOvertimePeriods(periodsConfig: PeriodsConfig, maxOT: number = 3): string[] {
  const overtimePeriods: string[] = []

  if (!periodsConfig.overtime) return overtimePeriods

  switch (periodsConfig.overtime.type) {
    case 'kansas':
      for (let i = 1; i <= maxOT; i++) {
        overtimePeriods.push(i === 1 ? 'OT' : `${i}OT`)
      }
      break
    case 'periods':
      for (let i = 1; i <= maxOT; i++) {
        overtimePeriods.push(i === 1 ? 'OT' : `${i}OT`)
      }
      break
    case 'golden_goal':
      overtimePeriods.push('OT1', 'OT2', 'PKs')
      break
    case 'extra_innings':
      const baseInnings = periodsConfig.count
      for (let i = 1; i <= maxOT; i++) {
        overtimePeriods.push(`${baseInnings + i}`)
      }
      break
    default:
      for (let i = 1; i <= maxOT; i++) {
        overtimePeriods.push(i === 1 ? 'OT' : `${i}OT`)
      }
  }

  return overtimePeriods
}

interface SubmitPageProps {
  params: Promise<{ gameId: string }>
}

export default function SubmitPage({ params }: SubmitPageProps) {
  const { gameId } = use(params)
  const router = useRouter()
  const { game, isLoading: gameLoading } = useGame(gameId)
  const { user, profile } = useAuth()
  const supabase = createClient()!

  const [step, setStep] = useState<'type' | 'score' | 'extras' | 'confirm' | 'success'>('type')
  const [submissionType, setSubmissionType] = useState<SubmissionType | null>(null)
  const [period, setPeriod] = useState<string>('')
  const [homeScore, setHomeScore] = useState<string>('')
  const [awayScore, setAwayScore] = useState<string>('')
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [hasPhoto, setHasPhoto] = useState(false)
  const [hasLocation, setHasLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOvertimePeriods, setShowOvertimePeriods] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

  const regularPeriods = periodsConfig.names || ['Q1', 'Q2', 'Q3', 'Q4']
  const overtimePeriods = periodsConfig.overtime ? getOvertimePeriods(periodsConfig) : []
  const periods = showOvertimePeriods ? [...regularPeriods, ...overtimePeriods] : regularPeriods
  const hasOvertimeOption = periodsConfig.overtime !== null && periodsConfig.overtime !== undefined

  const calculatePoints = () => {
    let points = 0
    if (submissionType === 'final_score') points = 10
    else if (submissionType === 'period_score') points = 5
    else if (submissionType === 'live_update') points = 5

    if (hasPhoto) points += 3
    if (hasLocation) points += 2
    if (game.golden_game) points *= 3

    return points
  }

  const handleSubmit = async () => {
    if (!user) {
      router.push(`/login?redirect=/submit/${gameId}`)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Create the submission
      const submissionData = {
        game_id: gameId,
        user_id: user.id,
        submission_type: submissionType as DBSubmissionType,
        period: submissionType === 'final_score' ? null : period,
        home_score: parseInt(homeScore),
        away_score: parseInt(awayScore),
        time_remaining: timeRemaining || null,
        photo_url: hasPhoto ? 'pending_upload' : null,
        at_game: hasLocation,
        points_earned: calculatePoints(),
        status: 'pending' as const,
      }
      const { error: submissionError } = await supabase
        .from('submissions')
        .insert(submissionData as never)
        .select()
        .single()

      if (submissionError) throw submissionError

      // If this is a final score or the user is trusted, update the game
      const isTrusted = profile?.tier === 'trusted' || profile?.tier === 'elite'

      if (submissionType === 'final_score') {
        // Update game to final status
        const gameUpdate = {
          status: 'final' as const,
          home_score: parseInt(homeScore),
          away_score: parseInt(awayScore),
          current_period: null,
          time_remaining: null,
          is_verified: isTrusted,
          verification_method: isTrusted ? ('trusted' as const) : null,
        }
        const { error: gameError } = await supabase
          .from('games')
          .update(gameUpdate as never)
          .eq('id', gameId)

        if (gameError) console.error('Error updating game:', gameError)
      } else if (submissionType === 'live_update' || submissionType === 'period_score') {
        // Update game with live score
        const isOT = overtimePeriods.includes(period)
        const otCount = isOT ? overtimePeriods.indexOf(period) + 1 : 0

        const gameUpdate = {
          status: 'in_progress' as const,
          home_score: parseInt(homeScore),
          away_score: parseInt(awayScore),
          current_period: period,
          time_remaining: timeRemaining || null,
          is_overtime: isOT,
          overtime_count: otCount,
          is_verified: isTrusted,
          verification_method: isTrusted ? ('trusted' as const) : null,
        }
        const { error: gameError } = await supabase
          .from('games')
          .update(gameUpdate as never)
          .eq('id', gameId)

        if (gameError) console.error('Error updating game:', gameError)
      }

      // Update user points if they have a profile
      if (profile) {
        const newPoints = (profile.total_points || 0) + calculatePoints()
        const userUpdate = {
          total_points: newPoints,
          submission_count: (profile.submission_count || 0) + 1,
        }
        const { error: profileError } = await supabase
          .from('users')
          .update(userUpdate as never)
          .eq('id', user.id)

        if (profileError) console.error('Error updating profile:', profileError)
      }

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
                  <label className="block text-sm font-medium text-foreground">Period</label>
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
                      {showOvertimePeriods ? 'Hide OT' : 'Show OT'}
                    </button>
                  )}
                </div>
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
                        {p}
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
                  {game.away_team.short_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-sm font-medium text-foreground">{game.away_team.short_name}</p>
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
                  {game.home_team.short_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-sm font-medium text-foreground">{game.home_team.short_name}</p>
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
                    {game.away_team.short_name} @ {game.home_team.short_name}
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
                  {submissionType === 'final_score' ? 'Final Score' : `${period} Score`}
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
            <div className="mb-4 flex h-20 w-20 items-center justify-center bg-neon-green/20 border-2 border-neon-green">
              <CheckCircle className="h-10 w-10 text-neon-green" />
            </div>
            <h2 className="mb-2 text-2xl font-bold font-display text-foreground">Score Submitted!</h2>
            <p className="mb-6 text-foreground-muted">
              Thanks for contributing. Your score is being verified.
            </p>
            <div className="mb-8 p-6 bg-neon-blue/10 border-2 border-neon-blue/30">
              <p className="text-sm text-neon-blue">Points earned</p>
              <p className="text-5xl font-bold font-display neon-text-blue">+{calculatePoints()}</p>
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

      {/* Game info banner */}
      {step !== 'success' && (
        <div className="border-b-2 border-border bg-background-secondary px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">{game.sport.display_name || game.sport.name}</p>
              <p className="font-semibold font-display text-foreground">
                {game.away_team.short_name} @ {game.home_team.short_name}
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
