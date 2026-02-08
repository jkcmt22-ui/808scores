'use client'

import { useState, useEffect, useMemo } from 'react'
import { Header } from '@/components/layout'
import { Badge } from '@/components/ui'
import { PrizeDisplay, PastWinners, WinnerAnnouncement } from '@/components/rewards'
import {
  Trophy, Star, Ticket, Gift, TrendingUp, Clock,
  Loader2, ArrowRight, Info, Crown, CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRaffles, useAuth, useLeaderboard } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { getRaffleEntries, getUserEntryCount, type DrawingEntry } from '@/lib/raffle/drawing'
import Link from 'next/link'
import type { Prize, RafflePrize } from '@/types/database'

export default function RewardsPage() {
  const { isAuthenticated, profile, user } = useAuth()
  const { raffles, isLoading: rafflesLoading } = useRaffles({ status: 'all', limit: 10 })
  const { leaders } = useLeaderboard({ timeFrame: 'season', limit: 10 })

  const [userEntryCount, setUserEntryCount] = useState<number>(0)
  const [topContributors, setTopContributors] = useState<DrawingEntry[]>([])
  const [rafflePrizesMap, setRafflePrizesMap] = useState<Record<string, (RafflePrize & { prize: Prize | null })[]>>({})
  const [topContributorPrizesMap, setTopContributorPrizesMap] = useState<Record<string, Prize>>({})
  const [countdown, setCountdown] = useState('')

  const supabase = useMemo(() => createClient(), [])

  // Get the active monthly raffle (or any open raffle)
  const activeRaffle = raffles.find(r => r.status === 'open' && r.raffle_type === 'monthly')
    || raffles.find(r => r.status === 'open')

  // Get quick/ad-hoc raffles (open, non-monthly)
  const quickRaffles = raffles.filter(r => r.status === 'open' && r.raffle_type !== 'monthly')

  // Recent completed raffles
  const completedRaffles = raffles.filter(r => r.status === 'completed').slice(0, 3)

  // Fetch raffle prizes and user entries
  useEffect(() => {
    async function fetchData() {
      if (!supabase) return

      // Fetch all raffle_prizes with prize details
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rpData } = await (supabase as any)
        .from('raffle_prizes')
        .select('*, prize:prizes(*)')
        .order('position')

      if (rpData) {
        const map: Record<string, (RafflePrize & { prize: Prize | null })[]> = {}
        for (const rp of rpData as (RafflePrize & { prize: Prize | null })[]) {
          if (!map[rp.raffle_id]) map[rp.raffle_id] = []
          map[rp.raffle_id].push(rp)
        }
        setRafflePrizesMap(map)
      }
    }

    fetchData()
  }, [supabase])

  // Fetch top contributor prizes
  useEffect(() => {
    async function fetchTopContributorPrizes() {
      if (!supabase || raffles.length === 0) return

      const tcRaffles = raffles.filter(r => r.top_contributor_prize_id)
      if (tcRaffles.length === 0) return

      const prizeIds = [...new Set(tcRaffles.map(r => r.top_contributor_prize_id!))]
      const { data } = await supabase
        .from('prizes')
        .select('*')
        .in('id', prizeIds)

      if (data) {
        const map: Record<string, Prize> = {}
        for (const p of data as Prize[]) {
          map[p.id] = p
        }
        setTopContributorPrizesMap(map)
      }
    }

    fetchTopContributorPrizes()
  }, [supabase, raffles])

  // Fetch user entry count and top contributors
  useEffect(() => {
    async function fetchEntries() {
      if (!activeRaffle) return

      // Get all entries for leaderboard display
      const entries = await getRaffleEntries(
        activeRaffle.id,
        activeRaffle.raffle_type as 'monthly' | 'season_end' | 'special',
        activeRaffle.month || undefined
      )
      setTopContributors(entries.slice(0, 10))

      // Get user's entry count
      if (user?.id) {
        const count = await getUserEntryCount(
          user.id,
          activeRaffle.raffle_type as 'monthly' | 'season_end' | 'special',
          activeRaffle.month || undefined
        )
        setUserEntryCount(count)
      }
    }

    fetchEntries()
  }, [activeRaffle, user?.id])

  // Countdown timer
  useEffect(() => {
    if (!activeRaffle?.entries_close_at) return

    const update = () => {
      const now = new Date()
      const close = new Date(activeRaffle.entries_close_at)
      const diff = close.getTime() - now.getTime()

      if (diff <= 0) {
        setCountdown('Closed')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) setCountdown(`${days}d ${hours}h remaining`)
      else if (hours > 0) setCountdown(`${hours}h ${minutes}m remaining`)
      else setCountdown(`${minutes}m remaining`)
    }

    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [activeRaffle?.entries_close_at])

  const activePrizes = activeRaffle ? (rafflePrizesMap[activeRaffle.id] || []) : []
  const activeTopContributorPrize = activeRaffle?.top_contributor_prize_id
    ? topContributorPrizesMap[activeRaffle.top_contributor_prize_id]
    : null

  return (
    <>
      <Header title="Rewards" />

      <main className="px-4 pb-24 grid-bg">
        {rafflesLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
          </div>
        ) : (
          <>
            {/* Hero: This Month's Prizes */}
            {activeRaffle && (
              <section className="mt-4">
                <div
                  className="scoreboard-panel p-5 border-neon-yellow/50"
                  style={{ boxShadow: '0 0 20px rgba(250, 204, 21, 0.15)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-neon-yellow" />
                      <h2 className="font-display font-bold text-lg text-neon-yellow uppercase tracking-wider">
                        {activeRaffle.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-foreground-muted">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono">{countdown}</span>
                    </div>
                  </div>

                  {activeRaffle.description && (
                    <p className="text-sm text-foreground-muted mb-4">{activeRaffle.description}</p>
                  )}

                  {/* Prize Cards */}
                  {activePrizes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {activePrizes.map((rp) => (
                        <div
                          key={rp.id}
                          className={cn(
                            'scoreboard-panel p-3 text-center',
                            rp.position === 1 && 'border-neon-yellow/50',
                            rp.position === 2 && 'border-foreground-muted/30',
                            rp.position === 3 && 'border-neon-pink/30',
                          )}
                        >
                          <span className={cn(
                            'font-display font-bold text-xs uppercase tracking-wider',
                            rp.position === 1 && 'text-neon-yellow',
                            rp.position === 2 && 'text-foreground-muted',
                            rp.position === 3 && 'text-neon-pink',
                          )}>
                            {rp.position === 1 ? '1st Prize' : rp.position === 2 ? '2nd Prize' : '3rd Prize'}
                          </span>
                          {rp.prize && (
                            <>
                              <p className="font-display font-bold text-foreground mt-1">{rp.prize.name}</p>
                              <p className="score-led text-xl mt-1">
                                ${(rp.prize.value_cents / 100).toFixed(0)}
                              </p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : activeRaffle.prize ? (
                    <div className="mb-4">
                      <PrizeDisplay prize={activeRaffle.prize} size="md" />
                    </div>
                  ) : null}

                  {/* Top Contributor Prize */}
                  {activeTopContributorPrize && (
                    <div className="flex items-center gap-3 p-3 bg-neon-green/5 border border-neon-green/30 rounded-md mb-4">
                      <Crown className="h-5 w-5 text-neon-green flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-display font-bold text-sm text-foreground">
                          Top Contributor Prize
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {activeTopContributorPrize.name} — guaranteed for the #1 contributor
                        </p>
                      </div>
                      <span className="score-led text-lg">
                        ${(activeTopContributorPrize.value_cents / 100).toFixed(0)}
                      </span>
                    </div>
                  )}

                  {/* Drawing date */}
                  {activeRaffle.drawing_at && (
                    <p className="text-xs text-foreground-subtle text-center">
                      Drawing: {new Date(activeRaffle.drawing_at).toLocaleDateString('en-US', {
                        timeZone: 'Pacific/Honolulu',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Your Entries */}
            {isAuthenticated && activeRaffle && (
              <section className="mt-4">
                <div
                  className="scoreboard-panel p-4 border-neon-blue/50"
                  style={{ boxShadow: '0 0 15px rgba(5, 217, 232, 0.15)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Ticket className="h-5 w-5 text-neon-blue" />
                      <div>
                        <p className="font-display font-bold text-foreground">Your Entries This Month</p>
                        <p className="text-xs text-foreground-muted">
                          Every score you submit = 1 entry
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="score-led text-3xl">{userEntryCount}</p>
                      <p className="text-xs text-foreground-subtle font-display uppercase">entries</p>
                    </div>
                  </div>
                  {userEntryCount === 0 && (
                    <Link
                      href="/"
                      className="mt-3 flex items-center gap-2 text-sm text-neon-blue hover:text-neon-blue/80 font-display"
                    >
                      Start reporting scores to earn entries
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </section>
            )}

            {/* Top Contributors (Mini Leaderboard) */}
            {topContributors.length > 0 && (
              <section className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-neon-yellow" />
                  <h2 className="font-display font-bold text-foreground uppercase tracking-wider">
                    Top Contributors
                  </h2>
                </div>

                {activeTopContributorPrize && (
                  <p className="text-xs text-neon-green mb-3 font-display">
                    #1 wins a guaranteed {activeTopContributorPrize.name}!
                  </p>
                )}

                <div className="space-y-2">
                  {topContributors.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className={cn(
                        'scoreboard-panel p-3 flex items-center gap-3',
                        index === 0 && 'border-neon-yellow/30',
                      )}
                    >
                      <span className={cn(
                        'font-display font-bold text-sm w-6 text-center',
                        index === 0 && 'text-neon-yellow',
                        index === 1 && 'text-foreground-muted',
                        index === 2 && 'text-neon-pink',
                        index > 2 && 'text-foreground-subtle',
                      )}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-foreground text-sm truncate">
                          {entry.displayName}
                        </p>
                      </div>
                      <span className="score-led text-lg">{entry.entryCount}</span>
                      <span className="text-xs text-foreground-subtle font-display">entries</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/leaderboard"
                  className="mt-3 flex items-center gap-2 text-sm text-neon-blue hover:text-neon-blue/80 font-display"
                >
                  View Full Leaderboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            )}

            {/* Quick Raffles */}
            {quickRaffles.length > 0 && (
              <section className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Ticket className="h-5 w-5 text-neon-pink" />
                  <h2 className="font-display font-bold text-foreground uppercase tracking-wider">
                    Bonus Raffles
                  </h2>
                </div>
                <div className="space-y-3">
                  {quickRaffles.map((raffle) => {
                    const rPrizes = rafflePrizesMap[raffle.id] || []
                    return (
                      <div
                        key={raffle.id}
                        className="scoreboard-panel p-4 border-neon-pink/30"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-display font-bold text-foreground">{raffle.name}</h3>
                            {raffle.description && (
                              <p className="text-xs text-foreground-muted mt-1">{raffle.description}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-[10px] text-neon-green">Open</Badge>
                        </div>
                        {(rPrizes.length > 0 || raffle.prize) && (
                          <div className="mt-2">
                            {rPrizes[0]?.prize ? (
                              <p className="text-sm font-display text-neon-yellow">
                                Prize: {rPrizes[0].prize.name} (${(rPrizes[0].prize.value_cents / 100).toFixed(0)})
                              </p>
                            ) : raffle.prize ? (
                              <p className="text-sm font-display text-neon-yellow">
                                Prize: {raffle.prize.name}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* How It Works */}
            <section className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-neon-blue" />
                <h2 className="font-display font-bold text-foreground uppercase tracking-wider">
                  How It Works
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { step: '1', icon: TrendingUp, label: 'Report a Score', desc: 'Submit scores for any game', color: 'text-neon-blue' },
                  { step: '2', icon: Star, label: 'Earn 1 Point', desc: 'Every verified score = 1 point', color: 'text-neon-yellow' },
                  { step: '3', icon: Ticket, label: 'Auto-Entered', desc: 'Points = raffle entries', color: 'text-neon-green' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.step} className="scoreboard-panel p-3 text-center">
                      <div className={cn('inline-flex items-center justify-center h-10 w-10 rounded-full bg-background-tertiary mb-2', item.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="font-display font-bold text-foreground text-xs">{item.label}</p>
                      <p className="text-[10px] text-foreground-muted mt-1">{item.desc}</p>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Winner Announcement (dismissible) */}
            <section className="mt-6">
              <WinnerAnnouncement />
            </section>

            {/* Past Winners */}
            <section className="mt-6">
              <PastWinners limit={9} />
            </section>

            {/* Rules / Terms Link */}
            <section className="mt-6 mb-4">
              <div className="scoreboard-panel p-4 text-center">
                <p className="text-sm text-foreground-muted mb-2">
                  Must be a Hawaii resident. No purchase necessary.
                </p>
                <Link
                  href="/terms/raffle"
                  className="text-sm text-neon-blue hover:text-neon-blue/80 font-display uppercase tracking-wider"
                >
                  Full Rules & Terms
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  )
}
