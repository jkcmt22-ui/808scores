'use client'

import { useState } from 'react'
import { CloudOff, RefreshCw, Trash2, ChevronDown, ChevronUp, Loader2, Wifi } from 'lucide-react'
import { useOfflineQueue } from '@/hooks'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export function PendingSubmissionsBanner() {
  const { pendingCount, isOnline, isSyncing, syncAll } = useOfflineQueue()
  const [expanded, setExpanded] = useState(false)

  // Don't show if no pending submissions
  if (pendingCount === 0) return null

  return (
    <div className="border-b-2 border-neon-yellow/30 bg-neon-yellow/10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2"
      >
        <div className="flex items-center gap-2">
          <CloudOff className="h-4 w-4 text-neon-yellow" />
          <span className="text-sm font-display text-neon-yellow">
            {pendingCount} pending submission{pendingCount !== 1 ? 's' : ''}
          </span>
          {!isOnline && (
            <span className="text-xs text-foreground-muted">(offline)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOnline && !isSyncing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                syncAll()
              }}
              className="h-7 px-2 text-neon-yellow hover:text-neon-yellow hover:bg-neon-yellow/20"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync
            </Button>
          )}
          {isSyncing && (
            <Loader2 className="h-4 w-4 animate-spin text-neon-yellow" />
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-foreground-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-foreground-muted" />
          )}
        </div>
      </button>

      {expanded && <PendingSubmissionsList />}
    </div>
  )
}

function PendingSubmissionsList() {
  const { pendingSubmissions, removePending, isOnline } = useOfflineQueue()

  if (pendingSubmissions.length === 0) {
    return (
      <div className="px-4 py-3 text-center text-sm text-foreground-muted">
        No pending submissions
      </div>
    )
  }

  return (
    <div className="border-t border-neon-yellow/20">
      {pendingSubmissions.map((submission) => (
        <div
          key={submission.id}
          className="flex items-center justify-between px-4 py-2 border-b border-neon-yellow/10 last:border-b-0"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display text-foreground truncate">
              {submission.gameName}
            </p>
            <p className="text-xs text-foreground-muted">
              {submission.awayScore} - {submission.homeScore}
              {submission.submissionType === 'final_score' ? ' (Final)' : ` (${submission.period})`}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span
              className={cn(
                'text-xs px-2 py-0.5',
                submission.status === 'pending' && 'bg-neon-yellow/20 text-neon-yellow',
                submission.status === 'syncing' && 'bg-neon-blue/20 text-neon-blue',
                submission.status === 'failed' && 'bg-neon-pink/20 text-neon-pink'
              )}
            >
              {submission.status === 'pending' && 'Pending'}
              {submission.status === 'syncing' && 'Syncing...'}
              {submission.status === 'failed' && 'Failed'}
            </span>
            <button
              onClick={() => removePending(submission.id)}
              className="p-1 text-foreground-muted hover:text-neon-pink transition-colors"
              title="Remove"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Small indicator for the header
export function PendingIndicator() {
  const { pendingCount, isOnline, isSyncing, syncAll } = useOfflineQueue()

  if (pendingCount === 0) return null

  return (
    <button
      onClick={isOnline && !isSyncing ? syncAll : undefined}
      className={cn(
        'relative flex items-center gap-1 px-2 py-1 text-xs font-display rounded',
        isOnline
          ? 'bg-neon-yellow/20 text-neon-yellow hover:bg-neon-yellow/30'
          : 'bg-foreground-muted/20 text-foreground-muted'
      )}
      title={isOnline ? 'Click to sync pending submissions' : 'Offline - will sync when online'}
    >
      {isSyncing ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isOnline ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <CloudOff className="h-3 w-3" />
      )}
      <span>{pendingCount}</span>
    </button>
  )
}
