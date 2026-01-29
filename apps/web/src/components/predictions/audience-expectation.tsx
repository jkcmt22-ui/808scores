'use client'

import { Loader2, Users, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAudienceExpectation } from '@/hooks/use-predictions'
import type { School } from '@/types/database'

type TeamInfo = Pick<School, 'id' | 'short_name' | 'name'>

interface AudienceExpectationProps {
  gameId: string
  homeTeam: TeamInfo
  awayTeam: TeamInfo
  className?: string
}

export function AudienceExpectation({
  gameId,
  homeTeam,
  awayTeam,
  className,
}: AudienceExpectationProps) {
  const { expectation, isLoading, error } = useAudienceExpectation(gameId)

  if (isLoading) {
    return (
      <Card className={cn('p-4 border-2 border-border', className)}>
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
        </div>
      </Card>
    )
  }

  if (error || !expectation || expectation.totalPredictions === 0) {
    return (
      <Card className={cn('p-4 border-2 border-border', className)}>
        <div className="text-center py-4">
          <Users className="h-6 w-6 mx-auto mb-2 text-foreground-muted" />
          <p className="text-sm text-foreground-muted">
            No predictions yet. Be the first!
          </p>
        </div>
      </Card>
    )
  }

  const homeWinPct = expectation.homeWinPct ?? 0
  const awayWinPct = expectation.awayWinPct ?? 0
  const tiePct = expectation.tiePct ?? 0

  return (
    <Card className={cn('p-4 border-2 border-border', className)}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-neon-blue" />
        <span className="font-display font-bold text-foreground">Audience Expectation</span>
        <span className="text-xs text-foreground-muted ml-auto">
          {expectation.totalPredictions} prediction{expectation.totalPredictions !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Win Probability Bars */}
      <div className="space-y-3 mb-4">
        {/* Away Team */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-display font-bold text-neon-blue">{awayTeam.short_name}</span>
            <span className="text-foreground-muted">{awayWinPct}%</span>
          </div>
          <div className="h-3 bg-background-tertiary overflow-hidden">
            <div
              className="h-full bg-neon-blue transition-all duration-500"
              style={{ width: `${awayWinPct}%` }}
            />
          </div>
        </div>

        {/* Home Team */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-display font-bold text-neon-pink">{homeTeam.short_name}</span>
            <span className="text-foreground-muted">{homeWinPct}%</span>
          </div>
          <div className="h-3 bg-background-tertiary overflow-hidden">
            <div
              className="h-full bg-neon-pink transition-all duration-500"
              style={{ width: `${homeWinPct}%` }}
            />
          </div>
        </div>

        {/* Tie */}
        {tiePct > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-display text-foreground-muted">Tie</span>
              <span className="text-foreground-muted">{tiePct}%</span>
            </div>
            <div className="h-3 bg-background-tertiary overflow-hidden">
              <div
                className="h-full bg-foreground-muted transition-all duration-500"
                style={{ width: `${tiePct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Average Score Prediction */}
      {(expectation.avgHomeScore !== null || expectation.avgAwayScore !== null) && (
        <div className="border-t border-border pt-3">
          <p className="text-xs text-foreground-muted text-center mb-2">Average Predicted Score</p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-xs text-foreground-muted">{awayTeam.short_name}</p>
              <p className="text-xl font-bold font-display text-neon-blue">
                {expectation.avgAwayScore?.toFixed(1) ?? '-'}
              </p>
            </div>
            <span className="text-lg text-foreground-muted">-</span>
            <div className="text-center">
              <p className="text-xs text-foreground-muted">{homeTeam.short_name}</p>
              <p className="text-xl font-bold font-display text-neon-pink">
                {expectation.avgHomeScore?.toFixed(1) ?? '-'}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
