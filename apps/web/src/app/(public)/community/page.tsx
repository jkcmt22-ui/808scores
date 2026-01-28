'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, Heart, Reply, Flag, Trash2, ChevronUp, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useGeneralChat, type GeneralChatMessage } from '@/hooks/use-general-chat'
import { Avatar, Badge, Button, Input } from '@/components/ui'
import { formatRelativeTime, cn } from '@/lib/utils'
import Link from 'next/link'

function MessageItem({
  message,
  currentUserId,
  isAuthenticated,
  onReply,
  onReport,
  onDelete,
  onToggleLike,
}: {
  message: GeneralChatMessage
  currentUserId?: string
  isAuthenticated: boolean
  onReply: (message: GeneralChatMessage) => void
  onReport: (messageId: string) => void
  onDelete?: (messageId: string) => void
  onToggleLike: (messageId: string) => Promise<void>
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const isOwnMessage = currentUserId === message.user_id

  const handleDelete = async () => {
    if (!onDelete) return

    if (window.confirm('Delete this message? This cannot be undone.')) {
      setIsDeleting(true)
      try {
        await onDelete(message.id)
      } catch (err) {
        console.error('Failed to delete message:', err)
        setIsDeleting(false)
      }
    }
  }

  // Helper to render content with highlighted mentions
  const renderContentWithMentions = (content: string) => {
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

  return (
    <div
      className="group animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Reply preview */}
      {message.reply_to && (
        <div className="ml-10 mb-1 px-3 py-1.5 bg-background-tertiary/50 border-l-2 border-foreground-subtle/30 text-xs text-foreground-subtle">
          <span className="text-foreground-muted">Replying to </span>
          <span className="text-neon-blue">@{message.reply_to.user?.display_name || 'User'}</span>
          <span className="text-foreground-subtle">: </span>
          <span className="truncate">{message.reply_to.content.substring(0, 50)}{message.reply_to.content.length > 50 ? '...' : ''}</span>
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

          {/* Content */}
          <p className="text-sm text-foreground-muted mt-0.5 break-words">
            {renderContentWithMentions(message.content)}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-1.5">
            <button
              onClick={() => onToggleLike(message.id)}
              disabled={!isAuthenticated}
              className={cn(
                'flex items-center gap-1 text-xs transition-colors min-h-[44px] px-2',
                message.user_has_liked
                  ? 'text-neon-pink'
                  : 'text-foreground-subtle hover:text-neon-pink',
                !isAuthenticated && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Heart
                className={cn('h-3.5 w-3.5', message.user_has_liked && 'fill-current')}
              />
              <span className="font-mono">{message.like_count || ''}</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => onReply(message)}
                className="flex items-center gap-1 text-xs text-foreground-subtle hover:text-neon-blue transition-colors min-h-[44px] px-2"
              >
                <Reply className="h-3.5 w-3.5" />
                <span className="font-mono">Reply</span>
              </button>
            )}
          </div>
        </div>

        {/* Delete button (own messages only) */}
        {isAuthenticated && isOwnMessage && onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete message"
            className={cn(
              'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground-subtle hover:text-destructive transition-opacity disabled:opacity-50',
              isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0'
            )}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        {/* Report button (other users' messages only) */}
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

export default function CommunityPage() {
  const { user, isLoading: authLoading } = useAuth()
  const {
    messages,
    isLoading,
    sendMessage,
    toggleLike,
    reportMessage,
    deleteMessage,
    loadMore,
    hasMore,
    isSending,
  } = useGeneralChat(user)

  const [inputText, setInputText] = useState('')
  const [replyingTo, setReplyingTo] = useState<GeneralChatMessage | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages.length])

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return

    const text = inputText
    setInputText('')
    const replyId = replyingTo?.id || null
    setReplyingTo(null)

    const success = await sendMessage(text, replyId)
    if (!success) {
      setInputText(text)
    }
  }

  const handleReply = (message: GeneralChatMessage) => {
    setReplyingTo(message)
    inputRef.current?.focus()
  }

  const handleReport = async (messageId: string) => {
    if (window.confirm('Report this message for inappropriate content?')) {
      await reportMessage(messageId)
    }
  }

  const handleDelete = async (messageId: string) => {
    await deleteMessage(messageId)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape' && replyingTo) {
      setReplyingTo(null)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b-2 border-neon-pink bg-background-secondary">
        <div className="flex items-center gap-3">
          <div
            className="p-2 border-2 border-neon-blue bg-background-tertiary"
            style={{ boxShadow: '0 0 10px var(--neon-blue)' }}
          >
            <MessageSquare className="h-5 w-5 text-neon-blue" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-wider text-foreground">
              COMMUNITY
            </h1>
            <p className="text-xs text-foreground-muted">
              Hawaii High School Sports Talk
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Load more button */}
        {hasMore && !isLoading && (
          <button
            onClick={loadMore}
            className="w-full py-2 text-xs text-foreground-muted hover:text-neon-blue border border-border hover:border-neon-blue transition-colors flex items-center justify-center gap-2"
          >
            <ChevronUp className="h-4 w-4" />
            Load older messages
          </button>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-neon-pink border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-foreground-muted tracking-wider">LOADING...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className="p-4 border-2 border-neon-blue bg-background-secondary mb-4"
              style={{ boxShadow: '0 0 20px var(--neon-blue)' }}
            >
              <MessageSquare className="h-10 w-10 text-neon-blue" />
            </div>
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground mb-2">
              WELCOME TO THE COMMUNITY
            </h2>
            <p className="text-sm text-foreground-muted max-w-sm">
              This is the general chat for all Hawaii high school sports fans.
            </p>
            <p className="text-sm text-neon-yellow mt-4 font-medium">
              Be the first to start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              currentUserId={user?.id}
              isAuthenticated={!!user}
              onReply={handleReply}
              onReport={handleReport}
              onDelete={handleDelete}
              onToggleLike={toggleLike}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t-2 border-border bg-background-secondary p-4">
        {/* Replying to indicator */}
        {replyingTo && (
          <div className="mb-2 px-3 py-2 bg-background-tertiary border-l-2 border-neon-blue text-sm flex items-center justify-between">
            <span>
              <span className="text-foreground-muted">Replying to </span>
              <span className="text-neon-blue font-medium">@{replyingTo.user?.display_name || 'User'}</span>
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-foreground-subtle hover:text-foreground"
            >
              &times;
            </button>
          </div>
        )}

        {user ? (
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say something..."
              maxLength={500}
              className="flex-1"
              disabled={isSending}
            />
            <Button
              onClick={handleSend}
              disabled={!inputText.trim() || isSending}
              className="px-4"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <Link href="/login">
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-neon-blue hover:text-neon-pink transition-colors cursor-pointer">
              <LogIn className="h-4 w-4" />
              <span className="font-medium tracking-wider">SIGN IN TO JOIN THE CONVERSATION</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
