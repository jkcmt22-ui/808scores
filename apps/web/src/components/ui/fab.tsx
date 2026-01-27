'use client'

import Link from 'next/link'
import { Plus, Camera, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FABProps {
  href: string
  label: string
  icon?: 'plus' | 'camera' | 'edit'
  variant?: 'primary' | 'success' | 'warning'
  className?: string
  showLabel?: boolean
}

export function FAB({
  href,
  label,
  icon = 'edit',
  variant = 'success',
  className,
  showLabel = true,
}: FABProps) {
  const Icon = icon === 'plus' ? Plus : icon === 'camera' ? Camera : Edit

  const variantStyles = {
    primary: {
      bg: 'bg-neon-pink',
      border: 'border-pink-400',
      text: 'text-black',
      shadow: '0 0 16px var(--neon-pink), 0 0 32px var(--neon-pink)',
    },
    success: {
      bg: 'bg-neon-green',
      border: 'border-green-700',
      text: 'text-black',
      shadow: '0 0 16px var(--neon-green), 0 0 32px var(--neon-green)',
    },
    warning: {
      bg: 'bg-neon-yellow',
      border: 'border-yellow-600',
      text: 'text-black',
      shadow: '0 0 16px var(--neon-yellow), 0 0 32px var(--neon-yellow)',
    },
  }

  const styles = variantStyles[variant]

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        'fixed bottom-24 right-4 z-50 flex items-center justify-center gap-2 rounded-lg border-2 transition-all active:scale-95 safe-bottom',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        styles.bg,
        styles.border,
        styles.text,
        showLabel ? 'h-12 px-4' : 'h-14 w-14',
        className
      )}
      style={{ boxShadow: styles.shadow }}
    >
      <Icon className={showLabel ? 'h-5 w-5' : 'h-6 w-6'} />
      {showLabel && (
        <span className="font-display text-xs font-bold uppercase tracking-wider">
          {label}
        </span>
      )}
    </Link>
  )
}

// Specialized Report Score FAB
interface ReportScoreFABProps {
  gameId: string
  className?: string
}

export function ReportScoreFAB({ gameId, className }: ReportScoreFABProps) {
  return (
    <FAB
      href={`/submit/${gameId}`}
      label="Report Score"
      icon="camera"
      variant="success"
      className={className}
    />
  )
}
