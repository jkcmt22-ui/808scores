'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { School } from '@/types/database'

interface TeamFollow {
  school_id: string
  notify: boolean
  created_at: string
  school: School
}

interface UseFavoriteTeamsReturn {
  favoriteTeams: TeamFollow[]
  isLoading: boolean
  error: string | null
  addFavorite: (schoolId: string, notify?: boolean) => Promise<boolean>
  removeFavorite: (schoolId: string) => Promise<boolean>
  toggleNotify: (schoolId: string, notify: boolean) => Promise<boolean>
  isFavorite: (schoolId: string) => boolean
}

export function useFavoriteTeams(userId: string | undefined): UseFavoriteTeamsReturn {
  const [favoriteTeams, setFavoriteTeams] = useState<TeamFollow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Fetch favorite teams
  useEffect(() => {
    if (!userId) {
      setFavoriteTeams([])
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
          .from('team_follows')
          .select(`
            school_id,
            notify,
            created_at,
            school:schools(*)
          `)
          .eq('user_id', userId)

        if (fetchError) throw fetchError

        // Transform data
        type TeamFollowRow = {
          school_id: string
          notify: boolean
          created_at: string
          school: School
        }
        const follows = ((data || []) as TeamFollowRow[]).map((item) => ({
          school_id: item.school_id,
          notify: item.notify,
          created_at: item.created_at,
          school: item.school,
        }))

        setFavoriteTeams(follows)
      } catch (err) {
        console.error('Error fetching favorite teams:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch favorites')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [userId, supabase])

  // Add favorite team
  const addFavorite = useCallback(async (schoolId: string, notify = true): Promise<boolean> => {
    if (!supabase || !userId) return false

    try {
      const { error: insertError } = await supabase
        .from('team_follows')
        .insert({
          user_id: userId,
          school_id: schoolId,
          notify,
        } as never)

      if (insertError) throw insertError

      // Fetch the school details
      const { data: school } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single()

      if (school) {
        setFavoriteTeams((prev) => [
          ...prev,
          {
            school_id: schoolId,
            notify,
            created_at: new Date().toISOString(),
            school: school as School,
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

  // Remove favorite team
  const removeFavorite = useCallback(async (schoolId: string): Promise<boolean> => {
    if (!supabase || !userId) return false

    try {
      const { error: deleteError } = await supabase
        .from('team_follows')
        .delete()
        .eq('user_id', userId)
        .eq('school_id', schoolId)

      if (deleteError) throw deleteError

      setFavoriteTeams((prev) => prev.filter((f) => f.school_id !== schoolId))
      return true
    } catch (err) {
      console.error('Error removing favorite:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove favorite')
      return false
    }
  }, [userId, supabase])

  // Toggle notifications for a team
  const toggleNotify = useCallback(async (schoolId: string, notify: boolean): Promise<boolean> => {
    if (!supabase || !userId) return false

    try {
      const { error: updateError } = await supabase
        .from('team_follows')
        .update({ notify } as never)
        .eq('user_id', userId)
        .eq('school_id', schoolId)

      if (updateError) throw updateError

      setFavoriteTeams((prev) =>
        prev.map((f) =>
          f.school_id === schoolId ? { ...f, notify } : f
        )
      )
      return true
    } catch (err) {
      console.error('Error updating notification:', err)
      setError(err instanceof Error ? err.message : 'Failed to update notification')
      return false
    }
  }, [userId, supabase])

  // Check if a school is favorited
  const isFavorite = useCallback((schoolId: string): boolean => {
    return favoriteTeams.some((f) => f.school_id === schoolId)
  }, [favoriteTeams])

  return {
    favoriteTeams,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    toggleNotify,
    isFavorite,
  }
}
