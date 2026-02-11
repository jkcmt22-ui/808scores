'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
  extractSubscriptionData
} from '@/lib/push-notifications'

interface UsePushNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission | 'unsupported'
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user } = useAuth()
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Check initial state
  useEffect(() => {
    const checkState = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supported = isPushSupported()
        setIsSupported(supported)

        if (!supported) {
          setPermission('unsupported')
          setIsLoading(false)
          return
        }

        setPermission(getNotificationPermission())

        // Check if already subscribed with a timeout
        // navigator.serviceWorker.ready can hang if SW fails to load
        const subscriptionPromise = getCurrentSubscription()
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 3000)
        )

        const subscription = await Promise.race([subscriptionPromise, timeoutPromise])
        setIsSubscribed(!!subscription)
      } catch (err) {
        console.error('Error checking push state:', err)
        setError('Failed to check notification status')
      } finally {
        setIsLoading(false)
      }
    }

    checkState()
  }, [])

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setError('Please sign in first')
      return false
    }

    if (!isSupported) {
      setError('Push notifications are not supported in this browser')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Request permission
      const perm = await requestNotificationPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        setError('Notification permission denied')
        return false
      }

      // Subscribe to push
      const subscription = await subscribeToPush()
      if (!subscription) {
        setError('Failed to create push subscription')
        return false
      }

      // Save subscription to Supabase
      if (!supabase) {
        setError('Database connection not available')
        return false
      }

      const subscriptionData = extractSubscriptionData(subscription)

      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionData.endpoint,
          p256dh: subscriptionData.p256dh,
          auth: subscriptionData.auth,
          platform: 'web',
          updated_at: new Date().toISOString()
        } as never, {
          onConflict: 'endpoint'
        })

      if (dbError) {
        console.error('Error saving subscription:', dbError)
        setError('Failed to save subscription to server')
        return false
      }

      setIsSubscribed(true)
      return true
    } catch (err) {
      console.error('Error subscribing to push:', err)
      setError(err instanceof Error ? err.message : 'Failed to enable notifications')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, user, supabase])

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // Get current subscription to delete from DB
      const subscription = await getCurrentSubscription()

      if (subscription && supabase) {
        // Delete from Supabase
        const { error: dbError } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint)

        if (dbError) {
          console.error('Error deleting subscription from DB:', dbError)
        }
      }

      // Unsubscribe locally
      await unsubscribeFromPush()
      setIsSubscribed(false)
      return true
    } catch (err) {
      console.error('Error unsubscribing from push:', err)
      setError(err instanceof Error ? err.message : 'Failed to disable notifications')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe
  }
}
