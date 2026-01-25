import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { User as DBUser } from '@808scores/shared'

interface SupabaseContextType {
  supabase: typeof supabase
  session: Session | null
  user: User | null
  profile: DBUser | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<DBUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
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
      return data as DBUser
    } catch (err) {
      console.error('Profile fetch error:', err)
      return null
    }
  }

  const refreshProfile = async () => {
    if (session?.user) {
      const userProfile = await fetchProfile(session.user.id)
      setProfile(userProfile)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id)
        setProfile(userProfile)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        session,
        user: session?.user ?? null,
        profile,
        isLoading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
