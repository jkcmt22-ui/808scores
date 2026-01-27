import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'default' | 'lg'
}

const sizeMap = {
  sm: { class: 'h-6 w-6 text-xs', pixels: 24 },
  default: { class: 'h-8 w-8 text-sm', pixels: 32 },
  lg: { class: 'h-12 w-12 text-base', pixels: 48 },
}

export function Avatar({ className, src, alt, fallback, size = 'default', ...props }: AvatarProps) {
  const { class: sizeClass, pixels } = sizeMap[size]
  const initials = fallback?.slice(0, 2).toUpperCase() || '?'

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden bg-background-tertiary font-medium text-foreground-muted',
        sizeClass,
        className
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || 'Avatar'}
          width={pixels}
          height={pixels}
          className="h-full w-full object-cover"
          unoptimized={!src.includes('supabase')}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
