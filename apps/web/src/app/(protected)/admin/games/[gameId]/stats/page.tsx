'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGameStats, useGameStatsMutations } from '@/hooks/use-game-stats'
import { StatEntryForm } from '@/components/admin/stat-entry-form'
import type { PlayerGameStats } from '@/types/database'

export default function GameStatsPage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.gameId as string

  const {
    game,
    homeRoster,
    awayRoster,
    isLoading,
    error,
    refetch,
  } = useGameStats({ gameId })

  const {
    saveAllStats,
    isLoading: isSaving,
    error: saveError,
  } = useGameStatsMutations(gameId)

  const handleSave = async (
    statsToSave: Array<{
      playerId: string
      schoolId: string
      stats: Partial<PlayerGameStats>
    }>
  ): Promise<boolean> => {
    const success = await saveAllStats(statsToSave)
    if (success) {
      refetch()
    }
    return success
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-neon-yellow mb-4" />
          <p className="text-foreground-muted font-mono text-sm uppercase">Loading game data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !game || !homeRoster || !awayRoster) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="w-8 h-8 text-neon-pink mb-4" />
          <p className="text-foreground mb-2 font-mono uppercase">
            {error || 'Game not found'}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={refetch}>
              Retry
            </Button>
            <Link href="/admin">
              <Button variant="secondary">Back to Admin</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="h-6 w-px bg-border" />
        <h1 className="font-display text-lg uppercase tracking-wider">
          Enter Game Stats
        </h1>
      </div>

      {/* Save error message */}
      {saveError && (
        <div className="mb-4 p-3 border border-neon-pink/50 bg-neon-pink/10 rounded">
          <div className="flex items-center gap-2 text-neon-pink">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{saveError}</span>
          </div>
        </div>
      )}

      {/* Stat entry form */}
      <StatEntryForm
        game={game}
        homeRoster={homeRoster}
        awayRoster={awayRoster}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  )
}
