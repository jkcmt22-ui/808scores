'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'

interface AuthState {
  user: SupabaseUser | null
  profile: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const supabase = createClient()

  // Fetch user profile from our users table
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as User
    } catch (err) {
      console.error('Profile fetch error:', err)
      return null
    }
  }, [supabase])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const profile = await fetchProfile(user.id)
          setState({
            user,
            profile,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setState({
            user: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } catch (err) {
        console.error('Auth init error:', err)
        setState({
          user: null,
          profile: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id)
          setState({
            user: session.user,
            profile,
            isLoading: false,
            isAuthenticated: true,
          })
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      // Navigate to home - no refresh needed
      router.push('/')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }, [supabase, router])

  // Update profile
  const updateProfile = useCallback(async (updates: { display_name?: string; avatar_url?: string }) => {
    if (!state.user) return null

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('users')
        .update(updates)
        .eq('id', state.user.id)
        .select()
        .single()

      if (error) throw error

      setState((prev) => ({
        ...prev,
        profile: data as User,
      }))

      return data as User
    } catch (err) {
      console.error('Update profile error:', err)
      return null
    }
  }, [supabase, state.user])

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (!state.user) return

    const profile = await fetchProfile(state.user.id)
    if (profile) {
      setState((prev) => ({ ...prev, profile }))
    }
  }, [state.user, fetchProfile])

  return {
    ...state,
    signOut,
    updateProfile,
    refreshProfile,
  }
}

/**
 * Hook for requiring authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo = '/login') {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      const currentPath = window.location.pathname
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [auth.isLoading, auth.isAuthenticated, redirectTo, router])

  return auth
}
