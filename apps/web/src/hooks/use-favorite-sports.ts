'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Sport } from '@/types/database'

interface SportFollow {
  sport_id: string
  notify: boolean
  created_at: string
  sport: Sport
}

interface UseFavoriteSportsReturn {
  favoriteSports: SportFollow[]
  isLoading: boolean
  error: string | null
  addFavorite: (sportId: string, notify?: boolean) => Promise<boolean>
  removeFavorite: (sportId: string) => Promise<boolean>
  toggleNotify: (sportId: string, notify: boolean) => Promise<boolean>
  isFavorite: (sportId: string) => boolean
}

export function useFavoriteSports(userId: string | undefined): UseFavoriteSportsReturn {
  const [favoriteSports, setFavoriteSports] = useState<SportFollow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Fetch favorite sports
  useEffect(() => {
    if (!userId) {
      setFavoriteSports([])
      setIsLoading(false)
      return
    }

    const fetchFavorites = async () => {
      if (!supabase) {
        setError('Database connection not available')
        setIsLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('sport_follows')
          .select(`
            sport_id,
            notify,
            created_at,
            sport:sports(*)
          `)
          .eq('user_id', userId)

        if (fetchError) throw fetchError

        // Transform data
        type SportFollowRow = {
          sport_id: string
          notify: boolean
          created_at: string
          sport: Sport
        }
        const follows = ((data || []) as SportFollowRow[]).map((item) => ({
          sport_id: item.sport_id,
          notify: item.notify,
          created_at: item.created_at,
          sport: item.sport,
        }))

        setFavoriteSports(follows)
      } catch (err) {
        console.error('Error fetching favorite sports:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch favorites')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [userId, supabase])

  // Add favorite sport
  const addFavorite = useCallback(async (sportId: string, notify = true): Promise<boolean> => {
    if (!supabase || !userId) return false

    try {
      const { error: insertError } = await supabase
        .from('sport_follows')
        .insert({
          user_id: userId,
          sport_id: sportId,
          notify,
        } as never)

      if (insertError) throw insertError

      // Fetch the sport details
      const { data: sport } = await supabase
        .from('sports')
        .select('*')
        .eq('id', sportId)
        .single()

      if (sport) {
        setFavoriteSports((prev) => [
          ...prev,
          {
            sport_id: sportId,
            notify,
            created_at: new Date().toISOString(),
            sport: sport as Sport,
          },
        ])
      }

      return true
    } catch (err) {
      console.error('Error adding favorite:', err)
      setError(err instanceof Error ? err.message : 'Failed to add favorite')
      return false
    }
  }, [userId, supabase])

  // Remove favorite sport
  const removeFavorite = useCallback(async (sportId: string): Promise<boolean> => {
    if (!supabase || !userId) return false

    try {
      const { error: deleteError } = await supabase
        .from('sport_follows')
        .delete()
        .eq('user_id', userId)
        .eq('sport_id', sportId)

      if (deleteError) throw deleteError

      setFavoriteSports((prev) => prev.filter((f) => f.sport_id !== sportId))
      return true
    } catch (err) {
      console.error('Error removing favorite:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove favorite')
      return false
    }
  }, [userId, supabase])

  // Toggle notifications for a sport
  const toggleNotify = useCallback(async (sportId: string, notify: boolean): Promise<boolean> => {
    if (!supabase || !userId) return false

    try {
      const { error: updateError } = await supabase
        .from('sport_follows')
        .update({ notify } as never)
        .eq('user_id', userId)
        .eq('sport_id', sportId)

      if (updateError) throw updateError

      setFavoriteSports((prev) =>
        prev.map((f) =>
          f.sport_id === sportId ? { ...f, notify } : f
        )
      )
      return true
    } catch (err) {
      console.error('Error updating notification:', err)
      setError(err instanceof Error ? err.message : 'Failed to update notification')
      return false
    }
  }, [userId, supabase])

  // Check if a sport is favorited
  const isFavorite = useCallback((sportId: string): boolean => {
    return favoriteSports.some((f) => f.sport_id === sportId)
  }, [favoriteSports])

  return {
    favoriteSports,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    toggleNotify,
    isFavorite,
  }
}
