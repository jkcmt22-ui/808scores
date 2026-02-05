'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserTier } from '@/types/database'

export interface LeaderboardUser {
  id: string
  display_name: string | null
  avatar_url: string | null
  total_points: number
  season_points: number
  tier: UserTier
  accuracy_rate: number | null
  submission_count: number
  verified_count: number
}

type TimeFrame = 'season' | 'month' | 'week' | 'all'

interface UseLeaderboardOptions {
  timeFrame?: TimeFrame
  limit?: number
}

interface UseLeaderboardReturn {
  leaders: LeaderboardUser[]
  userRank: number | null
  userPoints: number | null
  isLoading: boolean
  error: Error | null
}

export function useLeaderboard(options: UseLeaderboardOptions = {}): UseLeaderboardReturn {
  const { timeFrame = 'season', limit = 50 } = options
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [userPoints, setUserPoints] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()

        if (!supabase) {
          setError(new Error('Database connection not available'))
          setIsLoading(false)
          return
        }

        // Get current user for rank calculation
        const { data: { user } } = await supabase.auth.getUser()

        // Fetch from public_leaderboard view
        // The view already orders by total_points DESC
        const query = supabase
          .from('public_leaderboard')
          .select('*')
          .limit(limit)

        // For now, we use total_points for all time frames
        // In a real implementation, you'd have separate columns for each period
        // or calculate based on submission dates

        const { data, error: fetchError } = await query

        if (fetchError) {
          throw fetchError
        }

        const leaders = (data as LeaderboardUser[]) || []
        setLeaders(leaders)

        // Calculate user's rank if logged in
        if (user && leaders.length > 0) {
          const userIndex = leaders.findIndex(u => u.id === user.id)
          if (userIndex !== -1) {
            setUserRank(userIndex + 1)
            setUserPoints(leaders[userIndex].total_points)
          } else {
            // User not in top N, fetch their actual rank
            const { data: userData } = await supabase
              .from('public_leaderboard')
              .select('total_points')
              .eq('id', user.id)
              .single()

            if (userData) {
              const userDataTyped = userData as { total_points: number }
              setUserPoints(userDataTyped.total_points)
              // Count users with more points to get rank
              const { count } = await supabase
                .from('public_leaderboard')
                .select('*', { count: 'exact', head: true })
                .gt('total_points', userDataTyped.total_points)

              setUserRank(count !== null ? count + 1 : null)
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch leaderboard'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [timeFrame, limit])

  return { leaders, userRank, userPoints, isLoading, error }
}
