'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  messageId: string
  likeCount: number
  isLiked: boolean
  onToggleLike: (messageId: string) => Promise<void>
  disabled?: boolean
}

export function LikeButton({
  messageId,
  likeCount,
  isLiked,
  onToggleLike,
  disabled = false,
}: LikeButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    setIsAnimating(true)

    try {
      await onToggleLike(messageId)
    } finally {
      setIsLoading(false)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        'flex items-center gap-1 text-xs transition-all duration-200',
        'hover:text-neon-pink disabled:opacity-50 disabled:cursor-not-allowed',
        isLiked ? 'text-neon-pink' : 'text-foreground-subtle'
      )}
      title={isLiked ? 'Unlike' : 'Like'}
    >
      <Heart
        className={cn(
          'h-3.5 w-3.5 transition-all duration-200',
          isLiked && 'fill-current',
          isAnimating && 'scale-125'
        )}
        style={isLiked ? { filter: 'drop-shadow(0 0 4px var(--neon-pink))' } : undefined}
      />
      {likeCount > 0 && (
        <span className="font-mono">{likeCount}</span>
      )}
    </button>
  )
}
