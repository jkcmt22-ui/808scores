'use client'

import { useState } from 'react'
import { Header } from '@/components/layout'
import { Badge } from '@/components/ui'
import { CurrentRaffles, PastWinners } from '@/components/rewards'
import { Trophy, Medal, TrendingUp, Star, Loader2, Ticket } from 'lucide-react'
import { cn, getTierColor, getTierLabel } from '@/lib/utils'
import { useLeaderboard, useAuth } from '@/hooks'

type TimeFrame = 'season' | 'all'

export default function LeaderboardPage() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('season')
  const { leaders, userRank, userPoints, isLoading, error } = useLeaderboard({ timeFrame, limit: 50 })
  const { isAuthenticated, profile } = useAuth()

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-neon-yellow" style={{ filter: 'drop-shadow(0 0 6px var(--neon-yellow))' }} />
      case 2:
        return <Medal className="h-6 w-6 text-foreground-muted" />
      case 3:
        return <Medal className="h-6 w-6 text-neon-pink" style={{ filter: 'drop-shadow(0 0 4px var(--neon-pink))' }} />
      default:
        return (
          <span className="flex h-6 w-6 items-center justify-center font-display text-sm font-bold text-foreground-muted">
            {rank}
          </span>
        )
    }
  }

  return (
    <>
      <Header title="Leaderboard" />

      {/* Time frame selector */}
      <div className="border-b-2 border-border bg-background-secondary">
        <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-3">
          {[
            { value: 'season', label: 'Season' },
            { value: 'all', label: 'All Time' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeFrame(option.value as TimeFrame)}
              className={cn(
                'whitespace-nowrap px-4 py-2 font-display text-xs font-bold uppercase tracking-widest transition-all border-2',
                timeFrame === option.value
                  ? 'bg-neon-blue/20 text-neon-blue border-neon-blue'
                  : 'bg-background-tertiary text-foreground-muted border-border hover:border-neon-pink hover:text-neon-pink'
              )}
              style={timeFrame === option.value ? {
                textShadow: '0 0 10px var(--neon-blue)',
                boxShadow: '0 0 10px rgba(5, 217, 232, 0.3), inset 0 0 10px rgba(5, 217, 232, 0.1)'
              } : undefined}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 pb-24 grid-bg">
        {/* Season prizes banner */}
        <div className="mt-4 mb-4 scoreboard-panel p-4 border-neon-yellow/50" style={{ boxShadow: '0 0 15px rgba(250, 204, 21, 0.2)' }}>
          <div className="mb-2 flex items-center gap-2">
            <Star className="h-5 w-5 text-neon-yellow" style={{ filter: 'drop-shadow(0 0 6px var(--neon-yellow))' }} />
            <h3 className="font-display font-bold text-neon-yellow uppercase tracking-wider">Season Prizes</h3>
          </div>
          <p className="mb-3 text-sm text-foreground-muted font-display">
            Top contributors win gift cards and exclusive badges!
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 border-2 border-neon-yellow/50 bg-neon-yellow/10 text-neon-yellow font-display font-bold">
              #1: $200
            </span>
            <span className="px-2 py-1 border-2 border-foreground-muted/30 bg-background-tertiary text-foreground-muted font-display font-bold">
              Top 10: $50
            </span>
            <span className="px-2 py-1 border-2 border-neon-pink/50 bg-neon-pink/10 text-neon-pink font-display font-bold">
              100+: Badge
            </span>
          </div>
        </div>

        {/* Active Raffles Section */}
        <div className="mb-4">
          <CurrentRaffles />
        </div>

        {/* Your Points & Entries (if logged in) */}
        {isAuthenticated && profile && (
          <div className="mb-4 scoreboard-panel p-4 border-neon-blue/50" style={{ boxShadow: '0 0 15px rgba(5, 217, 232, 0.15)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-neon-blue" />
                <span className="font-display font-bold text-foreground">Your Season Points</span>
              </div>
              <span className="score-led text-2xl">{profile.season_points?.toLocaleString() || 0}</span>
            </div>
            <p className="text-xs text-foreground-muted mt-2">
              Each point = 1 raffle entry. Keep reporting scores!
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-neon-blue mb-4" />
            <p className="text-foreground-muted font-display">Loading leaderboard...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="scoreboard-panel p-4 border-red-500/50 mt-4">
            <p className="text-red-400 font-display">Failed to load leaderboard. Please try again.</p>
          </div>
        )}

        {/* Leaderboard */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {leaders.length > 0 ? (
              leaders.map((user, index) => (
                <div
                  key={user.id}
                  className={cn(
                    'scoreboard-panel p-4',
                    index === 0 && 'border-neon-yellow/50',
                    index === 1 && 'border-foreground-muted/30',
                    index === 2 && 'border-neon-pink/50'
                  )}
                  style={index === 0 ? { boxShadow: '0 0 15px rgba(250, 204, 21, 0.15)' } : undefined}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex w-8 justify-center">{getRankIcon(index + 1)}</div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-bold text-foreground truncate">{user.display_name || 'Anonymous'}</p>
                        <Badge className={getTierColor(user.tier)} variant="secondary">
                          {getTierLabel(user.tier)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-foreground-muted font-display">
                        <span>{user.submission_count} submissions</span>
                        {user.accuracy_rate != null && <span>{user.accuracy_rate.toFixed(1)}% accuracy</span>}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <p className="score-led text-xl">{(timeFrame === 'season' ? user.season_points : user.total_points).toLocaleString()}</p>
                      <p className="text-xs text-foreground-muted font-display uppercase tracking-wider">points</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                <div className="scoreboard-panel p-8 mb-4">
                  <Trophy className="h-10 w-10 text-neon-yellow mx-auto" />
                </div>
                <h3 className="mb-2 font-display text-xl font-black text-foreground uppercase tracking-widest">
                  No Leaders Yet
                </h3>
                <p className="text-sm text-foreground-muted max-w-xs font-display">
                  Be the first to submit scores and climb the leaderboard!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Your rank (if logged in and has rank) */}
        {userRank && userPoints !== null && (
          <div className="mt-6 scoreboard-panel p-4 border-neon-blue/50" style={{ boxShadow: '0 0 15px rgba(5, 217, 232, 0.15)' }}>
            <div className="flex items-center gap-4">
              <div className="flex w-8 justify-center">
                <TrendingUp className="h-5 w-5 text-neon-blue" />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-foreground">Your Rank: #{userRank}</p>
                <p className="text-xs text-foreground-muted font-display">{userPoints.toLocaleString()} {timeFrame === 'season' ? 'season' : 'total'} points</p>
              </div>
            </div>
          </div>
        )}

        {/* Past Winners */}
        <div className="mt-6">
          <PastWinners limit={6} />
        </div>
      </main>
    </>
  )
}
