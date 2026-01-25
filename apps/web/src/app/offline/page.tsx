'use client'

import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-center">
      <div className="scoreboard-panel p-8 mb-6">
        <div
          className="flex h-20 w-20 items-center justify-center mx-auto mb-4"
          style={{ boxShadow: '0 0 20px rgba(5, 217, 232, 0.3)' }}
        >
          <WifiOff className="h-12 w-12 text-neon-blue" />
        </div>
        <div className="score-led text-4xl mb-4 text-foreground-muted">--</div>
      </div>

      <h1 className="font-display text-2xl font-bold text-foreground uppercase tracking-wider mb-3">
        You&apos;re Offline
      </h1>

      <p className="text-foreground-muted max-w-xs mb-6 font-display text-sm">
        Check your internet connection and try again. Live scores will be back when you reconnect.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 px-6 py-3 bg-neon-pink text-black font-display font-bold uppercase tracking-wider transition-all active:scale-95"
        style={{ boxShadow: '0 0 15px var(--neon-pink)' }}
      >
        <RefreshCw className="h-5 w-5" />
        Try Again
      </button>

      <p className="mt-8 text-foreground-subtle text-xs font-display">
        Hawaii Sports Center
      </p>
    </div>
  )
}
