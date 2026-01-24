'use client'

import { Gift, CreditCard, ShoppingBag, DollarSign, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Prize, PrizeType } from '@/types/database'

interface PrizeDisplayProps {
  prize: Prize
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

const PRIZE_TYPE_CONFIG: Record<PrizeType, { icon: typeof Gift; label: string; color: string }> = {
  gift_card: {
    icon: CreditCard,
    label: 'Gift Card',
    color: 'text-neon-blue',
  },
  merchandise: {
    icon: ShoppingBag,
    label: 'Merchandise',
    color: 'text-neon-pink',
  },
  cash: {
    icon: DollarSign,
    label: 'Cash',
    color: 'text-neon-green',
  },
  experience: {
    icon: Sparkles,
    label: 'Experience',
    color: 'text-neon-yellow',
  },
}

export function PrizeDisplay({
  prize,
  size = 'md',
  showValue = true,
  className,
}: PrizeDisplayProps) {
  const config = PRIZE_TYPE_CONFIG[prize.prize_type]
  const Icon = config.icon

  const sizeClasses = {
    sm: {
      container: 'p-3',
      icon: 'h-6 w-6',
      title: 'text-sm',
      description: 'text-xs',
      value: 'text-lg',
    },
    md: {
      container: 'p-4',
      icon: 'h-8 w-8',
      title: 'text-base',
      description: 'text-sm',
      value: 'text-xl',
    },
    lg: {
      container: 'p-6',
      icon: 'h-10 w-10',
      title: 'text-lg',
      description: 'text-base',
      value: 'text-2xl',
    },
  }

  const classes = sizeClasses[size]
  const valueDisplay = prize.value_cents >= 100
    ? `$${(prize.value_cents / 100).toFixed(0)}`
    : `${prize.value_cents}c`

  return (
    <div
      className={cn(
        'scoreboard-panel flex items-start gap-4',
        classes.container,
        className
      )}
    >
      {/* Prize Image or Icon */}
      <div className="flex-shrink-0">
        {prize.image_url ? (
          <img
            src={prize.image_url}
            alt={prize.name}
            className={cn(
              'rounded-md object-cover',
              size === 'sm' && 'h-12 w-12',
              size === 'md' && 'h-16 w-16',
              size === 'lg' && 'h-20 w-20'
            )}
          />
        ) : (
          <div
            className={cn(
              'rounded-md bg-background-tertiary flex items-center justify-center',
              size === 'sm' && 'h-12 w-12',
              size === 'md' && 'h-16 w-16',
              size === 'lg' && 'h-20 w-20'
            )}
          >
            <Icon className={cn(classes.icon, config.color)} />
          </div>
        )}
      </div>

      {/* Prize Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={cn('font-display font-bold text-foreground truncate', classes.title)}>
            {prize.name}
          </h3>
          <Badge variant="secondary" className="text-[10px]">
            {config.label}
          </Badge>
        </div>

        {prize.description && (
          <p className={cn('text-foreground-muted line-clamp-2', classes.description)}>
            {prize.description}
          </p>
        )}

        {prize.sponsor && (
          <p className={cn('text-foreground-subtle mt-1', classes.description)}>
            Sponsored by {prize.sponsor}
          </p>
        )}
      </div>

      {/* Value */}
      {showValue && (
        <div className="text-right">
          <p className={cn('score-led', classes.value)}>{valueDisplay}</p>
          <p className="text-[10px] text-foreground-subtle font-display uppercase">value</p>
        </div>
      )}
    </div>
  )
}

// Compact version for lists
interface PrizeChipProps {
  prize: Prize
}

export function PrizeChip({ prize }: PrizeChipProps) {
  const config = PRIZE_TYPE_CONFIG[prize.prize_type]
  const Icon = config.icon
  const valueDisplay = prize.value_cents >= 100
    ? `$${(prize.value_cents / 100).toFixed(0)}`
    : `${prize.value_cents}c`

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-background-tertiary rounded-full border-2 border-border">
      <Icon className={cn('h-4 w-4', config.color)} />
      <span className="font-display text-sm font-bold text-foreground">{prize.name}</span>
      <span className="text-xs text-foreground-subtle">({valueDisplay})</span>
    </div>
  )
}
