'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trophy, AlertCircle, Check, Edit2, Trash2, Lock } from 'lucide-react'
import { Button, Input, Badge, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { usePrediction, useSubmitPrediction, usePredictionsOpen } from '@/hooks/use-predictions'
import type { School } from '@/types/database'

type TeamInfo = Pick<School, 'id' | 'short_name' | 'name'>

interface PredictionFormProps {
  gameId: string
  userId: string | undefined
  homeTeam: TeamInfo
  awayTeam: TeamInfo
  onPredictionChange?: () => void
}

export function PredictionForm({
  gameId,
  userId,
  homeTeam,
  awayTeam,
  onPredictionChange,
}: PredictionFormProps) {
  const { prediction, isLoading: loadingPrediction } = usePrediction(gameId, userId)
  const { submit, remove, isSubmitting, error: submitError } = useSubmitPrediction()
  const { open: predictionsOpen, reason: lockedReason, isLoading: loadingStatus } = usePredictionsOpen(gameId)

  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Initialize form with existing prediction
  useEffect(() => {
    if (prediction) {
      setHomeScore(prediction.predicted_home_score.toString())
      setAwayScore(prediction.predicted_away_score.toString())
    } else {
      setHomeScore('')
      setAwayScore('')
    }
  }, [prediction])

  const handleSubmit = async () => {
    if (!userId) {
      setLocalError('You must be logged in to make predictions')
      return
    }

    const home = parseInt(homeScore)
    const away = parseInt(awayScore)

    if (isNaN(home) || isNaN(away)) {
      setLocalError('Please enter valid scores')
      return
    }

    if (home < 0 || away < 0) {
      setLocalError('Scores must be non-negative')
      return
    }

    setLocalError(null)
    const result = await submit(gameId, userId, home, away)
    if (result) {
      setIsEditing(false)
      onPredictionChange?.()
    }
  }

  const handleDelete = async () => {
    if (!userId) return

    const confirmed = window.confirm('Are you sure you want to remove your prediction?')
    if (!confirmed) return

    const success = await remove(gameId, userId)
    if (success) {
      setHomeScore('')
      setAwayScore('')
      onPredictionChange?.()
    }
  }

  // Not logged in
  if (!userId) {
    return (
      <Card className="p-4 border-2 border-border">
        <div className="text-center py-4">
          <Trophy className="h-8 w-8 mx-auto mb-2 text-foreground-muted" />
          <p className="text-sm text-foreground-muted">
            Log in to make your prediction and win points!
          </p>
        </div>
      </Card>
    )
  }

  // Loading state
  if (loadingPrediction || loadingStatus) {
    return (
      <Card className="p-4 border-2 border-border">
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-neon-yellow" />
        </div>
      </Card>
    )
  }

  // Predictions locked
  if (!predictionsOpen && !prediction) {
    return (
      <Card className="p-4 border-2 border-border bg-background-secondary">
        <div className="text-center py-4">
          <Lock className="h-8 w-8 mx-auto mb-2 text-foreground-muted" />
          <p className="font-display font-bold text-foreground mb-1">Predictions Locked</p>
          <p className="text-sm text-foreground-muted">{lockedReason}</p>
        </div>
      </Card>
    )
  }

  // User has prediction and not editing
  if (prediction && !isEditing) {
    return (
      <Card className="p-4 border-2 border-neon-green/30 bg-neon-green/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-neon-green" />
            <span className="font-display font-bold text-neon-green">Your Prediction</span>
          </div>
          {predictionsOpen && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-foreground-muted hover:text-neon-blue"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-foreground-muted hover:text-neon-pink"
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 py-4">
          <div className="text-center">
            <p className="text-xs text-foreground-muted mb-1">{awayTeam.short_name}</p>
            <p className="text-3xl font-bold font-display text-neon-blue">
              {prediction.predicted_away_score}
            </p>
          </div>
          <span className="text-2xl text-foreground-muted">-</span>
          <div className="text-center">
            <p className="text-xs text-foreground-muted mb-1">{homeTeam.short_name}</p>
            <p className="text-3xl font-bold font-display text-neon-pink">
              {prediction.predicted_home_score}
            </p>
          </div>
        </div>

        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            {prediction.predicted_home_score > prediction.predicted_away_score
              ? `${homeTeam.short_name} wins`
              : prediction.predicted_away_score > prediction.predicted_home_score
                ? `${awayTeam.short_name} wins`
                : 'Tie game'}
          </Badge>
        </div>

        {!predictionsOpen && (
          <p className="text-xs text-foreground-muted text-center mt-3">
            <Lock className="h-3 w-3 inline mr-1" />
            Predictions are now locked
          </p>
        )}
      </Card>
    )
  }

  // Form for new/edit prediction
  return (
    <Card className="p-4 border-2 border-neon-yellow/30">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-neon-yellow" />
        <span className="font-display font-bold text-foreground">
          {prediction ? 'Edit Prediction' : 'Make Your Prediction'}
        </span>
      </div>

      <div className="space-y-4">
        {/* Score inputs */}
        <div className="grid grid-cols-2 gap-4">
          {/* Away Team */}
          <div>
            <label className="block text-xs text-foreground-muted mb-1 text-center">
              {awayTeam.short_name}
            </label>
            <Input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="Score"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              className="text-2xl font-bold text-center h-14"
            />
          </div>
          {/* Home Team */}
          <div>
            <label className="block text-xs text-foreground-muted mb-1 text-center">
              {homeTeam.short_name}
            </label>
            <Input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="Score"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              className="text-2xl font-bold text-center h-14"
            />
          </div>
        </div>

        {/* Error display */}
        {(localError || submitError) && (
          <div className="flex items-center gap-2 p-2 text-sm text-neon-pink bg-neon-pink/10 border border-neon-pink/30">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{localError || submitError}</span>
          </div>
        )}

        {/* Points info */}
        <div className="text-center text-xs text-foreground-muted">
          <p>Exact match: <span className="text-neon-yellow font-bold">50 pts</span></p>
          <p>Top 3: <span className="text-neon-blue font-bold">25 pts</span> | Top 10: <span className="text-foreground">10 pts</span></p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {prediction && (
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                setHomeScore(prediction.predicted_home_score.toString())
                setAwayScore(prediction.predicted_away_score.toString())
                setLocalError(null)
              }}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !homeScore || !awayScore}
            className={cn('flex-1', !prediction && 'w-full')}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : prediction ? (
              'Update Prediction'
            ) : (
              'Submit Prediction'
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
