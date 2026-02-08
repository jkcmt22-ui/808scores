'use client'

import { useState, useMemo } from 'react'
import { X, Minus, Plus, AlertCircle, Check, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui'
import { Turnstile, useTurnstile } from '@/components/security'
import { PrizeDisplay } from './prize-display'
import { useEnterRaffle, useTrustScore } from '@/hooks'
import { cn } from '@/lib/utils'
import type { RaffleWithPrize, User } from '@/types/database'

interface RaffleEntryModalProps {
  isOpen: boolean
  onClose: () => void
  raffle: RaffleWithPrize
  user: Pick<User, 'id' | 'season_points'>
  currentEntryCount: number
  onSuccess: () => void
}

export function RaffleEntryModal({
  isOpen,
  onClose,
  raffle,
  user,
  currentEntryCount,
  onSuccess,
}: RaffleEntryModalProps) {
  const [entryCount, setEntryCount] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { enterRaffle, isLoading } = useEnterRaffle()
  const { trustScore, isLoading: trustScoreLoading } = useTrustScore(user.id)
  const { handleVerify, handleExpire, getToken } = useTurnstile()

  // Require Turnstile for low trust users (default to required while loading)
  const requiresTurnstile = trustScoreLoading || trustScore === null || trustScore < 50

  const pointsCost = entryCount * raffle.points_per_entry
  const maxNewEntries = raffle.max_entries_per_user
    ? raffle.max_entries_per_user - currentEntryCount
    : Math.floor(user.season_points / raffle.points_per_entry)
  const canAfford = user.season_points >= pointsCost
  const meetsMinimum = user.season_points >= raffle.min_points_to_enter

  const turnstileVerified = !requiresTurnstile || getToken() !== null

  const canEnter = useMemo(() => {
    return canAfford && meetsMinimum && entryCount > 0 && entryCount <= maxNewEntries && turnstileVerified
  }, [canAfford, meetsMinimum, entryCount, maxNewEntries, turnstileVerified])

  if (!isOpen) return null

  const handleIncrement = () => {
    if (entryCount < maxNewEntries) {
      setEntryCount(entryCount + 1)
    }
  }

  const handleDecrement = () => {
    if (entryCount > 1) {
      setEntryCount(entryCount - 1)
    }
  }

  const handleSubmit = async () => {
    setError(null)

    const result = await enterRaffle(raffle.id, entryCount)

    if (!result.success) {
      setError(result.error || 'Failed to enter raffle')
      return
    }

    setSuccess(true)
    setTimeout(() => {
      onSuccess()
      onClose()
      setSuccess(false)
      setEntryCount(1)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-background border-2 border-border rounded-lg shadow-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-border">
          <h2 className="font-display text-lg font-bold text-foreground uppercase tracking-wider">
            Enter Raffle
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-foreground-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Raffle Info */}
          <div>
            <h3 className="font-display font-bold text-foreground mb-1">{raffle.name}</h3>
            {raffle.description && (
              <p className="text-sm text-foreground-muted">{raffle.description}</p>
            )}
          </div>

          {/* Prize */}
          {raffle.prize && (
            <PrizeDisplay prize={raffle.prize} size="sm" />
          )}

          {/* Your Points */}
          <div className="scoreboard-panel p-3 flex items-center justify-between">
            <span className="text-sm text-foreground-muted font-display">Your Points</span>
            <span className="score-led text-xl">{user.season_points.toLocaleString()}</span>
          </div>

          {/* Entry Selector */}
          <div className="scoreboard-panel p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-bold text-foreground">Entries</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecrement}
                  disabled={entryCount <= 1}
                  className="p-2 rounded-md bg-background-tertiary border-2 border-border hover:border-neon-blue disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center score-led text-2xl">{entryCount}</span>
                <button
                  onClick={handleIncrement}
                  disabled={entryCount >= maxNewEntries}
                  className="p-2 rounded-md bg-background-tertiary border-2 border-border hover:border-neon-blue disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-foreground-muted">
                <span>{entryCount} {entryCount === 1 ? 'entry' : 'entries'} x {raffle.points_per_entry} pts</span>
                <span className={cn(!canAfford && 'text-destructive')}>
                  -{pointsCost.toLocaleString()} pts
                </span>
              </div>
              <div className="flex justify-between font-display font-bold border-t-2 border-border pt-2">
                <span>Points after</span>
                <span className={cn(
                  'score-led',
                  !canAfford && 'text-destructive'
                )}>
                  {(user.season_points - pointsCost).toLocaleString()}
                </span>
              </div>
            </div>

            {currentEntryCount > 0 && (
              <p className="text-xs text-foreground-muted mt-3">
                You already have {currentEntryCount} {currentEntryCount === 1 ? 'entry' : 'entries'}.
                {raffle.max_entries_per_user && (
                  <> Max {raffle.max_entries_per_user} total.</>
                )}
              </p>
            )}
          </div>

          {/* Security Verification */}
          {requiresTurnstile && (
            <div className="scoreboard-panel p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-neon-blue" />
                <span className="font-display font-bold text-foreground text-sm">Security Verification</span>
              </div>
              <p className="text-xs text-foreground-muted mb-3">
                Please complete this quick verification to continue.
              </p>
              <Turnstile
                onVerify={handleVerify}
                onExpire={handleExpire}
                action="raffle_entry"
                theme="dark"
                size="normal"
              />
              {turnstileVerified && (
                <div className="flex items-center gap-2 mt-2 text-neon-green text-sm">
                  <Check className="h-4 w-4" />
                  <span>Verified</span>
                </div>
              )}
            </div>
          )}

          {/* Warnings */}
          {!meetsMinimum && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>You need at least {raffle.min_points_to_enter} points to enter this raffle.</span>
            </div>
          )}

          {meetsMinimum && !canAfford && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Not enough points. Reduce entries or earn more points.</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 bg-neon-green/10 text-neon-green text-sm rounded-md">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Successfully entered! Good luck!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t-2 border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canEnter || isLoading || success}
            loading={isLoading}
            className="flex-1"
          >
            Enter Raffle
          </Button>
        </div>
      </div>
    </div>
  )
}
