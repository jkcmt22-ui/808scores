'use client'

import { useState } from 'react'
import { Flag, Reply } from 'lucide-react'
import { Avatar, Badge } from '@/components/ui'
import { LikeButton } from './like-button'
import { formatRelativeTime, cn } from '@/lib/utils'
import type { ChatMessageWithUser } from '@/types/database'

interface ChatMessageProps {
  message: ChatMessageWithUser
  currentUserId?: string
  isAuthenticated: boolean
  onReply: (message: ChatMessageWithUser) => void
  onReport: (messageId: string) => void
  onToggleLike: (messageId: string) => Promise<void>
  onScrollToMessage?: (messageId: string) => void
  isHighlighted?: boolean
}

// Helper to render content with highlighted mentions
function renderContentWithMentions(content: string) {
  // Match @username patterns
  const parts = content.split(/(@\w+)/g)

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return (
        <span
          key={index}
          className="text-neon-blue font-medium"
          style={{ textShadow: '0 0 8px var(--neon-blue)' }}
        >
          {part}
        </span>
      )
    }
    return part
  })
}

export function ChatMessageComponent({
  message,
  currentUserId,
  isAuthenticated,
  onReply,
  onReport,
  onToggleLike,
  onScrollToMessage,
  isHighlighted,
}: ChatMessageProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isOwnMessage = currentUserId === message.user_id
  const isGifMessage = message.message_type === 'gif' && message.gif_url

  const handleReplyClick = () => {
    if (message.reply_to?.id && onScrollToMessage) {
      onScrollToMessage(message.reply_to.id)
    }
  }

  return (
    <div
      className={cn(
        'group animate-fade-in transition-all duration-300',
        isHighlighted && 'bg-neon-blue/10 -mx-4 px-4 py-2 rounded-lg'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-message-id={message.id}
    >
      {/* Reply preview with visual threading */}
      {message.reply_to && (
        <div
          className={cn(
            'ml-10 mb-1 px-3 py-1.5 border-l-2 text-xs',
            'bg-background-tertiary/50 border-foreground-subtle/30',
            onScrollToMessage && 'cursor-pointer hover:border-neon-blue hover:bg-background-tertiary/80 transition-colors'
          )}
          onClick={handleReplyClick}
          role={onScrollToMessage ? 'button' : undefined}
          tabIndex={onScrollToMessage ? 0 : undefined}
          onKeyDown={(e) => {
            if (onScrollToMessage && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              handleReplyClick()
            }
          }}
          aria-label={onScrollToMessage ? 'Click to scroll to original message' : undefined}
        >
          <div className="flex items-center gap-2">
            {/* Mini avatar for reply */}
            <div className="h-4 w-4 rounded-full bg-background-tertiary flex items-center justify-center text-[8px] font-medium flex-shrink-0">
              {message.reply_to.user?.display_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-neon-blue font-medium">
              @{message.reply_to.user?.display_name || 'User'}
            </span>
          </div>
          <span className="text-foreground-subtle mt-0.5 block truncate">
            {message.reply_to.content.substring(0, 80)}{message.reply_to.content.length > 80 ? '...' : ''}
          </span>
        </div>
      )}

      <div className="flex gap-3">
        <Avatar
          fallback={message.user?.display_name || 'U'}
          src={message.user?.avatar_url}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground truncate">
              {message.user?.display_name || 'User'}
            </span>
            {message.user?.is_trusted_reporter && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                Trusted
              </Badge>
            )}
            <span className="text-xs text-foreground-subtle">
              {formatRelativeTime(message.created_at)}
            </span>
          </div>

          {/* Content - GIF or Text */}
          {isGifMessage ? (
            <div className="mt-1.5 max-w-[280px]">
              <img
                src={message.gif_url!}
                alt="GIF"
                className="rounded-lg border border-border max-h-[200px] w-auto"
                loading="lazy"
              />
              <span className="text-[10px] text-foreground-subtle font-mono block mt-1">
                via GIPHY
              </span>
            </div>
          ) : (
            <p className="text-sm text-foreground-muted mt-0.5 break-words">
              {renderContentWithMentions(message.content)}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-1.5">
            <LikeButton
              messageId={message.id}
              likeCount={message.like_count}
              isLiked={message.user_has_liked || false}
              onToggleLike={onToggleLike}
              disabled={!isAuthenticated}
            />

            {isAuthenticated && (
              <button
                onClick={() => onReply(message)}
                aria-label={`Reply to ${message.user?.display_name || 'User'}`}
                className="flex items-center gap-1 text-xs text-foreground-subtle hover:text-neon-blue transition-colors min-h-[44px] px-2"
              >
                <Reply className="h-3.5 w-3.5" />
                <span className="font-mono">Reply</span>
              </button>
            )}
          </div>
        </div>

        {/* Report button */}
        {isAuthenticated && !isOwnMessage && (
          <button
            onClick={() => onReport(message.id)}
            aria-label="Report message"
            className={cn(
              'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground-subtle hover:text-destructive transition-opacity',
              isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0'
            )}
          >
            <Flag className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
