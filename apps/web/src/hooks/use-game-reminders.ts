'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { usePushNotifications } from './use-push-notifications'

const REMINDERS_KEY = '808scores_game_reminders'

export interface GameReminder {
  gameId: string
  scheduledAt: string
  homeTeam: string
  awayTeam: string
  sport: string
  reminderTime: number // minutes before game
  createdAt: number
}

interface UseGameRemindersReturn {
  reminders: GameReminder[]
  hasReminder: (gameId: string) => boolean
  addReminder: (reminder: Omit<GameReminder, 'createdAt'>) => Promise<boolean>
  removeReminder: (gameId: string) => void
  isNotificationsEnabled: boolean
  enableNotifications: () => Promise<boolean>
  isLoading: boolean
}

export function useGameReminders(): UseGameRemindersReturn {
  const [reminders, setReminders] = useState<GameReminder[]>([])
  const { isSubscribed, subscribe, isLoading: pushLoading } = usePushNotifications()

  // Load reminders from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(REMINDERS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as GameReminder[]
        // Filter out past games
        const now = Date.now()
        const active = parsed.filter(r => new Date(r.scheduledAt).getTime() > now)
        setReminders(active)
        // Save cleaned list
        if (active.length !== parsed.length) {
          localStorage.setItem(REMINDERS_KEY, JSON.stringify(active))
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Check if a game has a reminder
  const hasReminder = useCallback((gameId: string) => {
    return reminders.some(r => r.gameId === gameId)
  }, [reminders])

  // Add a reminder
  const addReminder = useCallback(async (reminder: Omit<GameReminder, 'createdAt'>): Promise<boolean> => {
    // Ensure notifications are enabled
    if (!isSubscribed) {
      const success = await subscribe()
      if (!success) return false
    }

    const newReminder: GameReminder = {
      ...reminder,
      createdAt: Date.now()
    }

    const updated = [...reminders.filter(r => r.gameId !== reminder.gameId), newReminder]
    setReminders(updated)

    try {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated))

      // Schedule local notification using the Notification API
      // This is a fallback - the server will also send push notifications
      scheduleLocalReminder(newReminder)

      return true
    } catch {
      return false
    }
  }, [reminders, isSubscribed, subscribe])

  // Remove a reminder
  const removeReminder = useCallback((gameId: string) => {
    const updated = reminders.filter(r => r.gameId !== gameId)
    setReminders(updated)

    try {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated))
    } catch {
      // Ignore storage errors
    }
  }, [reminders])

  // Enable notifications
  const enableNotifications = useCallback(async () => {
    return await subscribe()
  }, [subscribe])

  return {
    reminders,
    hasReminder,
    addReminder,
    removeReminder,
    isNotificationsEnabled: isSubscribed,
    enableNotifications,
    isLoading: pushLoading
  }
}

// Schedule a local notification as fallback
function scheduleLocalReminder(reminder: GameReminder) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const gameTime = new Date(reminder.scheduledAt).getTime()
  const reminderTime = gameTime - (reminder.reminderTime * 60 * 1000)
  const now = Date.now()

  if (reminderTime <= now) return // Already past reminder time

  const delay = reminderTime - now

  // Don't schedule if more than 24 hours away (browser will likely clear it)
  if (delay > 24 * 60 * 60 * 1000) return

  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('Game Starting Soon!', {
        body: `${reminder.awayTeam} vs ${reminder.homeTeam} - ${reminder.sport} starts in ${reminder.reminderTime} minutes`,
        icon: '/icons/icon-192.png',
        tag: `reminder-${reminder.gameId}`,
        data: { gameId: reminder.gameId }
      })
    }
  }, delay)
}
