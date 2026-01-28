'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = '808scores_pwa_dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(DISMISSED_KEY)
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return // Don't show if dismissed recently
      }
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // For iOS, show manual instructions after a delay
    if (ios && !standalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000) // Show after 3 seconds on iOS
      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
    } catch (err) {
      console.error('Install prompt error:', err)
    }

    setDeferredPrompt(null)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString())
    setShowPrompt(false)
  }, [])

  // Don't show if already installed or not showing
  if (isStandalone || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 animate-fade-in">
      <div className="max-w-lg mx-auto border-2 border-neon-blue bg-background shadow-lg shadow-neon-blue/20">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-neon-blue/20 border border-neon-blue/30 flex-shrink-0">
              <Smartphone className="h-5 w-5 text-neon-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-foreground text-sm">
                Install Hawaii Sports Center
              </h3>
              <p className="text-xs text-foreground-muted mt-1">
                {isIOS
                  ? 'Tap the share button, then "Add to Home Screen" for the best experience.'
                  : 'Add to your home screen for quick access to live scores.'}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-foreground-muted hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!isIOS && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-neon-blue text-black font-display font-bold text-sm uppercase tracking-wider hover:bg-neon-blue/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Install App
            </button>
          )}

          {isIOS && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-background-secondary border border-border text-xs text-foreground-muted">
              <span>Tap</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L12 14M12 2L8 6M12 2L16 6M4 14V20H20V14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>then &quot;Add to Home Screen&quot;</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
