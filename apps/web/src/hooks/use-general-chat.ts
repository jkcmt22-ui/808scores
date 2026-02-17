'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isValidGifUrl, validateMessage, recordMessage } from '@808scores/shared'
import type { User } from '@supabase/supabase-js'

export interface GeneralChatMessage {
  id: string
  user_id: string
  content: string
  is_hidden: boolean
  report_count: number
  reply_to_id: string | null
  mentions: string[]
  like_count: number
  created_at: string
  message_type?: 'text' | 'gif'
  gif_url?: string | null
  gif_id?: string | null
  user?: {
    id: string
    display_name: string | null
    avatar_url: string | null
    is_trusted_reporter?: boolean
  }
  user_has_liked?: boolean
  reply_to?: GeneralChatMessage | null
}

interface UseGeneralChatOptions {
  limit?: number
}

interface UseGeneralChatReturn {
  messages: GeneralChatMessage[]
  isLoading: boolean
  error: Error | null
  sendMessage: (content: string, replyToId?: string | null) => Promise<boolean>
  sendGif: (gif: { id: string; url: string }, replyToId?: string | null) => Promise<boolean>
  toggleLike: (messageId: string) => Promise<void>
  reportMessage: (messageId: string) => Promise<boolean>
  deleteMessage: (messageId: string, isAdmin?: boolean) => Promise<boolean>
  loadMore: () => Promise<void>
  hasMore: boolean
  isSending: boolean
}

