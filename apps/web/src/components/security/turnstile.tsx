'use client'

import { useEffect, useRef, useCallback } from 'react'
import { getTurnstileSiteKey } from '@/lib/security'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'error-callback'?: (error: string) => void
          'expired-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact'
          action?: string
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void
  onError?: (error: string) => void
  onExpire?: () => void
  action?: string
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  className?: string
}

export function Turnstile({
  onVerify,
  onError,
  onExpire,
  action,
  theme = 'dark',
  size = 'normal',
  className,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const scriptLoadedRef = useRef(false)

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return

    const siteKey = getTurnstileSiteKey()
    if (!siteKey) {
      console.warn('Turnstile site key not configured')
      // In development, auto-verify
      if (process.env.NODE_ENV === 'development') {
        onVerify('dev-token')
      }
      return
    }

    // Remove existing widget if any
    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current)
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      'error-callback': onError,
      'expired-callback': onExpire,
      theme,
      size,
      action,
    })
  }, [onVerify, onError, onExpire, theme, size, action])

  useEffect(() => {
    // Check if script is already loaded
    if (window.turnstile) {
      renderWidget()
      return
    }

    // Check if script is already being loaded
    if (scriptLoadedRef.current) {
      return
    }

    // Load the Turnstile script
    scriptLoadedRef.current = true

    window.onTurnstileLoad = () => {
      renderWidget()
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [renderWidget])

  return (
    <div
      ref={containerRef}
      className={className}
      data-turnstile-widget
    />
  )
}

/**
 * Hook to manage Turnstile verification state
 */
export function useTurnstile() {
  const tokenRef = useRef<string | null>(null)

  const handleVerify = useCallback((token: string) => {
    tokenRef.current = token
  }, [])

  const handleExpire = useCallback(() => {
    tokenRef.current = null
  }, [])

  const getToken = useCallback(() => {
    return tokenRef.current
  }, [])

  const clearToken = useCallback(() => {
    tokenRef.current = null
  }, [])

  return {
    handleVerify,
    handleExpire,
    getToken,
    clearToken,
  }
}
