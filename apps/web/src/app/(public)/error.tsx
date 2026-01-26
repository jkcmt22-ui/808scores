'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { ErrorState } from '@/components/ui'

export default function PublicError({
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
        title="Page Error"
        message="This page encountered an error. Please try again or go back to the home page."
        onRetry={reset}
        showHomeButton
        showBackButton
      />
    </div>
  )
}
