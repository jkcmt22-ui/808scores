'use client'

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'
import {
  trackAuthSubscription,
  untrackAuthSubscription,
  trackProfileFetch,
  logAuthEvent,
} from '@/lib/auth-debug'

// Auth initialization timeout (5 seconds)
const AUTH_INIT_TIMEOUT_MS = 5000

/**
 * Explicit profile fields selection - no select('*')
 * This documents our dependencies and ensures predictable query results.
 * Update this list if new User fields are needed.
 */
const PROFILE_FIELDS = `
  id,
  display_name,
  avatar_url,
  email,
  phone,
  tier,
  created_at,
  is_admin,
  is_super_admin,
  is_trusted_reporter,
  total_points,
  season_points,
  submission_count,
  verified_count,
  reputation_score,
  accuracy_rate,
  onboarding_completed
`.replace(/\s+/g, '')

interface AuthContextType {
  user: SupabaseUser | null
  profile: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: { display_name?: string; avatar_url?: string }) => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const subscriptionIdRef = useRef<string>('')
  const hasInitializedRef = useRef(false)

  const supabase = createClient()

  // Fetch user profile with instrumentation
  const fetchProfile = async (userId: string, source: string) => {
    if (!supabase) return null

    const query = `select(${PROFILE_FIELDS})`

    return trackProfileFetch('AuthProvider.' + source, userId, query, async () => {
      const { data, error } = await supabase
        .from('users')
        .select(PROFILE_FIELDS)
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as User
    })
  }

  // Initialize auth
  useEffect(() => {
    // If supabase client isn't available (build time), skip initialization
    if (!supabase) {
      setIsLoading(false)
      return
    }

    // Prevent double initialization (React StrictMode can cause this)
    if (hasInitializedRef.current) {
      return
    }
    hasInitializedRef.current = true

    const initAuth = async () => {
      logAuthEvent('INIT_START', 'AuthProvider')

      // Create a timeout promise
      const timeoutPromise = new Promise<{ data: { user: null }, timedOut: true }>((resolve) => {
        setTimeout(() => {
          resolve({ data: { user: null }, timedOut: true })
        }, AUTH_INIT_TIMEOUT_MS)
      })

      try {
        // Race between auth check and timeout
        const authPromise = supabase.auth.getUser().then(result => ({ ...result, timedOut: false }))
        const result = await Promise.race([authPromise, timeoutPromise])

        if ('timedOut' in result && result.timedOut) {
          console.warn('Auth init timed out after', AUTH_INIT_TIMEOUT_MS, 'ms')
          logAuthEvent('INIT_TIMEOUT', 'AuthProvider', { timeout: AUTH_INIT_TIMEOUT_MS })
          // Continue without user - they can retry or the auth state change listener will pick up
          setIsLoading(false)
          return
        }

        const authUser = result.data.user

        if (authUser) {
          setUser(authUser)
          const userProfile = await fetchProfile(authUser.id, 'init')
          setProfile(userProfile)
          logAuthEvent('INIT_COMPLETE', 'AuthProvider', { hasUser: true, hasProfile: !!userProfile })
        } else {
          logAuthEvent('INIT_COMPLETE', 'AuthProvider', { hasUser: false })
        }
      } catch (err) {
        console.error('Auth init error:', err)
        logAuthEvent('INIT_ERROR', 'AuthProvider', { error: String(err) })
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Track subscription creation
    subscriptionIdRef.current = trackAuthSubscription('AuthProvider')

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logAuthEvent(event, 'AuthProvider', { hasSession: !!session })

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          const userProfile = await fetchProfile(session.user.id, 'onAuthStateChange')
          setProfile(userProfile)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      untrackAuthSubscription(subscriptionIdRef.current)
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id, 'refreshProfile')
      setProfile(userProfile)
    }
  }

  const updateProfile = async (updates: { display_name?: string; avatar_url?: string }): Promise<User | null> => {
    if (!user || !supabase) return null

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data as User)
      return data as User
    } catch (err) {
      console.error('Update profile error:', err)
      return null
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
