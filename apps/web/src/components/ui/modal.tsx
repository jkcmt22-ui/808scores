'use client'

import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

/**
 * Accessible modal component with:
 * - Focus trapping
 * - Escape key to close
 * - ARIA attributes (dialog role, labelledby, describedby)
 * - Focus restoration on close
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const titleId = `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`
  const descId = description ? `modal-desc-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined

  // Store previously focused element and restore on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      // Focus the modal container on open
      setTimeout(() => {
        modalRef.current?.focus()
      }, 10)
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative w-full mx-4 bg-background border-2 border-border rounded-lg shadow-xl max-h-[85vh] flex flex-col',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-border">
          <h2
            id={titleId}
            className="font-display text-lg font-bold text-foreground uppercase tracking-wider"
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1 text-foreground-muted hover:text-foreground focus-ring rounded"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Description (optional, for screen readers) */}
        {description && (
          <p id={descId} className="sr-only">
            {description}
          </p>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  )
}

/**
 * Modal content wrapper
 */
export function ModalContent({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex-1 overflow-y-auto p-4', className)}>
      {children}
    </div>
  )
}

/**
 * Modal footer for action buttons
 */
export function ModalFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex gap-3 p-4 border-t-2 border-border', className)}>
      {children}
    </div>
  )
}
