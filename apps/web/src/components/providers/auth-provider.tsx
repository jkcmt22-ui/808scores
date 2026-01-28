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

  const supabase = createClient()

  // Fetch user profile with instrumentation
  const fetchProfile = async (userId: string, source: string) => {
    if (!supabase) return null

    const query = "select('*')" // TODO: Will be narrowed in Commit 3

    return trackProfileFetch('AuthProvider.' + source, userId, query, async () => {
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
    })
  }

  // Initialize auth
  useEffect(() => {
    // If supabase client isn't available (build time), skip initialization
    if (!supabase) {
      setIsLoading(false)
      return
    }

    const initAuth = async () => {
      logAuthEvent('INIT_START', 'AuthProvider')
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

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
