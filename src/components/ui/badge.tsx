import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'live' | 'outline'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium transition-colors',
        {
          'bg-accent/10 text-accent': variant === 'default',
          'bg-background-tertiary text-foreground-muted': variant === 'secondary',
          'bg-success/10 text-success': variant === 'success',
          'bg-warning/10 text-warning': variant === 'warning',
          'bg-destructive/10 text-destructive': variant === 'destructive',
          'bg-live text-white animate-live-pulse': variant === 'live',
          'border border-border text-foreground-muted': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}
