'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { ErrorState } from '@/components/ui'

export default function LiveError({
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
        title="Live Scores Error"
        message="Unable to load live scores. Please check your connection and try again."
        onRetry={reset}
        showHomeButton
      />
    </div>
  )
}
