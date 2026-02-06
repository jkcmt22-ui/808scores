'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getPendingSubmissions,
  getPendingCount,
  removeFromQueue,
  syncSubmission,
  onOnlineStatusChange,
  isOnline as checkIsOnline,
  type PendingSubmission,
} from '@/lib/offline-queue'
import { useAuth } from './use-auth'

export function useOfflineQueue() {
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const { user } = useAuth()

  // Load pending submissions
  const loadPendingSubmissions = useCallback(async () => {
    try {
      const submissions = await getPendingSubmissions()
      setPendingSubmissions(submissions)
      const count = await getPendingCount()
      setPendingCount(count)
    } catch (err) {
      console.error('[OfflineQueue] Error loading submissions:', err)
    }
  }, [])

  // Sync all pending submissions via the submit-score API
  const syncAll = useCallback(async () => {
    if (!user || isSyncing) return

    setIsSyncing(true)
    const submissions = await getPendingSubmissions()
    const pendingToSync = submissions.filter(s => s.status === 'pending' || s.status === 'failed')

    for (const submission of pendingToSync) {
      if (submission.retryCount >= 3) {
        console.warn('[OfflineQueue] Max retries reached for:', submission.id)
        continue
      }

      const result = await syncSubmission(submission)
      if (result.success) {
        console.log('[OfflineQueue] Synced submission:', submission.id)
      } else {
        console.error('[OfflineQueue] Failed to sync:', submission.id, result.error)
      }
    }

    await loadPendingSubmissions()
    setIsSyncing(false)
  }, [user, isSyncing, loadPendingSubmissions])

  // Remove a submission
  const removePending = useCallback(async (id: string) => {
    await removeFromQueue(id)
    await loadPendingSubmissions()
  }, [loadPendingSubmissions])

  // Initial load and online status
  useEffect(() => {
    setIsOnline(checkIsOnline())
    loadPendingSubmissions()

    const unsubscribe = onOnlineStatusChange((online) => {
      setIsOnline(online)
      if (online) {
        // Auto-sync when coming back online
        syncAll()
      }
    })

    return unsubscribe
  }, [loadPendingSubmissions, syncAll])

  // Listen for messages from service worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        loadPendingSubmissions()
      } else if (event.data?.type === 'SYNC_SUBMISSIONS') {
        // Service worker is requesting us to sync
        console.log('[OfflineQueue] Service worker requested sync')
        syncAll()
      }
    }

    navigator.serviceWorker?.addEventListener('message', handleMessage)
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage)
    }
  }, [loadPendingSubmissions, syncAll])

  return {
    pendingSubmissions,
    pendingCount,
    isOnline,
    isSyncing,
    syncAll,
    removePending,
    refresh: loadPendingSubmissions,
  }
}
