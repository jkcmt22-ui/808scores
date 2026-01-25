'use client'

import { useState, useCallback } from 'react'
import { Bell, BellRing, Loader2, Check } from 'lucide-react'
import { useGameReminders } from '@/hooks/use-game-reminders'
import { cn } from '@/lib/utils'

interface RemindMeButtonProps {
  gameId: string
  scheduledAt: string
  homeTeam: string
  awayTeam: string
  sport: string
  className?: string
  variant?: 'default' | 'compact'
}

const REMINDER_OPTIONS = [
  { value: 15, label: '15 min before' },
  { value: 30, label: '30 min before' },
  { value: 60, label: '1 hour before' },
]

export function RemindMeButton({
  gameId,
  scheduledAt,
  homeTeam,
  awayTeam,
  sport,
  className,
  variant = 'default'
}: RemindMeButtonProps) {
  const { hasReminder, addReminder, removeReminder, isNotificationsEnabled, enableNotifications, isLoading } = useGameReminders()
  const [showOptions, setShowOptions] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const isReminded = hasReminder(gameId)

  // Check if game is in the past
  const gameTime = new Date(scheduledAt).getTime()
  const isPast = gameTime < Date.now()

  const handleToggle = useCallback(async () => {
    if (isReminded) {
      removeReminder(gameId)
      return
    }

    // If notifications not enabled, show options to enable
    if (!isNotificationsEnabled) {
      setShowOptions(true)
      return
    }

    // Show time options
    setShowOptions(true)
  }, [isReminded, removeReminder, gameId, isNotificationsEnabled])

  const handleSelectTime = useCallback(async (minutes: number) => {
    setIsAdding(true)

    // Enable notifications if needed
    if (!isNotificationsEnabled) {
      const success = await enableNotifications()
      if (!success) {
        setIsAdding(false)
        setShowOptions(false)
        return
      }
    }

    const success = await addReminder({
      gameId,
      scheduledAt,
      homeTeam,
      awayTeam,
      sport,
      reminderTime: minutes
    })

    setIsAdding(false)
    setShowOptions(false)

    if (success) {
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    }
  }, [addReminder, gameId, scheduledAt, homeTeam, awayTeam, sport, isNotificationsEnabled, enableNotifications])

  // Don't show for past games
  if (isPast) {
    return null
  }

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={handleToggle}
          disabled={isLoading || isAdding}
          className={cn(
            'p-2 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center',
            isReminded
              ? 'text-neon-yellow'
              : 'text-foreground-muted hover:text-neon-yellow',
            className
          )}
          aria-label={isReminded ? 'Remove game reminder' : 'Set game reminder'}
          aria-pressed={isReminded}
        >
          {isLoading || isAdding ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : justAdded ? (
            <Check className="h-5 w-5 text-neon-green" />
          ) : isReminded ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </button>

        {showOptions && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowOptions(false)} />
            <div className="absolute right-0 top-full mt-2 z-50 w-40 border-2 border-border bg-background shadow-lg">
              <div className="p-1">
                <div className="px-3 py-2 text-xs font-display font-bold text-foreground-muted uppercase tracking-wider border-b border-border">
                  Remind me
                </div>
                {REMINDER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelectTime(option.value)}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-neon-yellow/10 hover:text-neon-yellow transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={isLoading || isAdding}
        aria-label={isReminded ? 'Remove game reminder' : 'Set game reminder'}
        aria-pressed={isReminded}
        className={cn(
          'flex items-center gap-2 px-4 py-2 border-2 transition-colors font-display text-sm font-bold uppercase tracking-wider min-h-[44px]',
          isReminded
            ? 'border-neon-yellow bg-neon-yellow/10 text-neon-yellow'
            : 'border-border bg-background-secondary hover:border-neon-yellow hover:text-neon-yellow',
          className
        )}
      >
        {isLoading || isAdding ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : justAdded ? (
          <Check className="h-4 w-4 text-neon-green" />
        ) : isReminded ? (
          <BellRing className="h-4 w-4" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        <span>
          {justAdded ? 'Reminder Set!' : isReminded ? 'Reminded' : 'Remind Me'}
        </span>
      </button>

      {showOptions && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowOptions(false)} />
          <div className="absolute left-0 top-full mt-2 z-50 w-48 border-2 border-border bg-background shadow-lg">
            <div className="p-1">
              <div className="px-3 py-2 text-xs font-display font-bold text-foreground-muted uppercase tracking-wider border-b border-border">
                Remind me
              </div>
              {REMINDER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelectTime(option.value)}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-neon-yellow/10 hover:text-neon-yellow transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
