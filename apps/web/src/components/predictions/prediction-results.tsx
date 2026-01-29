'use client'

import { Loader2, Trophy, Medal, Target, User } from 'lucide-react'
import { Card, Badge, Avatar } from '@/components/ui'
import { cn } from '@/lib/utils'
import { usePredictionResults, getUserRankFromResults } from '@/hooks/use-predictions'
import type { School, PredictionResultEntry } from '@/types/database'

type TeamInfo = Pick<School, 'id' | 'short_name' | 'name'>

interface PredictionResultsProps {
  gameId: string
  userId: string | undefined
  homeTeam: TeamInfo
  awayTeam: TeamInfo
  actualHomeScore: number
  actualAwayScore: number
  className?: string
}

// Simple user lookup component
function UserDisplay({
  userId,
  rank,
  entry,
}: {
  userId: string
  rank: number
  entry: PredictionResultEntry
}) {
  // For a real implementation, you'd fetch user data
  // For now, show a placeholder
  const isTopThree = rank <= 3
  const isTopTen = rank <= 10

  const getRankIcon = () => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-neon-yellow" />
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />
    return null
  }

  const getRankBadge = () => {
    if (entry.is_exact_match) {
      return (
        <Badge variant="success" className="text-[10px]">
          Exact Match!
        </Badge>
      )
    }
    if (isTopThree) {
      return (
        <Badge variant="warning" className="text-[10px]">
          Top 3
        </Badge>
      )
    }
    if (isTopTen) {
      return (
        <Badge variant="default" className="text-[10px]">
          Top 10
        </Badge>
      )
    }
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 border-2',
        entry.is_exact_match
          ? 'border-neon-green/50 bg-neon-green/5'
          : isTopThree
            ? 'border-neon-yellow/50 bg-neon-yellow/5'
            : isTopTen
              ? 'border-neon-blue/30 bg-neon-blue/5'
              : 'border-border bg-background-secondary'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 font-display font-bold text-sm">
          {getRankIcon() || <span className="text-foreground-muted">#{rank}</span>}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-background-tertiary border border-border flex items-center justify-center">
            <User className="h-4 w-4 text-foreground-muted" />
          </div>
          <div>
            <p className="font-display font-bold text-sm text-foreground">
              User {userId.slice(0, 8)}...
            </p>
            <p className="text-xs text-foreground-muted">
              Predicted: {entry.predicted_away_score} - {entry.predicted_home_score}
            </p>
          </div>
        </div>
      </div>

      <div className="text-right">
        {getRankBadge()}
        {entry.points_awarded > 0 && (
          <p className="text-sm font-bold text-neon-blue mt-1">+{entry.points_awarded} pts</p>
        )}
        <p className="text-xs text-foreground-muted">Error: {entry.error}</p>
      </div>
    </div>
  )
}

export function PredictionResults({
  gameId,
  userId,
  homeTeam,
  awayTeam,
  actualHomeScore,
  actualAwayScore,
  className,
}: PredictionResultsProps) {
  const { results, entries, isLoading, error } = usePredictionResults(gameId)

  if (isLoading) {
    return (
      <Card className={cn('p-4 border-2 border-border', className)}>
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
        </div>
      </Card>
    )
  }

  if (error || !results) {
    return (
      <Card className={cn('p-4 border-2 border-border', className)}>
        <div className="text-center py-4">
          <Target className="h-6 w-6 mx-auto mb-2 text-foreground-muted" />
          <p className="text-sm text-foreground-muted">
            {error || 'No prediction results available'}
          </p>
        </div>
      </Card>
    )
  }

  // Get current user's result
  const userResult = userId ? getUserRankFromResults(entries, userId) : null

  return (
    <Card className={cn('p-4 border-2 border-border', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-neon-yellow" />
        <span className="font-display font-bold text-foreground">Prediction Results</span>
      </div>

      {/* Final Score Display */}
      <div className="text-center mb-4 p-4 border-2 border-neon-green/30 bg-neon-green/5">
        <p className="text-xs text-foreground-muted mb-2">Final Score</p>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-xs text-foreground-muted">{awayTeam.short_name}</p>
            <p className="text-3xl font-bold font-display text-neon-blue">{actualAwayScore}</p>
          </div>
          <span className="text-2xl text-foreground-muted">-</span>
          <div className="text-center">
            <p className="text-xs text-foreground-muted">{homeTeam.short_name}</p>
            <p className="text-3xl font-bold font-display text-neon-pink">{actualHomeScore}</p>
          </div>
        </div>
      </div>

      {/* User's Result Highlight */}
      {userResult && (
        <div className="mb-4">
          <p className="text-xs text-foreground-muted mb-2">Your Result</p>
          <div
            className={cn(
              'p-4 border-2',
              userResult.is_exact_match
                ? 'border-neon-green bg-neon-green/10'
                : userResult.rank <= 3
                  ? 'border-neon-yellow bg-neon-yellow/10'
                  : userResult.rank <= 10
                    ? 'border-neon-blue bg-neon-blue/10'
                    : 'border-border bg-background-secondary'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-lg">
                  {userResult.is_exact_match
                    ? 'Exact Match!'
                    : userResult.rank <= 3
                      ? 'Top 3!'
                      : userResult.rank <= 10
                        ? 'Top 10!'
                        : `Rank #${userResult.rank}`}
                </p>
                <p className="text-sm text-foreground-muted">
                  Your prediction: {userResult.predicted_away_score} - {userResult.predicted_home_score}
                </p>
                <p className="text-xs text-foreground-muted">Error: {userResult.error} points off</p>
              </div>
              {userResult.points_awarded > 0 && (
                <div className="text-right">
                  <p className="text-2xl font-bold font-display neon-text-blue">
                    +{userResult.points_awarded}
                  </p>
                  <p className="text-xs text-foreground-muted">points earned</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="p-2 bg-background-secondary border border-border">
          <p className="text-lg font-bold font-display text-foreground">
            {results.total_predictions}
          </p>
          <p className="text-[10px] text-foreground-muted">Predictions</p>
        </div>
        <div className="p-2 bg-background-secondary border border-border">
          <p className="text-lg font-bold font-display text-neon-green">
            {results.exact_match_count}
          </p>
          <p className="text-[10px] text-foreground-muted">Exact Matches</p>
        </div>
        <div className="p-2 bg-background-secondary border border-border">
          <p className="text-lg font-bold font-display text-neon-yellow">
            {results.home_win_prediction_pct?.toFixed(0) ?? '-'}%
          </p>
          <p className="text-[10px] text-foreground-muted">Predicted {homeTeam.short_name}</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <p className="text-xs text-foreground-muted mb-2">Top Predictions</p>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {entries.slice(0, 10).map((entry, index) => (
            <UserDisplay
              key={entry.user_id}
              userId={entry.user_id}
              rank={entry.rank}
              entry={entry}
            />
          ))}
        </div>
        {entries.length > 10 && (
          <p className="text-xs text-foreground-muted text-center mt-2">
            +{entries.length - 10} more predictions
          </p>
        )}
      </div>
    </Card>
  )
}
