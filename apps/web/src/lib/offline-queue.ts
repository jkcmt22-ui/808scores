/**
 * Offline Queue for Score Submissions
 * Uses IndexedDB to store pending submissions when offline
 * and syncs them when connection is restored
 */

const DB_NAME = 'hawaiisports-offline'
const DB_VERSION = 1
const STORE_NAME = 'pending-submissions'

export interface PendingSubmission {
  id: string
  createdAt: string
  gameId: string
  gameName: string // "Away @ Home" for display
  submissionType: 'period_score' | 'final_score' | 'live_update'
  period: string | null
  homeScore: number
  awayScore: number
  timeRemaining: string | null
  isOvertime: boolean
  overtimeCount: number
  hasPhoto: boolean
  hasLocation: boolean
  pointsEarned: number
  status: 'pending' | 'syncing' | 'failed'
  error?: string
  retryCount: number
}

// Open/create the IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('gameId', 'gameId', { unique: false })
        store.createIndex('status', 'status', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

// Add a submission to the offline queue
export async function addToQueue(submission: Omit<PendingSubmission, 'id' | 'createdAt' | 'status' | 'retryCount'>): Promise<PendingSubmission> {
  const db = await openDB()

  const pendingSubmission: PendingSubmission = {
    ...submission,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    retryCount: 0,
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.add(pendingSubmission)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      // Request background sync
      requestBackgroundSync()
      resolve(pendingSubmission)
    }
  })
}

// Get all pending submissions
export async function getPendingSubmissions(): Promise<PendingSubmission[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Get pending submissions count
export async function getPendingCount(): Promise<number> {
  const submissions = await getPendingSubmissions()
  return submissions.filter(s => s.status === 'pending' || s.status === 'syncing').length
}

// Update a submission's status
export async function updateSubmissionStatus(
  id: string,
  status: PendingSubmission['status'],
  error?: string
): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const getRequest = store.get(id)

    getRequest.onerror = () => reject(getRequest.error)
    getRequest.onsuccess = () => {
      const submission = getRequest.result as PendingSubmission
      if (submission) {
        submission.status = status
        if (error) submission.error = error
        if (status === 'syncing') submission.retryCount++

        const putRequest = store.put(submission)
        putRequest.onerror = () => reject(putRequest.error)
        putRequest.onsuccess = () => resolve()
      } else {
        resolve()
      }
    }
  })
}

// Remove a submission from the queue
export async function removeFromQueue(id: string): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Clear all completed/synced submissions
export async function clearSyncedSubmissions(): Promise<void> {
  const submissions = await getPendingSubmissions()
  const toDelete = submissions.filter(
    s => s.status !== 'pending' && s.status !== 'failed'
  )

  if (toDelete.length === 0) return

  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)

    for (const submission of toDelete) {
      store.delete(submission.id)
    }
  })
}

// Request background sync from service worker
function requestBackgroundSync(): void {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      // @ts-expect-error - sync is not in the types yet
      registration.sync.register('sync-submissions').catch((err: Error) => {
        console.warn('[OfflineQueue] Background sync registration failed:', err)
      })
    })
  }
}

// Check if online
export function isOnline(): boolean {
  return navigator.onLine
}

// Listen for online/offline events
export function onOnlineStatusChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

// Sync a single submission via the submit-score API
// This ensures all safeguards (rate limiting, verification, atomic point awards) are applied
export async function syncSubmission(
  submission: PendingSubmission
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateSubmissionStatus(submission.id, 'syncing')

    const response = await fetch(`/api/games/${submission.gameId}/submit-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submission_type: submission.submissionType,
        home_score: submission.homeScore,
        away_score: submission.awayScore,
        period: submission.period,
        time_remaining: submission.timeRemaining,
        is_overtime: submission.isOvertime,
        overtime_count: submission.overtimeCount,
        photo_url: submission.hasPhoto ? 'pending_upload' : null,
        at_game: submission.hasLocation,
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({ message: 'Unknown error' }))
      // Rate limited means a duplicate was likely already submitted — treat as success
      if (response.status === 429) {
        await removeFromQueue(submission.id)
        return { success: true }
      }
      throw new Error(data.message || `HTTP ${response.status}`)
    }

    // Remove from queue on success
    await removeFromQueue(submission.id)
    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Sync failed'
    await updateSubmissionStatus(submission.id, 'failed', errorMessage)
    return { success: false, error: errorMessage }
  }
}
