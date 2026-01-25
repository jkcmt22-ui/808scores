'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  data: Record<string, unknown> | null
  read: boolean
  created_at: string
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => createClient()!, [])

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: queryError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (queryError) throw queryError

      setNotifications((data as Notification[]) || [])
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'))
    } finally {
      setIsLoading(false)
    }
  }, [supabase, userId])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Subscribe to new notifications
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((current) => [payload.new as Notification, ...current])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((current) =>
            current.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  const markAsRead = useCallback(
    async (notificationId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (!updateError) {
        setNotifications((current) =>
          current.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        )
      }
    },
    [supabase]
  )

  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (!updateError) {
      setNotifications((current) => current.map((n) => ({ ...n, read: true })))
    }
  }, [supabase, userId])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  }
}
