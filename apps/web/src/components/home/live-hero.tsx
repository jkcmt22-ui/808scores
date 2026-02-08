'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSportEmoji } from '@/lib/sport-utils'
import type { GameWithTeams } from '@/types/database'
import { getHomeSchool, getAwaySchool } from '@/types/database'

interface LiveHeroProps {
  games: GameWithTeams[]
}

export function LiveHero({ games }: LiveHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Clamp currentIndex when games array shrinks
  useEffect(() => {
    if (currentIndex >= games.length && games.length > 0) {
      setCurrentIndex(games.length - 1)
    }
  }, [games.length, currentIndex])

  // Auto-rotate through games every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || games.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [games.length, isAutoPlaying])

  // Don't render if no live games
  if (games.length === 0) return null

  const safeIndex = Math.min(currentIndex, games.length - 1)
  const currentGame = games[safeIndex]
  if (!currentGame) return null
  const sportEmoji = getSportEmoji(currentGame.sport.code)

  // After migration 072: Get school data from team or directly
  const homeSchool = getHomeSchool(currentGame)
  const awaySchool = getAwaySchool(currentGame)

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + games.length) % games.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % games.length)
  }

  return (
    <div className="mb-6 relative">
      {/* Live Badge Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full bg-neon-pink animate-live-pulse"
            style={{ boxShadow: '0 0 12px var(--neon-pink)' }}
          />
          <span className="font-display text-sm font-black text-neon-pink uppercase tracking-widest">
            Live Now
          </span>
          <span className="font-display text-xs text-foreground-muted">
            ({games.length} game{games.length !== 1 ? 's' : ''})
          </span>
        </div>

        {/* Navigation arrows for multiple games */}
        {games.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevious}
              className="p-1.5 border border-border hover:border-neon-pink hover:text-neon-pink transition-colors"
              aria-label="Previous game"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-display text-xs text-foreground-muted px-2">
              {currentIndex + 1}/{games.length}
            </span>
            <button
              onClick={goToNext}
              className="p-1.5 border border-border hover:border-neon-pink hover:text-neon-pink transition-colors"
              aria-label="Next game"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Hero Card */}
      <Link
        href={`/game/${currentGame.id}`}
        className={cn(
          'block relative overflow-hidden',
          'border-2 border-neon-pink/50 bg-gradient-to-br from-background via-background to-neon-pink/5',
          'hover:border-neon-pink transition-all duration-300',
          'group'
        )}
        style={{ boxShadow: '0 0 30px rgba(255, 42, 109, 0.15)' }}
      >
        {/* Animated background pulse */}
        <div className="absolute inset-0 bg-neon-pink/5 animate-pulse opacity-50" />

        {/* Content */}
        <div className="relative p-5">
          {/* Sport badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{sportEmoji}</span>
              <span className="font-display text-xs font-bold text-neon-blue uppercase tracking-wider">
                {currentGame.sport.display_name || currentGame.sport.name}
              </span>
              {currentGame.game_type !== 'regular_season' && (
                <span className="px-2 py-0.5 text-[10px] font-display font-bold uppercase tracking-wider bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30">
                  {currentGame.game_type.replace('_', ' ')}
                </span>
              )}
            </div>
            {currentGame.current_period && (
              <span className="font-display text-sm font-bold text-neon-pink">
                {currentGame.current_period}
                {currentGame.time_remaining && ` - ${currentGame.time_remaining}`}
              </span>
            )}
          </div>

          {/* Scoreboard */}
          <div className="flex items-center justify-between gap-4">
            {/* Away Team */}
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="h-12 w-12 flex items-center justify-center bg-background-tertiary border-2 border-neon-blue/30 font-display font-black text-neon-blue">
                  {awaySchool.short_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-display font-bold text-foreground text-sm truncate max-w-[120px]">
                    {awaySchool.short_name}
                  </p>
                  <p className="text-[10px] text-foreground-subtle">{awaySchool.league}</p>
                </div>
              </div>
              <div
                className="font-display text-5xl font-black text-neon-blue tabular-nums"
                style={{ textShadow: '0 0 20px rgba(0, 212, 255, 0.5)' }}
              >
                {currentGame.away_score}
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex flex-col items-center gap-1 px-4">
              <Zap className="h-5 w-5 text-neon-pink animate-pulse" />
              <span className="font-display text-xs text-foreground-muted">VS</span>
            </div>

            {/* Home Team */}
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="text-right">
                  <p className="font-display font-bold text-foreground text-sm truncate max-w-[120px]">
                    {homeSchool.short_name}
                  </p>
                  <p className="text-[10px] text-foreground-subtle">{homeSchool.league}</p>
                </div>
                <div className="h-12 w-12 flex items-center justify-center bg-background-tertiary border-2 border-neon-pink/30 font-display font-black text-neon-pink">
                  {homeSchool.short_name.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div
                className="font-display text-5xl font-black text-neon-pink tabular-nums"
                style={{ textShadow: '0 0 20px rgba(255, 42, 109, 0.5)' }}
              >
                {currentGame.home_score}
              </div>
            </div>
          </div>

          {/* Venue & CTA */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            {currentGame.venue && (
              <span className="text-xs text-foreground-muted truncate max-w-[200px]">
                {currentGame.venue}
              </span>
            )}
            <span className="font-display text-xs font-bold text-neon-pink uppercase tracking-wider group-hover:text-neon-blue transition-colors ml-auto">
              Watch Live &rarr;
            </span>
          </div>
        </div>
      </Link>

      {/* Dot indicators for multiple games */}
      {games.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          {games.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false)
                setCurrentIndex(index)
              }}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                index === currentIndex
                  ? 'bg-neon-pink w-4'
                  : 'bg-foreground-muted/30 hover:bg-foreground-muted'
              )}
              aria-label={`Go to game ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
