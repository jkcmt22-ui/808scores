'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { getSportEmoji } from '@/lib/sport-utils'
import type { GameWithTeams } from '@/types/database'

interface TeamStatsProps {
  schoolId: string
  games: GameWithTeams[]
  className?: string
}

interface SportStats {
  sportId: string
  sportName: string
  sportCode: string
  wins: number
  losses: number
  ties: number
  pointsFor: number
  pointsAgainst: number
  streak: string
  lastFive: ('W' | 'L' | 'T')[]
}

export function TeamStats({ schoolId, games, className }: TeamStatsProps) {
  const statsBySport = useMemo(() => {
    const stats = new Map<string, SportStats>()

    // Sort games by date for proper streak calculation
    const sortedGames = [...games]
      .filter(g => g.status === 'final')
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

    for (const game of sortedGames) {
      const sportId = game.sport_id
      if (!stats.has(sportId)) {
        stats.set(sportId, {
          sportId,
          sportName: game.sport.display_name || game.sport.name,
          sportCode: game.sport.code,
          wins: 0,
          losses: 0,
          ties: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          streak: '-',
          lastFive: [],
        })
      }

      const sportStats = stats.get(sportId)!
      const isHome = game.home_team_id === schoolId
      const schoolScore = isHome ? game.home_score : game.away_score
      const opponentScore = isHome ? game.away_score : game.home_score

      sportStats.pointsFor += schoolScore
      sportStats.pointsAgainst += opponentScore

      let result: 'W' | 'L' | 'T'
      if (schoolScore > opponentScore) {
        sportStats.wins++
        result = 'W'
      } else if (schoolScore < opponentScore) {
        sportStats.losses++
        result = 'L'
      } else {
        sportStats.ties++
        result = 'T'
      }

      sportStats.lastFive.push(result)
      if (sportStats.lastFive.length > 5) {
        sportStats.lastFive.shift()
      }
    }

    // Calculate streaks
    for (const sportStats of stats.values()) {
      if (sportStats.lastFive.length > 0) {
        const reversed = [...sportStats.lastFive].reverse()
        let streakCount = 1
        const streakType = reversed[0]
        for (let i = 1; i < reversed.length; i++) {
          if (reversed[i] === streakType) {
            streakCount++
          } else {
            break
          }
        }
        sportStats.streak = `${streakType}${streakCount}`
      }
    }

    return Array.from(stats.values())
  }, [games, schoolId])

  if (statsBySport.length === 0) {
    return null
  }

  // Calculate overall stats
  const overall = useMemo(() => {
    return statsBySport.reduce(
      (acc, sport) => ({
        wins: acc.wins + sport.wins,
        losses: acc.losses + sport.losses,
        ties: acc.ties + sport.ties,
        pointsFor: acc.pointsFor + sport.pointsFor,
        pointsAgainst: acc.pointsAgainst + sport.pointsAgainst,
      }),
      { wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0 }
    )
  }, [statsBySport])

  const totalGames = overall.wins + overall.losses + overall.ties
  const winPct = totalGames > 0 ? (overall.wins / totalGames * 100).toFixed(1) : '0.0'
  const avgPointsFor = totalGames > 0 ? (overall.pointsFor / totalGames).toFixed(1) : '0.0'
  const avgPointsAgainst = totalGames > 0 ? (overall.pointsAgainst / totalGames).toFixed(1) : '0.0'

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall Stats */}
      <div className="border-2 border-border bg-background-secondary p-4">
        <h3 className="font-display font-bold text-foreground-muted uppercase tracking-wider text-sm mb-4">
          Season Overview
        </h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="font-display text-2xl font-bold text-neon-green">{overall.wins}</div>
            <div className="text-xs text-foreground-muted uppercase">Wins</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-foreground-muted">{overall.losses}</div>
            <div className="text-xs text-foreground-muted uppercase">Losses</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-neon-blue">{winPct}%</div>
            <div className="text-xs text-foreground-muted uppercase">Win %</div>
          </div>
          <div>
            <div className={cn(
              'font-display text-2xl font-bold',
              overall.pointsFor > overall.pointsAgainst ? 'text-neon-green' : 'text-neon-pink'
            )}>
              {overall.pointsFor > overall.pointsAgainst ? '+' : ''}{overall.pointsFor - overall.pointsAgainst}
            </div>
            <div className="text-xs text-foreground-muted uppercase">Pt Diff</div>
          </div>
        </div>

        {/* Points averages */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="font-display text-xl font-bold text-foreground">{avgPointsFor}</div>
            <div className="text-xs text-foreground-muted uppercase">Pts/Game</div>
          </div>
          <div className="text-center">
            <div className="font-display text-xl font-bold text-foreground">{avgPointsAgainst}</div>
            <div className="text-xs text-foreground-muted uppercase">Opp Pts/Game</div>
          </div>
        </div>
      </div>

      {/* Stats by Sport */}
      {statsBySport.length > 1 && (
        <div className="border-2 border-border bg-background-secondary">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-display font-bold text-foreground-muted uppercase tracking-wider text-sm">
              By Sport
            </h3>
          </div>
          <div className="divide-y divide-border">
            {statsBySport.map(sport => {
              const gamesPlayed = sport.wins + sport.losses + sport.ties
              const sportWinPct = gamesPlayed > 0 ? (sport.wins / gamesPlayed * 100).toFixed(0) : '0'

              return (
                <div key={sport.sportId} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span>{getSportEmoji(sport.sportCode)}</span>
                      <span className="font-display font-bold text-foreground">{sport.sportName}</span>
                    </div>
                    <div className="font-display font-bold">
                      <span className="text-neon-green">{sport.wins}</span>
                      <span className="text-foreground-muted">-</span>
                      <span className="text-foreground-muted">{sport.losses}</span>
                      {sport.ties > 0 && (
                        <>
                          <span className="text-foreground-muted">-</span>
                          <span className="text-foreground-muted">{sport.ties}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    {/* Last 5 */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-foreground-muted mr-2">L5:</span>
                      {sport.lastFive.map((result, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            'w-5 h-5 flex items-center justify-center text-[10px] font-bold',
                            result === 'W' && 'bg-neon-green/20 text-neon-green',
                            result === 'L' && 'bg-neon-pink/20 text-neon-pink',
                            result === 'T' && 'bg-neon-yellow/20 text-neon-yellow'
                          )}
                        >
                          {result}
                        </span>
                      ))}
                    </div>

                    {/* Streak & Win % */}
                    <div className="flex items-center gap-4">
                      <div className="text-foreground-muted">
                        <span className="text-xs">Streak: </span>
                        <span className={cn(
                          'font-bold',
                          sport.streak.startsWith('W') && 'text-neon-green',
                          sport.streak.startsWith('L') && 'text-neon-pink'
                        )}>
                          {sport.streak}
                        </span>
                      </div>
                      <div className="text-foreground-muted">
                        <span className="text-xs">Win%: </span>
                        <span className="font-bold text-neon-blue">{sportWinPct}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
