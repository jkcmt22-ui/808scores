import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'

export interface ChatMessage {
  id: string
  game_id: string
  user_id: string
  content: string
  is_hidden: boolean
  report_count: number
  reply_to_id: string | null
  mentions: string[]
  like_count: number
  created_at: string
  user?: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }
  liked_by_me?: boolean
}

interface UseChatOptions {
  gameId: string
  limit?: number
}

interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: Error | null
  sendMessage: (content: string, replyToId?: string) => Promise<boolean>
  likeMessage: (messageId: string) => Promise<boolean>
  unlikeMessage: (messageId: string) => Promise<boolean>
  loadMore: () => Promise<void>
  hasMore: boolean
  isSending: boolean
}

export function useChat({ gameId, limit = 50 }: UseChatOptions): UseChatReturn {
  const { supabase, user } = useSupabase()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isSending, setIsSending] = useState(false)

  // Fetch messages
  const fetchMessages = useCallback(async (offset = 0) => {
    if (!gameId) return

    try {
      const { data, error: queryError } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user:users(id, display_name, avatar_url)
        `)
        .eq('game_id', gameId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (queryError) throw queryError

      const messagesData = (data || []) as ChatMessage[]

      // Check if user has liked each message
      if (user && messagesData.length > 0) {
        const messageIds = messagesData.map(m => m.id)
        const { data: likes } = await supabase
          .from('chat_likes')
          .select('message_id')
          .eq('user_id', user.id)
          .in('message_id', messageIds)

        const likedIds = new Set((likes || []).map(l => l.message_id))
        messagesData.forEach(m => {
          m.liked_by_me = likedIds.has(m.id)
        })
      }

      if (offset === 0) {
        setMessages(messagesData.reverse()) // Oldest first for display
      } else {
        setMessages(prev => [...messagesData.reverse(), ...prev])
      }

      setHasMore(messagesData.length === limit)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'))
    } finally {
      setIsLoading(false)
    }
  }, [supabase, gameId, limit, user])

  // Initial fetch
  useEffect(() => {
    if (gameId) {
      setIsLoading(true)
      fetchMessages()
    }
  }, [gameId, fetchMessages])

  // Set up realtime subscription
  useEffect(() => {
    if (!gameId) return

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
          // Fetch the full message with user data
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              user:users(id, display_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data && !data.is_hidden) {
            setMessages(prev => [...prev, data as ChatMessage])
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
          setMessages(prev =>
            prev.map(m =>
              m.id === payload.new.id
                ? { ...m, ...payload.new, user: m.user }
                : m
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, gameId])

  // Send message
  const sendMessage = useCallback(async (content: string, replyToId?: string): Promise<boolean> => {
    if (!user || !gameId || !content.trim()) {
      setError(new Error('Cannot send message: not logged in or empty content'))
      return false
    }

    setIsSending(true)

    try {
      // Extract mentions from content
      const mentionRegex = /@(\w+)/g
      const mentionMatches = content.match(mentionRegex) || []
      const mentionedUsernames = mentionMatches.map(m => m.slice(1))

      // Look up mentioned user IDs
      let mentionedUserIds: string[] = []
      if (mentionedUsernames.length > 0) {
        const { data: mentionedUsers } = await supabase
          .from('users')
          .select('id, display_name')
          .in('display_name', mentionedUsernames)

        mentionedUserIds = (mentionedUsers || []).map(u => u.id)
      }

      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          game_id: gameId,
          user_id: user.id,
          content: content.trim(),
          reply_to_id: replyToId || null,
          mentions: mentionedUserIds,
        })

      if (insertError) throw insertError

      return true
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err : new Error('Failed to send message'))
      return false
    } finally {
      setIsSending(false)
    }
  }, [supabase, user, gameId])

  // Like message
  const likeMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error: likeError } = await supabase
        .from('chat_likes')
        .insert({
          message_id: messageId,
          user_id: user.id,
        })

      if (likeError) throw likeError

      // Optimistically update UI
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? { ...m, like_count: m.like_count + 1, liked_by_me: true }
            : m
        )
      )

      return true
    } catch (err) {
      console.error('Error liking message:', err)
      return false
    }
  }, [supabase, user])

  // Unlike message
  const unlikeMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error: unlikeError } = await supabase
        .from('chat_likes')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)

      if (unlikeError) throw unlikeError

      // Optimistically update UI
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? { ...m, like_count: Math.max(0, m.like_count - 1), liked_by_me: false }
            : m
        )
      )

      return true
    } catch (err) {
      console.error('Error unliking message:', err)
      return false
    }
  }, [supabase, user])

  // Load more messages
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return
    await fetchMessages(messages.length)
  }, [hasMore, isLoading, messages.length, fetchMessages])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    likeMessage,
    unlikeMessage,
    loadMore,
    hasMore,
    isSending,
  }
}
