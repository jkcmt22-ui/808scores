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
  const db = await openDB()

  const transaction = db.transaction(STORE_NAME, 'readwrite')
  const store = transaction.objectStore(STORE_NAME)

  // Remove synced submissions (status !== 'pending' && status !== 'failed')
  for (const submission of submissions) {
    if (submission.status !== 'pending' && submission.status !== 'failed') {
      store.delete(submission.id)
    }
  }
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

// Sync a single submission (called by service worker or manual retry)
export async function syncSubmission(
  submission: PendingSubmission,
  supabase: {
    from: (table: string) => {
      insert: (data: Record<string, unknown>) => { select: () => { single: () => Promise<{ error: Error | null }> } }
      update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: Error | null }> }
    }
  },
  userId: string,
  profile: { tier?: string; total_points?: number; submission_count?: number } | null
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateSubmissionStatus(submission.id, 'syncing')

    // Create the submission record
    const submissionData = {
      game_id: submission.gameId,
      user_id: userId,
      submission_type: submission.submissionType,
      period: submission.submissionType === 'final_score' ? null : submission.period,
      home_score: submission.homeScore,
      away_score: submission.awayScore,
      time_remaining: submission.timeRemaining,
      photo_url: submission.hasPhoto ? 'pending_upload' : null,
      at_game: submission.hasLocation,
      points_earned: submission.pointsEarned,
      status: 'pending',
    }

    const { error: submissionError } = await supabase
      .from('submissions')
      .insert(submissionData)
      .select()
      .single()

    if (submissionError) throw submissionError

    // Update game status
    const isTrusted = profile?.tier === 'trusted' || profile?.tier === 'elite'

    if (submission.submissionType === 'final_score') {
      await supabase
        .from('games')
        .update({
          status: 'final',
          home_score: submission.homeScore,
          away_score: submission.awayScore,
          current_period: null,
          time_remaining: null,
          is_verified: isTrusted,
          verification_method: isTrusted ? 'trusted' : null,
        })
        .eq('id', submission.gameId)
    } else {
      await supabase
        .from('games')
        .update({
          status: 'in_progress',
          home_score: submission.homeScore,
          away_score: submission.awayScore,
          current_period: submission.period,
          time_remaining: submission.timeRemaining,
          is_verified: isTrusted,
          verification_method: isTrusted ? 'trusted' : null,
        })
        .eq('id', submission.gameId)
    }

    // Update user points
    if (profile) {
      await supabase
        .from('users')
        .update({
          total_points: (profile.total_points || 0) + submission.pointsEarned,
          submission_count: (profile.submission_count || 0) + 1,
        })
        .eq('id', userId)
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
