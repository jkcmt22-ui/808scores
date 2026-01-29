/**
 * Point Events Hook
 *
 * Hook for fetching and managing point event history.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PointEvent } from '@/types/database'

const PAGE_SIZE = 10

/**
 * Hook to get user's point event history with pagination
 */
export function usePointEvents(userId: string | undefined) {
  const [events, setEvents] = useState<PointEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const supabase = useMemo(() => createClient(), [])

  // Fetch events
  const fetchEvents = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (!userId || !supabase) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const from = pageNum * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: fetchError } = await (supabase as any)
          .from('point_events')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(from, to)

        if (fetchError) {
          setError(fetchError.message)
          return
        }

        const newEvents = (data || []) as PointEvent[]

        if (append) {
          setEvents((prev) => [...prev, ...newEvents])
        } else {
          setEvents(newEvents)
        }

        setHasMore(newEvents.length === PAGE_SIZE)
      } catch (err) {
        console.error('Error fetching point events:', err)
        setError('Failed to load point history')
      } finally {
        setIsLoading(false)
      }
    },
    [userId, supabase]
  )

  // Initial fetch
  useEffect(() => {
    setPage(0)
    fetchEvents(0, false)
  }, [fetchEvents])

  // Load more function
  const loadMore = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchEvents(nextPage, true)
  }, [page, fetchEvents])

  // Refresh function
  const refresh = useCallback(() => {
    setPage(0)
    fetchEvents(0, false)
  }, [fetchEvents])

  return {
    events,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  }
}

/**
 * Get display info for an event type
 */
export function getEventTypeDisplay(eventType: string): {
  label: string
  color: string
  icon: string
} {
  switch (eventType) {
    case 'submission':
      return { label: 'Score Submission', color: 'text-neon-green', icon: '📋' }
    case 'chat_comment':
      return { label: 'Chat Comment', color: 'text-foreground-muted', icon: '💬' }
    case 'chat_like_received':
      return { label: 'Like Received', color: 'text-neon-pink', icon: '❤️' }
    case 'chat_mention_received':
      return { label: 'Mentioned', color: 'text-neon-blue', icon: '@' }
    case 'prediction_exact_match':
      return { label: 'Prediction - Exact Match!', color: 'text-neon-yellow', icon: '🎯' }
    case 'prediction_top3':
      return { label: 'Prediction - Top 3', color: 'text-neon-yellow', icon: '🏆' }
    case 'prediction_top10':
      return { label: 'Prediction - Top 10', color: 'text-neon-blue', icon: '📊' }
    case 'raffle_deduction':
      return { label: 'Raffle Entry', color: 'text-neon-purple', icon: '🎟️' }
    case 'admin_adjustment':
      return { label: 'Admin Adjustment', color: 'text-foreground-muted', icon: '⚙️' }
    case 'bonus':
      return { label: 'Bonus', color: 'text-neon-yellow', icon: '🎁' }
    case 'lucky_reporter':
      return { label: 'Lucky Reporter!', color: 'text-neon-yellow', icon: '🍀' }
    default:
      return { label: eventType, color: 'text-foreground', icon: '•' }
  }
}

/**
 * Format relative time for point events
 */
export function formatEventTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