export function useGeneralChat(
  user: User | null,
  { limit = 50 }: UseGeneralChatOptions = {}
): UseGeneralChatReturn {
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] = useState<GeneralChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null)
  const isSubscribedRef = useRef(false)
  // Track how many messages were fetched from DB (excludes realtime inserts)
  // so loadMore pagination offset stays correct
  const fetchedCountRef = useRef(0)
  // Ref for reading current messages inside callbacks without adding to deps
  const messagesRef = useRef<GeneralChatMessage[]>([])
  messagesRef.current = messages

  // Fetch messages
  const fetchMessages = useCallback(async (offset = 0) => {
    if (!supabase) return

    try {
      const { data, error: queryError } = await supabase
        .from('general_chat_messages')
        .select(`
          *,
          user:users(id, display_name, avatar_url, is_trusted_reporter, is_admin, is_super_admin)
        `)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (queryError) throw queryError

      const messagesData = (data || []) as GeneralChatMessage[]

      // Check if user has liked each message
      if (user && messagesData.length > 0) {
        const messageIds = messagesData.map(m => m.id)
        const { data: likes } = await supabase
          .from('general_chat_likes')
          .select('message_id')
          .eq('user_id', user.id)
          .in('message_id', messageIds)

        const likedIds = new Set((likes as { message_id: string }[] || []).map(l => l.message_id))
        messagesData.forEach(m => {
          m.user_has_liked = likedIds.has(m.id)
        })
      }

      // Fetch reply_to messages if any
      const replyIds = messagesData
        .filter(m => m.reply_to_id)
        .map(m => m.reply_to_id) as string[]

      if (replyIds.length > 0) {
        const { data: replies } = await supabase
          .from('general_chat_messages')
          .select(`
            *,
            user:users(id, display_name, avatar_url, is_admin, is_super_admin)
          `)
          .in('id', replyIds)

        if (replies) {
          const replyMap = new Map((replies as GeneralChatMessage[]).map(r => [r.id, r]))
          messagesData.forEach(m => {
            if (m.reply_to_id) {
              m.reply_to = replyMap.get(m.reply_to_id) as GeneralChatMessage | undefined
            }
          })
        }
      }

      if (offset === 0) {
        setMessages(messagesData.reverse()) // Oldest first for display
        fetchedCountRef.current = messagesData.length
      } else {
        setMessages(prev => [...messagesData.reverse(), ...prev])
        fetchedCountRef.current += messagesData.length
      }

      setHasMore(messagesData.length === limit)
    } catch (err) {
      console.error('Error fetching general chat messages:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'))
    } finally {
      setIsLoading(false)
    }
  }, [supabase, limit, user])

  // Initial fetch
  useEffect(() => {
    setIsLoading(true)
    fetchMessages()
  }, [fetchMessages])

  // Set up realtime subscription
  useEffect(() => {
    if (!supabase) return

    // Prevent duplicate subscriptions (React StrictMode protection)
    if (isSubscribedRef.current) return
    isSubscribedRef.current = true

    channelRef.current = supabase
      .channel('general-chat-web')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'general_chat_messages',
        },
        async (payload) => {
          // Fetch the full message with user data
          const { data } = await supabase
            .from('general_chat_messages')
            .select(`
              *,
              user:users(id, display_name, avatar_url, is_trusted_reporter, is_admin, is_super_admin)
            `)
            .eq('id', payload.new.id)
            .single()

          const message = data as GeneralChatMessage | null
          if (message && !message.is_hidden) {
            // Fetch reply_to data if this message is a reply
            if (message.reply_to_id) {
              const { data: replyData } = await supabase
                .from('general_chat_messages')
                .select(`
                  *,
                  user:users(id, display_name, avatar_url, is_admin, is_super_admin)
                `)
                .eq('id', message.reply_to_id)
                .single()
              message.reply_to = (replyData as unknown as GeneralChatMessage) || undefined
            }
            setMessages(prev => [...prev, message])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'general_chat_messages',
        },
        (payload) => {
          const updated = payload.new as { id: string; is_hidden?: boolean }
          if (updated.is_hidden) {
            // Remove hidden messages (moderation)
            setMessages(prev => prev.filter(m => m.id !== updated.id))
            return
          }
          setMessages(prev =>
            prev.map(m =>
              m.id === updated.id
                ? { ...m, ...payload.new, user: m.user }
                : m
            )
          )
        }
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        isSubscribedRef.current = false
      }
    }
  }, [supabase, user?.id])

  // Send message via server-side API route (validates, rate-limits, checks bans server-side)
  const sendMessage = useCallback(async (content: string, replyToId?: string | null): Promise<boolean> => {
    if (!user || !content.trim()) {
      setError(new Error('Cannot send message: not logged in or empty content'))
      return false
    }

    // Client-side validation for fast UX feedback (server validates authoritatively)
    const validation = validateMessage(content, user.id)
    if (!validation.valid) {
      setError(new Error(validation.error || 'Message not allowed'))
      return false
    }

    setIsSending(true)

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          reply_to_id: replyToId || null,
          message_type: 'text',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to send message' }))
        throw new Error(data.error || 'Failed to send message')
      }

      // Record for client-side rate limiting UX
      recordMessage(user.id)

      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'))
      return false
    } finally {
      setIsSending(false)
    }
  }, [user])

  // Send GIF via server-side API route
  const sendGif = useCallback(async (gif: { id: string; url: string }, replyToId?: string | null): Promise<boolean> => {
    if (!user) {
      setError(new Error('Cannot send GIF: not logged in'))
      return false
    }

    // Client-side validation for fast UX feedback
    if (!isValidGifUrl(gif.url)) {
      setError(new Error('Invalid GIF URL: only GIPHY images are allowed'))
      return false
    }

    setIsSending(true)

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '',
          reply_to_id: replyToId || null,
          message_type: 'gif',
          gif_url: gif.url,
          gif_id: gif.id,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to send GIF' }))
        throw new Error(data.error || 'Failed to send GIF')
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send GIF'))
      return false
    } finally {
      setIsSending(false)
    }
  }, [user])

  // Toggle like
  const toggleLike = useCallback(async (messageId: string): Promise<void> => {
    if (!user || !supabase) return

    const message = messagesRef.current.find(m => m.id === messageId)
    if (!message) return

    const isLiked = message.user_has_liked

    try {
      if (isLiked) {
        const { error: unlikeError } = await supabase
          .from('general_chat_likes')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id)

        if (unlikeError) throw unlikeError

        setMessages(prev =>
          prev.map(m =>
            m.id === messageId
              ? { ...m, like_count: Math.max(0, m.like_count - 1), user_has_liked: false }
              : m
          )
        )
      } else {
        const { error: likeError } = await (supabase as any)
          .from('general_chat_likes')
          .insert({
            message_id: messageId,
            user_id: user.id,
          })

        if (likeError) throw likeError

        setMessages(prev =>
          prev.map(m =>
            m.id === messageId
              ? { ...m, like_count: m.like_count + 1, user_has_liked: true }
              : m
          )
        )
      }
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }, [supabase, user])

  // Report message
  const reportMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user || !supabase) return false

    try {
      const { error } = await (supabase as any).rpc('report_general_chat_message', {
        p_message_id: messageId,
        p_user_id: user.id,
      })

      if (error) {
        // If function doesn't exist, just increment report count directly
        const currentCount = messagesRef.current.find(m => m.id === messageId)?.report_count ?? 0
        const { error: updateError } = await (supabase as any)
          .from('general_chat_messages')
          .update({ report_count: currentCount + 1 })
          .eq('id', messageId)

        if (updateError) {
          console.error('Error reporting message (fallback):', updateError)
          return false
        }
      }

      return true
    } catch (err) {
      console.error('Error reporting message:', err)
      return false
    }
  }, [supabase, user])

  // Delete message (soft delete by setting is_hidden)
  const deleteMessage = useCallback(async (messageId: string, isAdmin = false): Promise<boolean> => {
    if (!user || !supabase) return false

    try {
      let query = (supabase as any)
        .from('general_chat_messages')
        .update({ is_hidden: true })
        .eq('id', messageId)

      // Non-admins can only delete their own messages
      if (!isAdmin) {
        query = query.eq('user_id', user.id)
      }

      const { error } = await query

      if (error) throw error

      // Remove from local state immediately
      setMessages(prev => prev.filter(m => m.id !== messageId))

      return true
    } catch (err) {
      console.error('Error deleting message:', err)
      return false
    }
  }, [supabase, user])

  // Load more messages (use fetchedCountRef so realtime inserts don't skew offset)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return
    await fetchMessages(fetchedCountRef.current)
  }, [hasMore, isLoading, fetchMessages])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    sendGif,
    toggleLike,
    reportMessage,
    deleteMessage,
    loadMore,
    hasMore,
    isSending,
  }
}
