'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Flag, AlertCircle } from 'lucide-react'
import { Button, Input, Avatar, Badge } from '@/components/ui'
import { ChatMessageSkeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import type { ChatMessage as ChatMessageDB } from '@/types/database'

// Profanity filter - basic word list (expand as needed)
const PROFANITY_LIST = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'hell',
]

function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase()
  return PROFANITY_LIST.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(lowerText)
  })
}

interface ChatMessageWithUser extends ChatMessageDB {
  user?: {
    display_name: string | null
    avatar_url: string | null
    tier: string
    is_trusted_reporter: boolean
  }
}

interface GameChatProps {
  gameId: string
}

export function GameChat({ gameId }: GameChatProps) {
  const { user, isAuthenticated } = useAuth()
  const [messages, setMessages] = useState<ChatMessageWithUser[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastMessageTime, setLastMessageTime] = useState<number>(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('chat_messages')
      .select(`
        *,
        user:users(display_name, avatar_url, tier, is_trusted_reporter)
      `)
      .eq('game_id', gameId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true })
      .limit(100)

    if (fetchError) {
      console.error('Error fetching messages:', fetchError)
      return
    }

    setMessages((data || []) as ChatMessageWithUser[])
    setIsLoading(false)
  }, [supabase, gameId])

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
          // Fetch the message with user data
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              user:users(display_name, avatar_url, tier, is_trusted_reporter)
            `)
            .eq('id', payload.new.id)
            .single()

          const msg = data as ChatMessageWithUser | null
          if (msg && !msg.is_hidden) {
            setMessages(prev => [...prev, msg])
          }
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
          // Hide message if it was flagged
          if ((payload.new as ChatMessageDB).is_hidden) {
            setMessages(prev => prev.filter(m => m.id !== payload.new.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, gameId, fetchMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || isSending) return

    // Rate limiting - 5 seconds between messages
    const now = Date.now()
    if (now - lastMessageTime < 5000) {
      setError('Please wait a few seconds before sending another message')
      return
    }

    // Profanity check
    if (containsProfanity(newMessage)) {
      setError('Please keep the chat respectful')
      return
    }

    // Character limit
    if (newMessage.length > 280) {
      setError('Message too long (max 280 characters)')
      return
    }

    setIsSending(true)
    setError(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: sendError } = await (supabase as any)
      .from('chat_messages')
      .insert({
        game_id: gameId,
        user_id: user.id,
        content: newMessage.trim(),
      })

    if (sendError) {
      console.error('Error sending message:', sendError)
      setError('Failed to send message')
    } else {
      setNewMessage('')
      setLastMessageTime(now)
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

  return (
    <div className="flex flex-col h-[400px] scoreboard-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-border px-4 py-3">
        <h3 className="font-mono text-sm font-bold text-score-amber uppercase tracking-wider">Game Chat</h3>
        <Badge variant="secondary" className="font-mono">{messages.length}</Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
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
            <div key={msg.id} className="flex gap-3 group animate-fade-in">
              <Avatar
                fallback={msg.user?.display_name || 'U'}
                src={msg.user?.avatar_url}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground truncate">
                    {msg.user?.display_name || 'User'}
                  </span>
                  {msg.user?.is_trusted_reporter && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">Trusted</Badge>
                  )}
                  <span className="text-xs text-foreground-subtle">
                    {formatRelativeTime(msg.created_at)}
                  </span>
                </div>
                <p className="text-sm text-foreground-muted mt-0.5 break-words">
                  {msg.content}
                </p>
              </div>
              {isAuthenticated && msg.user_id !== user?.id && (
                <button
                  onClick={() => handleReport(msg.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-foreground-subtle hover:text-destructive"
                  title="Report message"
                >
                  <Flag className="h-3 w-3" />
                </button>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-3 w-3" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Input */}
      {isAuthenticated ? (
        <form onSubmit={handleSendMessage} className="border-t-2 border-border p-3 bg-background-tertiary">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              maxLength={280}
              disabled={isSending}
              className="flex-1 font-mono text-sm"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newMessage.trim() || isSending}
              loading={isSending}
            >
              {!isSending && <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="font-mono text-[10px] text-foreground-subtle mt-1.5">
            {newMessage.length}/280
          </p>
        </form>
      ) : (
        <div className="border-t-2 border-border p-4 text-center bg-background-tertiary">
          <p className="font-mono text-sm text-foreground-muted mb-2">Sign in to join the chat</p>
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
