'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Badge {
  id: string
  code: string
  name: string
  description: string | null
  icon_url: string | null
  category: string | null
}

export interface UserBadge {
  user_id: string
  badge_id: string
  earned_at: string
  badge: Badge
}

export function useBadges() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = useMemo(() => createClient()!, [])

  useEffect(() => {
    const fetchBadges = async () => {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (!error && data) {
        setBadges(data as Badge[])
      }
      setIsLoading(false)
    }

    fetchBadges()
  }, [supabase])

  return { badges, isLoading }
}

export function useUserBadges(userId: string | undefined) {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = useMemo(() => createClient()!, [])

  const fetchUserBadges = useCallback(async () => {
    if (!userId) {
      setUserBadges([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        user_id,
        badge_id,
        earned_at,
        badge:badges(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (!error && data) {
      // Transform the nested badge object
      const transformed = (data as unknown as Array<{
        user_id: string
        badge_id: string
        earned_at: string
        badge: Badge
      }>).map(ub => ({
        ...ub,
        badge: ub.badge
      }))
      setUserBadges(transformed)
    }
    setIsLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    fetchUserBadges()
  }, [fetchUserBadges])

  // Subscribe to new badge earnings
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`user-badges-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refetch to get full badge data
          fetchUserBadges()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId, fetchUserBadges])

  const earnedBadgeCodes = useMemo(
    () => new Set(userBadges.map(ub => ub.badge.code)),
    [userBadges]
  )

  return {
    userBadges,
    isLoading,
    earnedBadgeCodes,
    refetch: fetchUserBadges,
  }
}
