'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { ErrorState } from '@/components/ui'

export default function TournamentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <ErrorState
        title="Tournament Error"
        message="Unable to load this tournament. Please try again."
        onRetry={reset}
        showHomeButton
        showBackButton
      />
    </div>
  )
}
