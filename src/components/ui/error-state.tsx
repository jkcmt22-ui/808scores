'use client'

import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from './button'
import Link from 'next/link'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  showHomeButton?: boolean
  showBackButton?: boolean
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error. Please try again.',
  onRetry,
  showHomeButton = false,
  showBackButton = false,
  className,
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className || ''}`}>
      <div className="scoreboard-panel p-6 mb-6">
        <div
          className="flex h-16 w-16 items-center justify-center mx-auto mb-4"
          style={{ boxShadow: '0 0 20px rgba(255, 42, 109, 0.3)' }}
        >
          <AlertCircle className="h-12 w-12 text-neon-pink" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground uppercase tracking-wider mb-2">
          {title}
        </h3>
        <p className="text-sm text-foreground-muted max-w-xs mx-auto font-display">
          {message}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        {showBackButton && (
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        )}
        {showHomeButton && (
          <Link href="/">
            <Button variant="secondary">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

// Pre-configured error states for common scenarios
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Connection Lost"
      message="Please check your internet connection and try again."
      onRetry={onRetry}
    />
  )
}

export function NotFoundError() {
  return (
    <ErrorState
      title="Not Found"
      message="The page or content you're looking for doesn't exist."
      showHomeButton
      showBackButton
    />
  )
}

export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Server Error"
      message="Our servers are having trouble right now. Please try again later."
      onRetry={onRetry}
      showHomeButton
    />
  )
}
