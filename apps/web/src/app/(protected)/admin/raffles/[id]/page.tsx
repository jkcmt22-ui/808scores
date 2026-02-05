'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout'
import { Button, Badge, Avatar } from '@/components/ui'
import { PrizeDisplay } from '@/components/rewards'
import {
  Ticket, Users, Trophy, Play, Check,
  Calendar, Clock, Loader2, RefreshCw
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks'
import { useToast } from '@/components/ui/toast'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { executeRaffleDrawing, type DrawingResult } from '@/lib/raffle/drawing'
import { cn } from '@/lib/utils'
import type { RaffleWithPrize, RaffleEntryWithUser, RaffleWinnerWithDetails } from '@/types/database'

export default function AdminRaffleDetailPage() {
  const params = useParams()
  const raffleId = params.id as string
  const { profile } = useAuth()

  const [raffle, setRaffle] = useState<RaffleWithPrize | null>(null)
  const [entries, setEntries] = useState<RaffleEntryWithUser[]>([])
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
      setRaffle(raffleData as unknown as RaffleWithPrize)
    }

    // Fetch entries
    const { data: entriesData, error: entriesError } = await supabase
      .from('raffle_entries')
      .select('*, user:users(id, display_name, avatar_url)')
      .eq('raffle_id', raffleId)
      .order('entry_count', { ascending: false })

    if (!entriesError) {
      setEntries((entriesData || []) as unknown as RaffleEntryWithUser[])
    }

    // Fetch winners
    const { data: winnersData, error: winnersError } = await supabase
      .from('raffle_winners')
      .select('*, user:users(id, display_name, avatar_url), prize:prizes(*)')
      .eq('raffle_id', raffleId)
      .order('position')

    if (!winnersError) {
      setWinners((winnersData || []) as unknown as RaffleWinnerWithDetails[])
    }

    setIsLoading(false)
  }, [supabase, raffleId])

  useEffect(() => {
    // fetchData is a stable useCallback - this pattern is correct
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])

  const totalEntries = entries.reduce((sum, e) => sum + e.entry_count, 0)
  const totalPointsUsed = entries.reduce((sum, e) => sum + e.points_used, 0)

  const handleRunDrawing = () => {
    if (!raffle) return

    setConfirmAction({
      action: async () => {
        setIsDrawing(true)
        setDrawingResults(null)

        // Get the month from the raffle for monthly raffles
        const raffleMonth = raffle.month || undefined

        const result = await executeRaffleDrawing(
          raffle.id,
          raffle.winner_count,
          raffle.prize_id || undefined,
          raffle.raffle_type as 'monthly' | 'season_end' | 'special',
          raffleMonth
        )

        if (result.success && result.winners) {
          setDrawingResults(result.winners)
          toast({ type: 'success', text: 'Drawing completed successfully!' })
          fetchData() // Refresh to get updated status and winners
        } else {
          toast({ type: 'error', text: result.error || 'Drawing failed' })
        }

        setIsDrawing(false)
      },
      title: 'Run Drawing',
      description: 'Are you sure you want to run the drawing? This cannot be undone.',
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
              Opens: {raffle.entries_open_at ? new Date(raffle.entries_open_at).toLocaleString() : 'Not set'}
            </div>
            <div>
              <Clock className="h-3.5 w-3.5 inline mr-1" />
              Closes: {raffle.entries_close_at ? new Date(raffle.entries_close_at).toLocaleString() : 'Not set'}
            </div>
            <div>
              <Trophy className="h-3.5 w-3.5 inline mr-1" />
              Drawing: {raffle.drawing_at ? new Date(raffle.drawing_at).toLocaleString() : 'Not set'}
            </div>
          </div>

          {/* Entry Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-background-tertiary rounded-md">
              <p className="score-led text-xl">{entries.length}</p>
              <p className="text-[10px] text-foreground-subtle">Participants</p>
            </div>
            <div className="text-center p-3 bg-background-tertiary rounded-md">
              <p className="score-led text-xl">{totalEntries}</p>
              <p className="text-[10px] text-foreground-subtle">Total Entries</p>
            </div>
            <div className="text-center p-3 bg-background-tertiary rounded-md">
              <p className="score-led text-xl">{totalPointsUsed.toLocaleString()}</p>
              <p className="text-[10px] text-foreground-subtle">Points Used</p>
            </div>
            <div className="text-center p-3 bg-background-tertiary rounded-md">
              <p className="score-led text-xl">{raffle.winner_count}</p>
              <p className="text-[10px] text-foreground-subtle">Winners</p>
            </div>
          </div>
        </div>

        {/* Prize */}
        {raffle.prize && (
          <div className="mt-4">
            <h2 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-neon-yellow" />
              Prize
            </h2>
            <PrizeDisplay prize={raffle.prize} size="md" />
          </div>
        )}

        {/* Drawing Controls */}
        {canDraw && (
          <div className="mt-4 scoreboard-panel p-4 border-neon-yellow/50">
            <h2 className="font-display font-bold text-foreground mb-3">Run Drawing</h2>
            <p className="text-sm text-foreground-muted mb-4">
              This raffle is closed and ready for drawing. Running the drawing will randomly select
              {raffle.winner_count === 1 ? ' a winner' : ` ${raffle.winner_count} winners`} based on entry weights.
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
              {drawingResults.map((result) => (
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
                  <span className="text-xs text-foreground-subtle">
                    (Ticket #{result.winningEntryNumber})
                  </span>
                </div>
              ))}
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
                    winner.position === 1 && 'text-neon-yellow',
                    winner.position === 2 && 'text-foreground-muted',
                    winner.position === 3 && 'text-neon-pink'
                  )}>
                    #{winner.position}
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
                    {winner.winning_entry_number && (
                      <p className="text-xs text-foreground-subtle">
                        Winning ticket: #{winner.winning_entry_number}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {winner.claimed ? (
                      <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                        <Check className="h-3 w-3 mr-1" />
                        Claimed
                      </Badge>
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

        {/* Entries List */}
        <div className="mt-4">
          <h2 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-neon-blue" />
            Entries ({entries.length} participants)
          </h2>

          {entries.length === 0 ? (
            <div className="scoreboard-panel p-6 text-center">
              <p className="text-foreground-muted">No entries yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="scoreboard-panel p-3 flex items-center gap-4"
                >
                  <span className="font-mono text-foreground-subtle w-6 text-right">
                    {index + 1}.
                  </span>
                  <Avatar
                    src={entry.user?.avatar_url}
                    fallback={entry.user?.display_name || 'U'}
                    size="sm"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {entry.user?.display_name || 'User'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-neon-blue">
                      {entry.entry_count} {entry.entry_count === 1 ? 'entry' : 'entries'}
                    </p>
                    <p className="text-xs text-foreground-subtle">
                      {entry.points_used} pts used
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
