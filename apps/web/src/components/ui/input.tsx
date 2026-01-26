import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'flex h-10 w-full border bg-background-secondary px-3 py-2 text-sm text-foreground transition-colors',
          'placeholder:text-foreground-subtle',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 focus:border-accent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-destructive focus:ring-destructive'
            : 'border-border hover:border-border-hover',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
