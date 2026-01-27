'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, X, AlertCircle } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { ChatMessageSkeleton } from '@/components/ui/skeleton'
import { ChatMessageComponent } from './chat-message'
import { MentionInput } from './mention-input'
import { createClient } from '@/lib/supabase/client'
import { useAuth, useChatLikes } from '@/hooks'
// formatRelativeTime moved to ChatMessage component
import { validateMessage, recordMessage } from '@/lib/content-filter'
import { isValidGifUrl } from '@808scores/shared'
import { awardChatPoints } from '@/lib/points/chat-points'
import Link from 'next/link'
import type { ChatMessageWithUser } from '@/types/database'

interface MentionUser {
  id: string
  display_name: string | null
  avatar_url: string | null
}

interface GameChatProps {
  gameId: string
}

export function GameChat({ gameId }: GameChatProps) {
  const { user, isAuthenticated } = useAuth()
  const [messages, setMessages] = useState<ChatMessageWithUser[]>([])
  const [chatUsers, setChatUsers] = useState<MentionUser[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [mentions, setMentions] = useState<string[]>([])
  const [replyingTo, setReplyingTo] = useState<ChatMessageWithUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastMessageTime, setLastMessageTime] = useState<number>(0)
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()!

  // Chat likes hook
  const { likedMessageIds, toggleLike } = useChatLikes({
    gameId,
    userId: user?.id,
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToMessage = useCallback((messageId: string) => {
    const container = messagesContainerRef.current
    if (!container) return

    const messageElement = container.querySelector(`[data-message-id="${messageId}"]`)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedMessageId(messageId)
    }
  }, [])

  // Cleanup highlighted message timeout
  useEffect(() => {
    if (highlightedMessageId) {
      const timeoutId = setTimeout(() => setHighlightedMessageId(null), 2000)
      return () => clearTimeout(timeoutId)
    }
  }, [highlightedMessageId])

  const fetchMessages = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('chat_messages')
      .select(`
        *,
        user:users(id, display_name, avatar_url, tier, is_trusted_reporter, is_admin, is_super_admin),
        reply_to:chat_messages!reply_to_id(
          id,
          content,
          user:users(display_name)
        )
      `)
      .eq('game_id', gameId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true })
      .limit(100)

    if (fetchError) {
      console.error('Error fetching messages:', fetchError)
      return
    }

    // Process messages to add user_has_liked flag
    const rawMessages = data || []
    const processedMessages = rawMessages.map((msg) => {
      const message = msg as unknown as ChatMessageWithUser
      return {
        ...message,
        user_has_liked: likedMessageIds.has(message.id),
      }
    })

    setMessages(processedMessages)

    // Extract unique users for @mention suggestions
    const users = new Map<string, MentionUser>()
    for (const msg of processedMessages) {
      if (msg.user && !users.has(msg.user.id)) {
        users.set(msg.user.id, {
          id: msg.user.id,
          display_name: msg.user.display_name,
          avatar_url: msg.user.avatar_url,
        })
      }
    }
    setChatUsers(Array.from(users.values()))

    setIsLoading(false)
  }, [supabase, gameId, likedMessageIds])

  useEffect(() => {
    fetchMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `game_id=eq.${gameId}`,
        },
        async (payload) => {
          // Use payload data directly, only fetch user data if not cached
          const newMessage = payload.new as any

          if (newMessage.is_hidden) return

          // Check if we already have this user's data cached
          const cachedUser = chatUsers.find(u => u.id === newMessage.user_id)

          let userData = cachedUser
          if (!cachedUser) {
            // Only fetch user data if we don't have it
            const { data: userResult } = await supabase
              .from('users')
              .select('id, display_name, avatar_url, tier, is_trusted_reporter, is_admin, is_super_admin')
              .eq('id', newMessage.user_id)
              .single()

            userData = userResult

            // Add to cached users
            if (userData) {
              setChatUsers((prev) => [...prev, {
                id: userData.id,
                display_name: userData.display_name,
                avatar_url: userData.avatar_url,
              }])
            }
          }

          // Construct message with cached/fetched user data
          const msg: ChatMessageWithUser = {
            ...newMessage,
            user: userData,
            user_has_liked: false,
            reply_to: null, // Reply data would need separate fetch if present
          }

          setMessages((prev) => [...prev, msg])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const updated = payload.new as { id: string; is_hidden: boolean; like_count: number }
          // Hide message if it was flagged
          if (updated.is_hidden) {
            setMessages((prev) => prev.filter((m) => m.id !== updated.id))
          } else {
            // Update like count
            setMessages((prev) =>
              prev.map((m) =>
                m.id === updated.id ? { ...m, like_count: updated.like_count } : m
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, gameId, fetchMessages])

  // Update user_has_liked when likedMessageIds changes
  useEffect(() => {
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        user_has_liked: likedMessageIds.has(msg.id),
      }))
    )
  }, [likedMessageIds])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleInputChange = (value: string, newMentions: string[]) => {
    setNewMessage(value)
    setMentions(newMentions)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return

    // Comprehensive validation (profanity, spam, rate limiting, length)
    const validation = validateMessage(newMessage, user.id)
    if (!validation.valid) {
      setError(validation.error || 'Message not allowed')
      return
    }

    // Additional rate limit - 3 seconds between messages
    const now = Date.now()
    if (now - lastMessageTime < 3000) {
      setError('Please wait a moment before sending another message')
      return
    }

    setIsSending(true)
    setError(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: sendError } = await (supabase as any)
      .from('chat_messages')
      .insert({
        game_id: gameId,
        user_id: user.id,
        content: newMessage.trim(),
        reply_to_id: replyingTo?.id || null,
        mentions: mentions,
        message_type: 'text',
      })
      .select()
      .single()

    if (sendError) {
      console.error('Error sending message:', sendError)
      setError('Failed to send message')
    } else {
      setNewMessage('')
      setMentions([])
      setReplyingTo(null)
      setLastMessageTime(now)
      // Record for rate limiting
      recordMessage(user.id)

      // Award points for sending a comment
      await awardChatPoints(user.id, 'comment', data?.id)

      // Award points for mentioned users
      for (const mentionedUserId of mentions) {
        if (mentionedUserId !== user.id) {
          await awardChatPoints(mentionedUserId, 'mention_received', data?.id)
        }
      }
    }

    setIsSending(false)
  }

  const handleSendGif = async (gif: { id: string; url: string }) => {
    if (!user || isSending) return

    // SECURITY: Validate GIF URL is from allowed domain
    if (!isValidGifUrl(gif.url)) {
      setError('Invalid GIF URL: only GIPHY images are allowed')
      return
    }

    // Rate limit - 3 seconds between messages
    const now = Date.now()
    if (now - lastMessageTime < 3000) {
      setError('Please wait a moment before sending another message')
      return
    }

    setIsSending(true)
    setError(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: sendError } = await (supabase as any)
      .from('chat_messages')
      .insert({
        game_id: gameId,
        user_id: user.id,
        content: '', // GIF messages have empty content
        gif_url: gif.url,
        gif_id: gif.id,
        message_type: 'gif',
        reply_to_id: replyingTo?.id || null,
        mentions: [],
      })
      .select()
      .single()

    if (sendError) {
      console.error('Error sending GIF:', sendError)
      setError('Failed to send GIF')
    } else {
      setReplyingTo(null)
      setLastMessageTime(now)
      recordMessage(user.id)

      // Award points for sending a GIF (counts as comment)
      await awardChatPoints(user.id, 'comment', data?.id)
    }

    setIsSending(false)
  }

  const handleReport = async (messageId: string) => {
    if (!user) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: reportError } = await (supabase as any)
      .from('chat_reports')
      .insert({
        message_id: messageId,
        reported_by: user.id,
      })

    if (reportError) {
      if (reportError.code === '23505') {
        setError('You already reported this message')
      } else {
        console.error('Error reporting:', reportError)
      }
    }
  }

  const handleToggleLike = async (messageId: string) => {
    if (!user) return

    const wasLiked = likedMessageIds.has(messageId)
    await toggleLike(messageId)

    // Award points if it's a new like (not unlinking)
    if (!wasLiked) {
      const message = messages.find((m) => m.id === messageId)
      if (message && message.user_id !== user.id) {
        await awardChatPoints(message.user_id, 'like_received', messageId)
      }
    }
  }

  const handleReply = (message: ChatMessageWithUser) => {
    setReplyingTo(message)
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  return (
    <div className="flex flex-col h-[400px] scoreboard-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-border px-4 py-3">
        <h3 className="font-mono text-sm font-bold text-score-amber uppercase tracking-wider">
          Game Chat
        </h3>
        <Badge variant="secondary" className="font-mono">
          {messages.length}
        </Badge>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {isLoading ? (
          <>
            <ChatMessageSkeleton />
            <ChatMessageSkeleton />
            <ChatMessageSkeleton />
          </>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="font-mono text-foreground-muted text-sm">No messages yet</p>
            <p className="text-foreground-subtle text-xs mt-1">Be the first to chat!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageComponent
              key={msg.id}
              message={msg}
              currentUserId={user?.id}
              isAuthenticated={isAuthenticated}
              onReply={handleReply}
              onReport={handleReport}
              onToggleLike={handleToggleLike}
              onScrollToMessage={scrollToMessage}
              isHighlighted={highlightedMessageId === msg.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="px-4 py-2 bg-destructive/10 text-destructive text-xs flex items-center gap-2"
        >
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-xs underline" aria-label="Dismiss error">
            Dismiss
          </button>
        </div>
      )}

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-background-tertiary border-t-2 border-border flex items-center gap-2">
          <span className="text-xs text-foreground-muted flex-1 truncate">
            Replying to <span className="text-neon-blue">@{replyingTo.user?.display_name || 'User'}</span>
            : {replyingTo.message_type === 'gif' ? '[GIF]' : replyingTo.content.substring(0, 40)}...
          </span>
          <button
            onClick={cancelReply}
            aria-label="Cancel reply"
            className="p-1 hover:bg-background-secondary rounded"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Input */}
      {isAuthenticated ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="border-t-2 border-border p-3 bg-background-tertiary"
        >
          <div className="flex gap-2">
            <MentionInput
              value={newMessage}
              onChange={handleInputChange}
              users={chatUsers.filter((u) => u.id !== user?.id)}
              placeholder={replyingTo ? 'Write your reply...' : 'Type a message...'}
              maxLength={280}
              disabled={isSending}
              onSubmit={handleSendMessage}
              onGifSelect={handleSendGif}
              showGifButton={true}
              showEmojiButton={true}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newMessage.trim() || isSending}
              loading={isSending}
              aria-label="Send message"
            >
              {!isSending && <Send className="h-4 w-4" aria-hidden="true" />}
            </Button>
          </div>
          <p className="font-mono text-xs text-foreground-subtle mt-1.5">
            {newMessage.length}/280 {mentions.length > 0 && `| ${mentions.length} mention${mentions.length > 1 ? 's' : ''}`}
          </p>
        </form>
      ) : (
        <div className="border-t-2 border-border p-4 text-center bg-background-tertiary">
          <p className="font-mono text-sm text-foreground-muted mb-2">
            Sign in to join the chat
          </p>
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
