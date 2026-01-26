'use client'

import { Component, ReactNode } from 'react'
import { ErrorState } from '@/components/ui'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  // For section-specific error messages
  title?: string
  message?: string
  showRetry?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to console in development
    console.error('[ErrorBoundary] Caught error:', error)
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <ErrorState
          title={this.props.title || 'Something went wrong'}
          message={this.props.message || 'This section encountered an error. Try refreshing.'}
          onRetry={this.props.showRetry !== false ? this.handleRetry : undefined}
        />
      )
    }

    return this.props.children
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}

// Pre-configured boundaries for specific sections
export function GameSectionBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      title="Game Error"
      message="Unable to load game data. Please try again."
    >
      {children}
    </ErrorBoundary>
  )
}

export function ChatBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      title="Chat Error"
      message="Chat encountered an error. Messages may not load properly."
    >
      {children}
    </ErrorBoundary>
  )
}

export function ScoreboardBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      title="Scoreboard Error"
      message="Unable to display scores. Please refresh the page."
    >
      {children}
    </ErrorBoundary>
  )
}
