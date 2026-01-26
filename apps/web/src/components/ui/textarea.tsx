import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'flex min-h-[80px] w-full border bg-background-secondary px-3 py-2 text-sm text-foreground transition-colors',
          'placeholder:text-foreground-subtle',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 focus:border-accent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-none',
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
Textarea.displayName = 'Textarea'

export { Textarea }
