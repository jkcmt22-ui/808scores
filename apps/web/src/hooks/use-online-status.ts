import { useState, useEffect, useCallback } from 'react'
import { getPendingCount, onOnlineStatusChange, isOnline } from '@/lib/offline-queue'

interface OnlineStatus {
  isOnline: boolean
  pendingCount: number
  refreshPendingCount: () => Promise<void>
}

export function useOnlineStatus(): OnlineStatus {
  const [online, setOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount()
      setPendingCount(count)
    } catch {
      // IndexedDB not available
      setPendingCount(0)
    }
  }, [])

  useEffect(() => {
    // Initialize online status
    setOnline(isOnline())

    // Subscribe to online/offline changes
    const unsubscribe = onOnlineStatusChange((status) => {
      setOnline(status)

      // Refresh pending count when coming back online
      if (status) {
        refreshPendingCount()
      }
    })

    // Initial pending count
    refreshPendingCount()

    // Listen for service worker sync messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_SUBMISSIONS') {
        refreshPendingCount()
      }
    }

    navigator.serviceWorker?.addEventListener('message', handleMessage)

    return () => {
      unsubscribe()
      navigator.serviceWorker?.removeEventListener('message', handleMessage)
    }
  }, [refreshPendingCount])

  return {
    isOnline: online,
    pendingCount,
    refreshPendingCount,
  }
}
