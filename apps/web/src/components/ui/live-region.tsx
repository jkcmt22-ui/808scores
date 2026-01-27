'use client'

import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'

interface LiveRegionContextValue {
  announce: (message: string, politeness?: 'polite' | 'assertive') => void
}

const LiveRegionContext = createContext<LiveRegionContextValue | null>(null)

/**
 * Hook to access the live region announcer
 * Use this to announce changes to screen readers
 */
export function useLiveRegion() {
  const context = useContext(LiveRegionContext)
  if (!context) {
    throw new Error('useLiveRegion must be used within a LiveRegionProvider')
  }
  return context
}

interface LiveRegionProviderProps {
  children: ReactNode
}

/**
 * Provider component that renders ARIA live regions for screen reader announcements
 * Wrap your app with this provider to enable screen reader announcements
 */
export function LiveRegionProvider({ children }: LiveRegionProviderProps) {
  const [politeMessage, setPoliteMessage] = useState('')
  const [assertiveMessage, setAssertiveMessage] = useState('')

  const announce = useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    if (politeness === 'assertive') {
      // Clear and set to trigger announcement
      setAssertiveMessage('')
      setTimeout(() => setAssertiveMessage(message), 50)
    } else {
      setPoliteMessage('')
      setTimeout(() => setPoliteMessage(message), 50)
    }
  }, [])

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      {/* Polite announcements - read after current speech */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      {/* Assertive announcements - interrupt current speech */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  )
}

/**
 * Simple status message component that announces to screen readers
 */
export function StatusMessage({
  children,
  politeness = 'polite',
}: {
  children: ReactNode
  politeness?: 'polite' | 'assertive'
}) {
  return (
    <div
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic="true"
    >
      {children}
    </div>
  )
}
