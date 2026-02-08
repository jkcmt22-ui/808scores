'use client'

import { useState, useEffect } from 'react'
import { Trophy, X, PartyPopper } from 'lucide-react'
import { usePastWinners } from '@/hooks'
import { cn } from '@/lib/utils'
import Link from 'next/link'

/**
 * Dismissible winner announcement banner.
 * Shows after a drawing is published. Uses localStorage to track dismissal.
 */
export function WinnerAnnouncement() {
  const { winners } = usePastWinners(1)
  const [dismissed, setDismissed] = useState(true) // default hidden until checked

  const recentWinner = winners[0]

  // Check localStorage on mount
  useEffect(() => {
    if (!recentWinner) return

    const dismissedId = localStorage.getItem('dismissed_winner_announcement')
    if (dismissedId === recentWinner.id) {
      setDismissed(true)
    } else {
      setDismissed(false)
    }
  }, [recentWinner])

  if (!recentWinner || dismissed) return null

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    localStorage.setItem('dismissed_winner_announcement', recentWinner.id)
    setDismissed(true)
  }

  const winnerName = formatWinnerName(recentWinner.user?.display_name)

  return (
    <Link href="/rewards">
      <div
        className="relative scoreboard-panel p-4 border-neon-yellow/50 hover:border-neon-yellow transition-colors cursor-pointer animate-fade-in"
        style={{ boxShadow: '0 0 20px rgba(250, 204, 21, 0.15)' }}
      >
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-foreground-subtle hover:text-foreground transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-neon-yellow/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="h-5 w-5 text-neon-yellow" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <p className="font-display font-bold text-neon-yellow text-sm uppercase tracking-wider">
              Winner Announced!
            </p>
            <p className="text-sm text-foreground mt-0.5">
              Congrats to{' '}
              <span className="font-display font-bold text-foreground">
                {winnerName}
              </span>
              {recentWinner.prize && (
                <> — won a {recentWinner.prize.name}!</>
              )}
            </p>
            {recentWinner.raffle && (
              <p className="text-xs text-foreground-subtle mt-0.5">
                {recentWinner.raffle.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

/** Format winner name for privacy: "First L." */
function formatWinnerName(name: string | null | undefined): string {
  if (!name) return 'Winner'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}
