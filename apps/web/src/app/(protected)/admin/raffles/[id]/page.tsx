'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button, Badge, Avatar } from '@/components/ui'
import { PrizeDisplay } from '@/components/rewards'
import {
  Ticket, Users, Trophy, Play, Check, Send,
  Calendar, Clock, Loader2, RefreshCw, Crown, Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks'
import { useToast } from '@/components/ui/toast'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { getRaffleEntries, type DrawingResult, type DrawingEntry } from '@/lib/raffle/drawing'
import { cn } from '@/lib/utils'
import type { RaffleWithPrize, RaffleEntryWithUser, RaffleWinnerWithDetails, Prize, RafflePrize } from '@/types/database'

export default function AdminRaffleDetailPage() {
  const params = useParams()
  const raffleId = params.id as string
  const { profile } = useAuth()

  const [raffle, setRaffle] = useState<RaffleWithPrize | null>(null)
  const [rafflePrizes, setRafflePrizes] = useState<(RafflePrize & { prize: Prize | null })[]>([])
  const [topContributorPrize, setTopContributorPrize] = useState<Prize | null>(null)
  const [entries, setEntries] = useState<RaffleEntryWithUser[]>([])
  const [autoEntries, setAutoEntries] = useState<DrawingEntry[]>([])
  const [winners, setWinners] = useState<RaffleWinnerWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingResults, setDrawingResults] = useState<DrawingResult[] | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    action: () => Promise<void>
    title: string
    description: string
    confirmLabel?: string
    variant?: 'destructive' | 'default'
  } | null>(null)
  const { toast } = useToast()

  const supabase = useMemo(() => createClient(), [])
  const hasAdminAccess = profile?.is_admin === true || profile?.is_super_admin === true

  const fetchData = useCallback(async () => {
    if (!supabase) {
      toast({ type: 'error', text: 'Database connection not available' })
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Fetch raffle
    const { data: raffleData, error: raffleError } = await supabase
      .from('raffles')
      .select('*, prize:prizes(*)')
      .eq('id', raffleId)
      .single()

    if (!raffleError && raffleData) {
      const r = raffleData as unknown as RaffleWithPrize
      setRaffle(r)

      // Fetch top contributor prize if set
      if (r.top_contributor_prize_id) {
        const { data: tcPrize } = await supabase
          .from('prizes')
          .select('*')
          .eq('id', r.top_contributor_prize_id)
          .single()
        setTopContributorPrize(tcPrize as Prize | null)
      }
    }

    // Fetch raffle_prizes (multi-prize)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rpData } = await (supabase as any)
      .from('raffle_prizes')
      .select('*, prize:prizes(*)')
      .eq('raffle_id', raffleId)
      .order('position')

    if (rpData) {
      setRafflePrizes(rpData as (RafflePrize & { prize: Prize | null })[])
    }

    // Fetch legacy entries (from old entry system)
    const { data: entriesData } = await supabase
      .from('raffle_entries')
      .select('*, user:users(id, display_name, avatar_url)')
      .eq('raffle_id', raffleId)
      .order('entry_count', { ascending: false })

    if (entriesData) {
      setEntries((entriesData || []) as unknown as RaffleEntryWithUser[])
    }

    // Fetch auto entries (from points)
    if (raffleData) {
      const r = raffleData as unknown as RaffleWithPrize
      const autoEntryData = await getRaffleEntries(
        raffleId,
        r.raffle_type as 'monthly' | 'season_end' | 'special',
        r.month || undefined
      )
      setAutoEntries(autoEntryData)
    }

    // Fetch winners
    const { data: winnersData } = await supabase
      .from('raffle_winners')
      .select('*, user:users(id, display_name, avatar_url, email), prize:prizes(*)')
      .eq('raffle_id', raffleId)
      .order('position')

    if (winnersData) {
      setWinners((winnersData || []) as unknown as RaffleWinnerWithDetails[])
    }

    setIsLoading(false)
  }, [supabase, raffleId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalAutoEntries = autoEntries.reduce((sum, e) => sum + e.entryCount, 0)

  // Determine top contributor
  const topContributor = autoEntries.length > 0 ? autoEntries[0] : null

  const handleRunDrawing = () => {
    if (!raffle) return

    setConfirmAction({
      action: async () => {
        setIsDrawing(true)
        setDrawingResults(null)

        const raffleMonth = raffle.month || undefined

        // Build position→prize map for multi-prize raffles
        const prizeMap = rafflePrizes.length > 0
          ? Object.fromEntries(rafflePrizes.map(rp => [rp.position, rp.prize_id]))
          : undefined

        const fallbackPrizeId = raffle.prize_id || undefined

        // Call server-side API route (bypasses RLS, ensures full point_events access)
        const drawRes = await fetch('/api/admin/raffle/draw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            raffleId: raffle.id,
            winnerCount: raffle.winner_count,
            prizeId: fallbackPrizeId,
            raffleType: raffle.raffle_type,
            month: raffleMonth,
            prizeMap,
          }),
        })
        const result = await drawRes.json()

        if (result.success && result.winners) {
          setDrawingResults(result.winners)

          // Award top contributor if set and there are entries
          if (raffle.top_contributor_prize_id && topContributor) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('raffle_winners')
              .insert({
                raffle_id: raffle.id,
                user_id: topContributor.userId,
                prize_id: raffle.top_contributor_prize_id,
                position: 0, // Position 0 = top contributor (not drawn)
                winning_entry_number: null,
              })
          }

          toast({ type: 'success', text: 'Drawing completed!' })
          fetchData()
        } else {
          toast({ type: 'error', text: result.error || 'Drawing failed' })
        }

        setIsDrawing(false)
      },
      title: 'Run Drawing',
      description: `Run the drawing for ${raffle.winner_count} winner${raffle.winner_count !== 1 ? 's' : ''}?${raffle.top_contributor_prize_id && topContributor ? `\n\nTop contributor (${topContributor.displayName}) will also be awarded their guaranteed prize.` : ''}`,
      confirmLabel: 'Run Drawing',
      variant: 'destructive',
    })
  }

  const handleMarkClaimed = async (winnerId: string) => {
    if (!supabase) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('raffle_winners')
      .update({
        claimed: true,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', winnerId)

    if (error) {
      console.error('Error marking claimed:', error)
      toast({ type: 'error', text: 'Failed to mark prize as claimed' })
    } else {
      toast({ type: 'success', text: 'Prize marked as claimed' })
      fetchData()
    }
  }

  if (!hasAdminAccess) {
    return (
      <>
        <Header title="Raffle Details" showBack />
        <main className="p-4">
          <div className="scoreboard-panel p-8 text-center">
            <p className="text-foreground-muted">You don&apos;t have permission to access this page.</p>
          </div>
        </main>
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <Header title="Raffle Details" showBack />
        <main className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
        </main>
      </>
    )
  }

  if (!raffle) {
    return (
      <>
        <Header title="Raffle Details" showBack />
        <main className="p-4">
          <div className="scoreboard-panel p-8 text-center">
            <p className="text-foreground-muted">Raffle not found</p>
          </div>
        </main>
      </>
    )
  }

  const canDraw = raffle.status === 'closed' && winners.length === 0

  return (
    <>
      <Header title="Raffle Details" showBack />

      <main className="px-4 pb-24 grid-bg">
        {/* Raffle Header */}
        <div className="mt-4 scoreboard-panel p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Ticket className="h-5 w-5 text-neon-yellow" />
                <Badge variant="secondary" className="text-[10px]">
                  {raffle.raffle_type === 'monthly' ? 'Monthly' :
                   raffle.raffle_type === 'season_end' ? 'Season End' : 'Special'}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px]',
                    raffle.status === 'open' && 'text-neon-green',
                    raffle.status === 'closed' && 'text-neon-yellow',
                    raffle.status === 'completed' && 'text-neon-blue'
                  )}
                >
                  {raffle.status.charAt(0).toUpperCase() + raffle.status.slice(1)}
                </Badge>
              </div>
              <h1 className="font-display text-xl font-bold text-foreground">{raffle.name}</h1>
              {raffle.description && (
                <p className="text-sm text-foreground-muted mt-1">{raffle.description}</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4 text-xs text-foreground-muted mb-4">
            <div>
              <Calendar className="h-3.5 w-3.5 inline mr-1" />
              Opens: {raffle.entries_open_at ? new Date(raffle.entries_open_at).toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' }) : 'Not set'}
            </div>
            <div>
              <Clock className="h-3.5 w-3.5 inline mr-1" />
              Closes: {raffle.entries_close_at ? new Date(raffle.entries_close_at).toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' }) : 'Not set'}
            </div>
            <div>
              <Trophy className="h-3.5 w-3.5 inline mr-1" />
              Drawing: {raffle.drawing_at ? new Date(raffle.drawing_at).toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' }) : 'Not set'}
            </div>
          </div>

          {/* Entry Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-background-tertiary rounded-md">
              <p className="score-led text-xl">{autoEntries.length}</p>
              <p className="text-[10px] text-foreground-subtle">Participants</p>
            </div>
            <div className="text-center p-3 bg-background-tertiary rounded-md">
              <p className="score-led text-xl">{totalAutoEntries.toLocaleString()}</p>
              <p className="text-[10px] text-foreground-subtle">Total Entries</p>
            </div>
            <div className="text-center p-3 bg-background-tertiary rounded-md">
              <p className="score-led text-xl">{raffle.winner_count}</p>
              <p className="text-[10px] text-foreground-subtle">Winners</p>
            </div>
          </div>
        </div>

        {/* Prizes */}
        {(rafflePrizes.length > 0 || raffle.prize) && (
          <div className="mt-4">
            <h2 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-neon-yellow" />
              Prizes
            </h2>
            {rafflePrizes.length > 0 ? (
              <div className="space-y-2">
                {rafflePrizes.map((rp) => (
                  <div key={rp.id} className="flex items-center gap-3">
                    <span className={cn(
                      'font-display font-bold text-sm w-8',
                      rp.position === 1 && 'text-neon-yellow',
                      rp.position === 2 && 'text-foreground-muted',
                      rp.position === 3 && 'text-neon-pink',
                    )}>
                      {rp.position === 1 ? '1st' : rp.position === 2 ? '2nd' : rp.position === 3 ? '3rd' : `${rp.position}th`}
                    </span>
                    {rp.prize && <PrizeDisplay prize={rp.prize} size="sm" />}
                  </div>
                ))}
              </div>
            ) : raffle.prize ? (
              <PrizeDisplay prize={raffle.prize} size="md" />
            ) : null}
          </div>
        )}

        {/* Top Contributor */}
        {topContributorPrize && (
          <div className="mt-4 scoreboard-panel p-4 border-neon-green/50">
            <h2 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
              <Crown className="h-4 w-4 text-neon-green" />
              Top Contributor Prize (Guaranteed)
            </h2>
            <PrizeDisplay prize={topContributorPrize} size="sm" />
            {topContributor && (
              <div className="mt-3 flex items-center gap-3 p-2 bg-background-tertiary rounded-md">
                <Star className="h-4 w-4 text-neon-green" />
                <Avatar
                  src={topContributor.avatarUrl}
                  fallback={topContributor.displayName}
                  size="sm"
                />
                <div>
                  <p className="font-display font-bold text-foreground text-sm">{topContributor.displayName}</p>
                  <p className="text-xs text-foreground-muted">{topContributor.entryCount} contributions (currently #1)</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Drawing Controls */}
        {canDraw && (
          <div className="mt-4 scoreboard-panel p-4 border-neon-yellow/50">
            <h2 className="font-display font-bold text-foreground mb-3">Run Drawing</h2>
            <p className="text-sm text-foreground-muted mb-4">
              This raffle is closed and ready for drawing. Running the drawing will randomly select
              {raffle.winner_count === 1 ? ' a winner' : ` ${raffle.winner_count} winners`} based on point contributions.
              {topContributor && topContributorPrize && (
                <> {topContributor.displayName} will also receive the guaranteed Top Contributor prize.</>
              )}
            </p>

            <Button
              onClick={handleRunDrawing}
              disabled={isDrawing}
              loading={isDrawing}
              className="gap-2"
              style={{ boxShadow: '0 0 15px rgba(250, 204, 21, 0.3)' }}
            >
              <Play className="h-4 w-4" />
              Run Drawing
            </Button>
          </div>
        )}

        {/* Drawing Results */}
        {drawingResults && (
          <div className="mt-4 scoreboard-panel p-4 border-neon-green/50">
            <h2 className="font-display font-bold text-neon-green mb-3 flex items-center gap-2">
              <Check className="h-5 w-5" />
              Drawing Complete!
            </h2>
            <div className="space-y-2">
              {drawingResults.map((result) => {
                const prizeName = rafflePrizes.find(rp => rp.position === result.position)?.prize?.name
                return (
                  <div
                    key={result.userId}
                    className="flex items-center gap-3 p-3 bg-background-tertiary rounded-md"
                  >
                    <span className="font-display font-bold text-neon-yellow">
                      #{result.position}
                    </span>
                    <Avatar
                      src={result.avatarUrl}
                      fallback={result.displayName}
                      size="sm"
                    />
                    <span className="font-medium text-foreground">{result.displayName}</span>
                    {prizeName && (
                      <span className="text-xs text-neon-yellow ml-auto">{prizeName}</span>
                    )}
                    <span className="text-xs text-foreground-subtle">
                      (Ticket #{result.winningEntryNumber})
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Winners (if already drawn) */}
        {winners.length > 0 && !drawingResults && (
          <div className="mt-4">
            <h2 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-neon-yellow" />
              Winners
            </h2>
            <div className="space-y-2">
              {winners.map((winner) => (
                <div
                  key={winner.id}
                  className="scoreboard-panel p-4 flex items-center gap-4"
                >
                  <span className={cn(
                    'font-display font-bold text-lg w-8',
                    winner.position === 0 && 'text-neon-green',
                    winner.position === 1 && 'text-neon-yellow',
                    winner.position === 2 && 'text-foreground-muted',
                    winner.position === 3 && 'text-neon-pink'
                  )}>
                    {winner.position === 0 ? (
                      <Crown className="h-5 w-5" />
                    ) : (
                      `#${winner.position}`
                    )}
                  </span>
                  <Avatar
                    src={winner.user?.avatar_url}
                    fallback={winner.user?.display_name || 'W'}
                    size="default"
                  />
                  <div className="flex-1">
                    <p className="font-display font-bold text-foreground">
                      {winner.user?.display_name || 'Winner'}
                    </p>
                    <p className="text-xs text-foreground-subtle">
                      {winner.position === 0
                        ? 'Top Contributor (Guaranteed)'
                        : winner.winning_entry_number
                          ? `Winning ticket: #${winner.winning_entry_number}`
                          : ''
                      }
                    </p>
                    {winner.prize && (
                      <p className="text-xs text-neon-yellow">{winner.prize.name}</p>
                    )}
                    {winner.user?.email && (
                      <p className="text-xs text-foreground-subtle">Contact: {winner.user.email}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {winner.claimed ? (
                      <>
                        <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                          <Check className="h-3 w-3 mr-1" />
                          Claimed
                        </Badge>
                        {winner.claimed_at && (
                          <span className="text-[10px] text-foreground-subtle">
                            {new Date(winner.claimed_at).toLocaleDateString('en-US', { timeZone: 'Pacific/Honolulu', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkClaimed(winner.id)}
                      >
                        Mark Claimed
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entries List (auto-entries from points) */}
        <div className="mt-4">
          <h2 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-neon-blue" />
            Entries ({autoEntries.length} participants, {totalAutoEntries.toLocaleString()} total entries)
          </h2>

          {autoEntries.length === 0 ? (
            <div className="scoreboard-panel p-6 text-center">
              <p className="text-foreground-muted">No entries yet — users earn entries by submitting scores</p>
            </div>
          ) : (
            <div className="space-y-2">
              {autoEntries.map((entry, index) => (
                <div
                  key={entry.userId}
                  className={cn(
                    'scoreboard-panel p-3 flex items-center gap-4',
                    index === 0 && 'border-neon-green/30'
                  )}
                >
                  <span className="font-mono text-foreground-subtle w-6 text-right">
                    {index + 1}.
                  </span>
                  {index === 0 && topContributorPrize && (
                    <Crown className="h-4 w-4 text-neon-green flex-shrink-0" />
                  )}
                  <Avatar
                    src={entry.avatarUrl}
                    fallback={entry.displayName || 'U'}
                    size="sm"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {entry.displayName || 'User'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-neon-blue">
                      {entry.entryCount} {entry.entryCount === 1 ? 'entry' : 'entries'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={!!confirmAction}
        onConfirm={async () => { await confirmAction?.action(); setConfirmAction(null) }}
        onCancel={() => setConfirmAction(null)}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmLabel={confirmAction?.confirmLabel || 'Confirm'}
        variant={confirmAction?.variant || 'destructive'}
      />
    </>
  )
}
