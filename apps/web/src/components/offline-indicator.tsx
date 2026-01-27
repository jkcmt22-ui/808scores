'use client'

import { useEffect, useState } from 'react'
import { WifiOff, CloudOff, Cloud, Loader2 } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { cn } from '@/lib/utils'

interface OfflineIndicatorProps {
  className?: string
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { isOnline, pendingCount } = useOnlineStatus()
  const [visible, setVisible] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Show indicator when offline or when there are pending items
  useEffect(() => {
    if (!isOnline || pendingCount > 0) {
      setVisible(true)
    } else {
      // Delay hiding to show "back online" message briefly
      const timer = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, pendingCount])

  // Simulate syncing state when coming back online with pending items
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      setSyncing(true)
      const timer = setTimeout(() => setSyncing(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, pendingCount])

  if (!visible) return null

  return (
    <div
      className={cn(
        'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 rounded-full px-4 py-2 shadow-lg',
          !isOnline
            ? 'bg-neon-pink text-white'
            : syncing
              ? 'bg-neon-yellow text-background'
              : 'bg-neon-green text-background'
        )}
      >
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">
              You&apos;re offline
              {pendingCount > 0 && (
                <span className="ml-1">
                  ({pendingCount} pending)
                </span>
              )}
            </span>
          </>
        ) : syncing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">
              Syncing {pendingCount} item{pendingCount !== 1 ? 's' : ''}...
            </span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <CloudOff className="h-4 w-4" />
            <span className="text-sm font-medium">
              {pendingCount} pending sync
            </span>
          </>
        ) : (
          <>
            <Cloud className="h-4 w-4" />
            <span className="text-sm font-medium">Back online</span>
          </>
        )}
      </div>
    </div>
  )
}
