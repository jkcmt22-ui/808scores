'use client'

import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type VerificationStatus = 'verified' | 'unverified' | 'pending' | 'none'

interface VerificationBadgeProps {
  isVerified: boolean
  verifiedAt?: string | null
  hasPendingSubmissions?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function VerificationBadge({
  isVerified,
  verifiedAt,
  hasPendingSubmissions = false,
  className,
  size = 'sm',
  showLabel = true,
}: VerificationBadgeProps) {
  // Determine verification status
  let status: VerificationStatus = 'none'
  if (hasPendingSubmissions) {
    status = 'pending'
  } else if (isVerified && verifiedAt) {
    status = 'verified'
  } else if (!isVerified) {
    status = 'unverified'
  }

  if (status === 'none') return null

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const statusConfig = {
    verified: {
      icon: CheckCircle,
      label: 'Verified',
      classes: 'bg-neon-green/20 text-neon-green border-neon-green/30',
    },
    unverified: {
      icon: AlertCircle,
      label: 'Unverified',
      classes: 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30',
    },
    pending: {
      icon: Clock,
      label: 'Pending',
      classes: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30 animate-pulse',
    },
    none: {
      icon: null,
      label: '',
      classes: '',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  if (!Icon) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono font-bold uppercase tracking-wider border rounded',
        sizeClasses[size],
        config.classes,
        className
      )}
      title={
        status === 'verified'
          ? `Verified${verifiedAt ? ` at ${new Date(verifiedAt).toLocaleString()}` : ''}`
          : status === 'unverified'
          ? 'Score not yet verified by trusted reporter'
          : 'Score update pending'
      }
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}

// Compact version for game cards
export function VerificationIcon({
  isVerified,
  verifiedAt,
  className,
}: {
  isVerified: boolean
  verifiedAt?: string | null
  className?: string
}) {
  if (isVerified && verifiedAt) {
    return (
      <span title="Verified score">
        <CheckCircle className={cn('h-4 w-4 text-neon-green', className)} />
      </span>
    )
  }

  return (
    <span title="Unverified score">
      <AlertCircle className={cn('h-4 w-4 text-neon-yellow', className)} />
    </span>
  )
}
