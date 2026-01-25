'use client'

import { Ticket, Loader2 } from 'lucide-react'
import { RaffleCard } from './raffle-card'
import { useRaffles, useAuth } from '@/hooks'

interface CurrentRafflesProps {
  showTitle?: boolean
}

export function CurrentRaffles({ showTitle = true }: CurrentRafflesProps) {
  const { profile } = useAuth()
  const { raffles, isLoading } = useRaffles({ status: 'open' })

  // User's points are their automatic entries
  const userPoints = profile?.season_points || 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-neon-blue" />
      </div>
    )
  }

  if (raffles.length === 0) {
    return (
      <div className="scoreboard-panel p-6 text-center">
        <Ticket className="h-8 w-8 text-foreground-muted mx-auto mb-3" />
        <h3 className="font-display font-bold text-foreground mb-1">No Active Raffles</h3>
        <p className="text-sm text-foreground-muted">Check back soon for new opportunities!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-neon-yellow" />
          <h2 className="font-display text-lg font-bold text-foreground uppercase tracking-wider">
            Active Raffles
          </h2>
        </div>
      )}

      <div className="space-y-3">
        {raffles.map((raffle) => (
          <RaffleCard
            key={raffle.id}
            raffle={raffle}
            userPoints={userPoints}
            // TODO: totalEntries would ideally come from a server query
            totalEntries={0}
          />
        ))}
      </div>

      {/* Info about automatic entries */}
      <div className="text-center text-xs text-foreground-subtle p-3 bg-background-tertiary rounded-lg">
        <p>
          <strong>How it works:</strong> Every point you earn is automatically an entry in the raffle.
          No action needed - just keep earning points!
        </p>
      </div>
    </div>
  )
}
