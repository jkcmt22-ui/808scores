'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/providers/auth-provider'

/**
 * Primary auth hook - wraps useAuthContext for backward compatibility
 *
 * IMPORTANT: This hook no longer creates its own subscription.
 * All auth state comes from the single AuthProvider subscription.
 *
 * Returns: user, profile, isLoading, isAuthenticated, signOut, updateProfile, refreshProfile
 */
export function useAuth() {
  const context = useAuthContext()

  // Return the same API as before for backward compatibility
  return {
    user: context.user,
    profile: context.profile,
    isLoading: context.isLoading,
    isProfileLoading: context.isProfileLoading,  // Track profile fetch separately
    isAuthenticated: context.isAuthenticated,
    signOut: context.signOut,
    updateProfile: context.updateProfile,
    refreshProfile: context.refreshProfile,
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
