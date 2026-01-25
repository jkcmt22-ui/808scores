'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, children, disabled, ...props }, ref) => {
    const getStyle = () => {
      if (variant === 'default') {
        return { boxShadow: '0 0 15px var(--neon-pink), 0 0 30px var(--neon-pink)' }
      }
      if (variant === 'destructive') {
        return { boxShadow: '0 0 10px var(--neon-pink)' }
      }
      return undefined
    }

    return (
      <button
        className={cn(
          'relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-bold uppercase tracking-widest transition-all duration-150 focus-ring disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-neon-pink text-black border-2 border-pink-400 hover:brightness-110 active:scale-95': variant === 'default',
            'bg-background-secondary text-foreground border-2 border-border hover:border-neon-blue hover:text-neon-blue active:scale-95':
              variant === 'secondary',
            'border-2 border-border bg-transparent text-foreground hover:border-neon-pink hover:text-neon-pink active:scale-95':
              variant === 'outline',
            'bg-transparent text-foreground-muted hover:text-neon-blue hover:bg-background-secondary':
              variant === 'ghost',
            'bg-neon-pink/20 text-neon-pink border-2 border-neon-pink hover:bg-neon-pink hover:text-black active:scale-95':
              variant === 'destructive',
          },
          {
            'h-11 px-5 text-xs': size === 'default',
            'h-10 px-4 text-xs': size === 'sm',
            'h-12 px-6 text-sm': size === 'lg',
            'h-11 w-11 p-0': size === 'icon',
          },
          className
        )}
        style={getStyle()}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
