'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RaffleWithPrize, RaffleEntry, RaffleWinnerWithDetails } from '@/types/database'

interface UseRafflesOptions {
  status?: 'open' | 'closed' | 'completed' | 'all'
  limit?: number
}

interface UseRafflesReturn {
  raffles: RaffleWithPrize[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRaffles({ status = 'open', limit = 10 }: UseRafflesOptions = {}): UseRafflesReturn {
  const [raffles, setRaffles] = useState<RaffleWithPrize[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchRaffles = useCallback(async () => {
    if (!supabase) {
      setError('Database connection not available')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    let query = supabase
      .from('raffles')
      .select(`
        *,
        prize:prizes(*)
      `)
      .eq('is_active', true)
      .order('entries_close_at', { ascending: true })
      .limit(limit)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching raffles:', fetchError)
      setError('Failed to load raffles')
      setIsLoading(false)
      return
    }

    setRaffles((data || []) as RaffleWithPrize[])
    setIsLoading(false)
  }, [supabase, status, limit])

  useEffect(() => {
    fetchRaffles()
  }, [fetchRaffles])

  return {
    raffles,
    isLoading,
    error,
    refetch: fetchRaffles,
  }
}

interface UseUserRaffleEntriesOptions {
  userId?: string
}

interface UseUserRaffleEntriesReturn {
  entries: (RaffleEntry & { raffle: RaffleWithPrize })[]
  isLoading: boolean
  refetch: () => Promise<void>
}

export function useUserRaffleEntries({ userId }: UseUserRaffleEntriesOptions): UseUserRaffleEntriesReturn {
  const [entries, setEntries] = useState<(RaffleEntry & { raffle: RaffleWithPrize })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchEntries = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    if (!userId) {
      setEntries([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const { data, error } = await supabase
      .from('raffle_entries')
      .select(`
        *,
        raffle:raffles(
          *,
          prize:prizes(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching entries:', error)
      setIsLoading(false)
      return
    }

    setEntries((data || []) as (RaffleEntry & { raffle: RaffleWithPrize })[])
    setIsLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Subscribe to entry changes
  useEffect(() => {
    if (!supabase || !userId) return

    const channel = supabase
      .channel(`raffle-entries-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'raffle_entries',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchEntries()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId, fetchEntries])

  return {
    entries,
    isLoading,
    refetch: fetchEntries,
  }
}

interface UsePastWinnersReturn {
  winners: RaffleWinnerWithDetails[]
  isLoading: boolean
}

export function usePastWinners(limit: number = 10): UsePastWinnersReturn {
  const [winners, setWinners] = useState<RaffleWinnerWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchWinners() {
      if (!supabase) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('raffle_winners')
        .select(`
          *,
          user:users(id, display_name, avatar_url),
          prize:prizes(*),
          raffle:raffles(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching winners:', error)
        setIsLoading(false)
        return
      }

      setWinners((data || []) as RaffleWinnerWithDetails[])
      setIsLoading(false)
    }

    fetchWinners()
  }, [supabase, limit])

  return {
    winners,
    isLoading,
  }
}

// Hook for entering a raffle
export function useEnterRaffle() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const enterRaffle = useCallback(
    async (raffleId: string, entryCount: number): Promise<{ success: boolean; error?: string }> => {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' }
      }

      setIsLoading(true)
      setError(null)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any).rpc('enter_raffle', {
        p_raffle_id: raffleId,
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_entry_count: entryCount,
      })

      setIsLoading(false)

      if (rpcError) {
        setError(rpcError.message)
        return { success: false, error: rpcError.message }
      }

      const result = data as { success: boolean; error?: string }
      if (!result.success) {
        setError(result.error || 'Failed to enter raffle')
        return result
      }

      return result
    },
    [supabase]
  )

  return {
    enterRaffle,
    isLoading,
    error,
  }
}
