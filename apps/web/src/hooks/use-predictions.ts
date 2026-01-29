/**
 * Prediction Hooks
 *
 * React hooks for game predictions functionality.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getUserPrediction,
  submitPrediction as apiSubmitPrediction,
  deletePrediction as apiDeletePrediction,
  getAudienceExpectation,
  getPredictionResults,
  arePredictionsOpen,
} from '@/lib/predictions/api'
import type {
  GamePrediction,
  AudienceExpectation,
  PredictionResult,
  PredictionResultEntry,
} from '@/types/database'

/**
 * Hook to get and manage the current user's prediction for a game
 */
export function usePrediction(gameId: string, userId: string | undefined) {
  const [prediction, setPrediction] = useState<GamePrediction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Fetch prediction
  const fetchPrediction = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const { prediction: data, error: err } = await getUserPrediction(gameId, userId)
    setPrediction(data)
    setError(err || null)
    setIsLoading(false)
  }, [gameId, userId])

  // Initial fetch
  useEffect(() => {
    fetchPrediction()
  }, [fetchPrediction])

  // Subscribe to changes
  useEffect(() => {
    if (!supabase || !userId) return

    const channel = supabase
      .channel(`prediction-${gameId}-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_predictions',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          // Only update if it's the current user's prediction
          if (
            (payload.new && (payload.new as GamePrediction).user_id === userId) ||
            (payload.old && (payload.old as GamePrediction).user_id === userId)
          ) {
            fetchPrediction()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, gameId, userId, fetchPrediction])

  return { prediction, isLoading, error, refetch: fetchPrediction }
}

/**
 * Hook to submit or update a prediction
 */
export function useSubmitPrediction() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(
    async (
      gameId: string,
      userId: string,
      homeScore: number,
      awayScore: number
    ): Promise<GamePrediction | null> => {
      setIsSubmitting(true)
      setError(null)

      const { prediction, error: err } = await apiSubmitPrediction(
        gameId,
        userId,
        homeScore,
        awayScore
      )

      setIsSubmitting(false)
      if (err) {
        setError(err)
        return null
      }

      return prediction
    },
    []
  )

  const remove = useCallback(
    async (gameId: string, userId: string): Promise<boolean> => {
      setIsSubmitting(true)
      setError(null)

      const { success, error: err } = await apiDeletePrediction(gameId, userId)

      setIsSubmitting(false)
      if (err) {
        setError(err)
        return false
      }

      return success
    },
    []
  )

  return { submit, remove, isSubmitting, error }
}

/**
 * Hook to get audience expectation (aggregated predictions)
 */
export function useAudienceExpectation(gameId: string) {
  const [expectation, setExpectation] = useState<AudienceExpectation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Fetch expectation
  const fetchExpectation = useCallback(async () => {
    setIsLoading(true)
    const { expectation: data, error: err } = await getAudienceExpectation(gameId)
    setExpectation(data)
    setError(err || null)
    setIsLoading(false)
  }, [gameId])

  // Initial fetch
  useEffect(() => {
    fetchExpectation()
  }, [fetchExpectation])

  // Subscribe to prediction changes (to update audience expectation in real-time)
  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel(`audience-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_predictions',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          // Refetch audience expectation when any prediction changes
          fetchExpectation()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, gameId, fetchExpectation])

  return { expectation, isLoading, error, refetch: fetchExpectation }
}

/**
 * Hook to get prediction results for a finalized game
 */
export function usePredictionResults(gameId: string) {
  const [results, setResults] = useState<PredictionResult | null>(null)
  const [entries, setEntries] = useState<PredictionResultEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Fetch results
  const fetchResults = useCallback(async () => {
    setIsLoading(true)
    const { results: data, entries: entriesData, error: err } = await getPredictionResults(gameId)
    setResults(data)
    setEntries(entriesData)
    setError(err || null)
    setIsLoading(false)
  }, [gameId])

  // Initial fetch
  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  // Subscribe to results being created
  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel(`results-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'prediction_results',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          fetchResults()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, gameId, fetchResults])

  return { results, entries, isLoading, error, refetch: fetchResults }
}

/**
 * Hook to check if predictions are open for a game
 */
export function usePredictionsOpen(gameId: string) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  const supabase = useMemo(() => createClient(), [])

  const checkOpen = useCallback(async () => {
    setIsLoading(true)
    const { open: isOpen, reason: closeReason } = await arePredictionsOpen(gameId)
    setOpen(isOpen)
    setReason(closeReason)
    setIsLoading(false)
  }, [gameId])

  // Initial check
  useEffect(() => {
    checkOpen()
  }, [checkOpen])

  // Subscribe to game changes
  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel(`game-status-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        () => {
          checkOpen()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, gameId, checkOpen])

  // Also check periodically in case game time passes
  useEffect(() => {
    const interval = setInterval(checkOpen, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [checkOpen])

  return { open, reason, isLoading, refetch: checkOpen }
}

/**
 * Get user's rank from prediction results
 */
export function getUserRankFromResults(
  entries: PredictionResultEntry[],
  userId: string
): PredictionResultEntry | null {
  return entries.find((e) => e.user_id === userId) || null
}
