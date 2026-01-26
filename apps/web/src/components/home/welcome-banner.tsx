'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Zap, Trophy, MessageCircle, Bell, Star, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks'

const DISMISSED_KEY = 'welcome-banner-dismissed'

export function WelcomeBanner() {
  const { isAuthenticated, profile, isLoading } = useAuth()
  const [isDismissed, setIsDismissed] = useState(true) // Start hidden to prevent flash

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    setIsDismissed(dismissed === 'true')
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem(DISMISSED_KEY, 'true')
  }

  // Don't show while loading auth state
  if (isLoading) return null

  // Don't show if dismissed
  if (isDismissed) return null

  // Show different content based on auth state
  const isNewUser = isAuthenticated && profile && !profile.onboarding_completed
  const isLoggedOut = !isAuthenticated

  // Only show for logged out users or new users who haven't completed onboarding
  if (!isLoggedOut && !isNewUser) return null

  if (isLoggedOut) {
    return (
      <div className="mb-6 relative overflow-hidden border-2 border-neon-blue/30 bg-gradient-to-br from-neon-blue/5 via-background to-neon-pink/5">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-foreground-muted hover:text-foreground transition-colors z-10"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-neon-yellow" />
            <h2 className="font-display font-black text-lg text-foreground uppercase tracking-wider">
              Hawaii Sports Center
            </h2>
          </div>

          {/* Value props */}
          <p className="text-sm text-foreground-muted mb-4 max-w-md">
            Your home for Hawaii high school sports. Live scores, game chat, and community.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="flex items-center gap-2 text-xs">
              <div className="h-8 w-8 flex items-center justify-center bg-neon-pink/10 border border-neon-pink/30">
                <Trophy className="h-4 w-4 text-neon-pink" />
              </div>
              <span className="text-foreground-muted">Live Scores</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-8 w-8 flex items-center justify-center bg-neon-blue/10 border border-neon-blue/30">
                <MessageCircle className="h-4 w-4 text-neon-blue" />
              </div>
              <span className="text-foreground-muted">Game Chat</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-8 w-8 flex items-center justify-center bg-neon-yellow/10 border border-neon-yellow/30">
                <Bell className="h-4 w-4 text-neon-yellow" />
              </div>
              <span className="text-foreground-muted">Alerts</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-8 w-8 flex items-center justify-center bg-neon-green/10 border border-neon-green/30">
                <Star className="h-4 w-4 text-neon-green" />
              </div>
              <span className="text-foreground-muted">Earn Points</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-neon-blue text-background font-display font-bold text-sm uppercase tracking-wider hover:bg-neon-blue/90 transition-colors"
            >
              Sign Up Free
              <ChevronRight className="h-4 w-4" />
            </Link>
            <button
              onClick={handleDismiss}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-border text-foreground-muted font-display font-bold text-xs uppercase tracking-wider hover:border-foreground-muted hover:text-foreground transition-colors"
            >
              Browse as Guest
            </button>
          </div>
        </div>
      </div>
    )
  }

  // For new users who haven't set favorites
  if (isNewUser) {
    return (
      <div className="mb-6 relative overflow-hidden border-2 border-neon-yellow/30 bg-gradient-to-br from-neon-yellow/5 via-background to-background">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-foreground-muted hover:text-foreground transition-colors z-10"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-neon-yellow" />
            <h2 className="font-display font-bold text-foreground">
              Welcome, {profile?.display_name || 'Fan'}!
            </h2>
          </div>

          <p className="text-sm text-foreground-muted mb-4">
            Set up your favorite teams and sports to personalize your feed.
          </p>

          <Link
            href="/profile/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neon-yellow text-background font-display font-bold text-sm uppercase tracking-wider hover:bg-neon-yellow/90 transition-colors"
          >
            <Star className="h-4 w-4" />
            Set Favorites
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return null
}
