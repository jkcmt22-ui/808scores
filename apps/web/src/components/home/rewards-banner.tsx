'use client'

import { useState, useEffect, useMemo } from 'react'
import { Gift, Trophy, ArrowRight, Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePastWinners, useRaffles } from '@/hooks'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Prize, RafflePrize } from '@/types/database'

/**
 * Prize banner + recent winner callout for the homepage.
 * Shows the active raffle's prizes and the most recent winner.
 */
export function RewardsBanner() {
  const { raffles } = useRaffles({ status: 'open', limit: 1 })
  const { winners } = usePastWinners(1)
  const [prizes, setPrizes] = useState<(RafflePrize & { prize: Prize | null })[]>([])
  const supabase = useMemo(() => createClient(), [])

  const activeRaffle = raffles[0]
  const recentWinner = winners[0]

  // Fetch raffle prizes for the active raffle
  useEffect(() => {
    async function fetchPrizes() {
      if (!supabase || !activeRaffle) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('raffle_prizes')
        .select('*, prize:prizes(*)')
        .eq('raffle_id', activeRaffle.id)
        .order('position')

      if (data) {
        setPrizes(data as (RafflePrize & { prize: Prize | null })[])
      }
    }

    fetchPrizes()
  }, [supabase, activeRaffle])

  // Don't render if nothing to show
  if (!activeRaffle && !recentWinner) return null

  return (
    <div className="space-y-3 my-4">
      {/* Prize Banner */}
      {activeRaffle && (
        <Link href="/rewards">
          <div
            className="scoreboard-panel p-4 border-neon-yellow/40 hover:border-neon-yellow transition-colors cursor-pointer"
            style={{ boxShadow: '0 0 15px rgba(250, 204, 21, 0.1)' }}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-neon-yellow/20 flex items-center justify-center flex-shrink-0">
                <Gift className="h-5 w-5 text-neon-yellow" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-foreground text-sm">
                  {activeRaffle.name}
                </p>
                {prizes.length > 0 ? (
                  <p className="text-xs text-neon-yellow font-display mt-0.5">
                    Win{' '}
                    {prizes.map((rp, i) => (
                      <span key={rp.id}>
                        {i > 0 && ' / '}
                        ${rp.prize ? (rp.prize.value_cents / 100).toFixed(0) : '?'}
                      </span>
                    ))}
                    {' '}in prizes!
                  </p>
                ) : activeRaffle.prize ? (
                  <p className="text-xs text-neon-yellow font-display mt-0.5">
                    Win a {activeRaffle.prize.name}!
                  </p>
                ) : (
                  <p className="text-xs text-foreground-muted mt-0.5">
                    Submit scores to earn entries
                  </p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-neon-yellow/50 flex-shrink-0" />
            </div>
          </div>
        </Link>
      )}

      {/* Recent Winner Callout */}
      {recentWinner && recentWinner.user && (
        <Link href="/rewards">
          <div className="scoreboard-panel p-3 border-neon-green/30 hover:border-neon-green/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-neon-yellow flex-shrink-0" />
              <p className="text-sm text-foreground-muted flex-1">
                Congrats to{' '}
                <span className="font-display font-bold text-foreground">
                  {formatWinnerName(recentWinner.user.display_name)}
                </span>
                {recentWinner.prize && (
                  <> — won a {recentWinner.prize.name}!</>
                )}
              </p>
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}

/** Format winner name for privacy: "First L." */
function formatWinnerName(name: string | null): string {
  if (!name) return 'Winner'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}
