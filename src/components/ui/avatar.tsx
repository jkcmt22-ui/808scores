import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'default' | 'lg'
}

export function Avatar({ className, src, alt, fallback, size = 'default', ...props }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    default: 'h-8 w-8 text-sm',
    lg: 'h-12 w-12 text-base',
  }

  const initials = fallback?.slice(0, 2).toUpperCase() || '?'

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden bg-background-tertiary font-medium text-foreground-muted',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
