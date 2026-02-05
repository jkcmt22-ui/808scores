'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  text: string
  duration: number
}

interface ToastContextType {
  toast: (options: { type: ToastType; text: string; duration?: number }) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let toastCounter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ type, text, duration }: { type: ToastType; text: string; duration?: number }) => {
      const id = `toast-${++toastCounter}`
      const defaultDuration = type === 'error' ? 8000 : 4000
      setToasts((prev) => [...prev, { id, type, text, duration: duration ?? defaultDuration }])
    },
    []
  )

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast container - fixed bottom-right */}
      <div className="fixed bottom-20 right-4 z-[100] flex flex-col-reverse gap-2 max-w-sm w-full pointer-events-none lg:bottom-4">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, toast.duration)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  const Icon = toast.type === 'success' ? CheckCircle : toast.type === 'error' ? AlertCircle : Info

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-3 border-2 text-sm animate-in slide-in-from-right-full duration-200',
        toast.type === 'success' && 'bg-neon-green/10 border-neon-green/30 text-neon-green',
        toast.type === 'error' && 'bg-neon-pink/10 border-neon-pink/30 text-neon-pink',
        toast.type === 'info' && 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue'
      )}
      role="status"
      aria-live="polite"
    >
      <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <span className="flex-1 font-display text-xs uppercase tracking-wider">{toast.text}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-0.5 hover:opacity-70 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
