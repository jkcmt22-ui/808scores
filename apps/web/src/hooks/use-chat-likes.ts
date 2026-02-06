'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ChatLike } from '@/types/database'

interface UseChatLikesOptions {
  gameId: string
  userId?: string
}

interface UseChatLikesReturn {
  likedMessageIds: Set<string>
  toggleLike: (messageId: string) => Promise<'liked' | 'unliked' | null>
  isLoading: boolean
}

export function useChatLikes({ gameId, userId }: UseChatLikesOptions): UseChatLikesReturn {
  const [likedMessageIds, setLikedMessageIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Fetch user's likes for this game's messages
  const fetchLikes = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    if (!userId) {
      setLikedMessageIds(new Set())
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('chat_likes')
      .select('message_id, chat_messages!inner(game_id)')
      .eq('user_id', userId)
      .eq('chat_messages.game_id', gameId)

    if (error) {
      console.error('Error fetching likes:', error)
      setIsLoading(false)
      return
    }

    const likes = (data || []) as unknown as { message_id: string }[]
    const ids = new Set(likes.map((like) => like.message_id))
    setLikedMessageIds(ids)
    setIsLoading(false)
  }, [supabase, gameId, userId])

  useEffect(() => {
    fetchLikes()
  }, [fetchLikes])

  // Subscribe to realtime changes
  useEffect(() => {
    if (!supabase || !userId) return

    const channel = supabase
      .channel(`chat-likes-${gameId}-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_likes',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newLike = payload.new as ChatLike
            setLikedMessageIds((prev) => new Set([...prev, newLike.message_id]))
          } else if (payload.eventType === 'DELETE') {
            const oldLike = payload.old as ChatLike
            setLikedMessageIds((prev) => {
              const next = new Set(prev)
              next.delete(oldLike.message_id)
              return next
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, gameId, userId])

  // Track in-flight toggles to prevent double-firing on rapid clicks
  const pendingToggles = useRef(new Set<string>())
  // Ref to always read the latest likedMessageIds without stale closures
  const likedRef = useRef(likedMessageIds)
  likedRef.current = likedMessageIds

  const toggleLike = useCallback(
    async (messageId: string): Promise<'liked' | 'unliked' | null> => {
      if (!supabase || !userId) return null
      if (pendingToggles.current.has(messageId)) return null

      pendingToggles.current.add(messageId)
      try {
        const isLiked = likedRef.current.has(messageId)

        if (isLiked) {
          // Remove like
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any)
            .from('chat_likes')
            .delete()
            .eq('message_id', messageId)
            .eq('user_id', userId)

          if (error) {
            console.error('Error removing like:', error)
            return null
          }

          setLikedMessageIds((prev) => {
            const next = new Set(prev)
            next.delete(messageId)
            return next
          })
          return 'unliked'
        } else {
          // Add like
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any)
            .from('chat_likes')
            .insert({ message_id: messageId, user_id: userId })

          if (error) {
            console.error('Error adding like:', error)
            return null
          }

          setLikedMessageIds((prev) => new Set([...prev, messageId]))
          return 'liked'
        }
      } finally {
        pendingToggles.current.delete(messageId)
      }
    },
    [supabase, userId]
  )

  return {
    likedMessageIds,
    toggleLike,
    isLoading,
  }
}
