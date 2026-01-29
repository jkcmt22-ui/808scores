'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  MessageSquare,
  Eye,
  EyeOff,
  Flag,
  Search,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { Button, Badge, Input, Card } from '@/components/ui'
import { useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { ChatMessage, User, Game, School, Sport } from '@/types/database'

interface MessageWithDetails extends ChatMessage {
  user: Pick<User, 'id' | 'display_name' | 'email' | 'phone'>
  game: Game & {
    home_team: School
    away_team: School
    sport: Sport
  }
}

type FilterType = 'all' | 'reported' | 'hidden'

export default function ModerationPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [messages, setMessages] = useState<MessageWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<FilterType>('reported')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 50

  const hasAdminAccess = profile?.is_admin === true || profile?.is_super_admin === true

  // Fetch messages with pagination
  useEffect(() => {
    const fetchMessages = async () => {
      if (!supabase) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user:users(id, display_name, email, phone),
          game:games(
            id,
            scheduled_at,
            status,
            home_team:schools!games_home_team_id_fkey(id, name, short_name),
            away_team:schools!games_away_team_id_fkey(id, name, short_name),
            sport:sports(id, name, code)
          )
        `)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Error fetching messages:', error)
      } else if (data) {
        if (page === 0) {
          setMessages(data as MessageWithDetails[])
        } else {
          setMessages(prev => [...prev, ...(data as MessageWithDetails[])])
        }
        setHasMore(data.length === PAGE_SIZE)
      }

      setIsLoading(false)
    }

    if (hasAdminAccess) {
      fetchMessages()
    }
  }, [supabase, hasAdminAccess, page])

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Filter by type
      if (filter === 'reported' && msg.report_count === 0) return false
      if (filter === 'hidden' && !msg.is_hidden) return false

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesContent = msg.content.toLowerCase().includes(term)
        const matchesUser = msg.user?.display_name?.toLowerCase().includes(term) ||
          msg.user?.email?.toLowerCase().includes(term)
        const matchesGame = msg.game?.home_team?.name.toLowerCase().includes(term) ||
          msg.game?.away_team?.name.toLowerCase().includes(term)
        if (!matchesContent && !matchesUser && !matchesGame) return false
      }

      return true
    })
  }, [messages, filter, searchTerm])

  // Toggle message visibility
  const toggleHidden = async (messageId: string, currentlyHidden: boolean) => {
    if (!supabase) {
      setMessage({ type: 'error', text: 'Database connection not available' })
      return
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_hidden: !currentlyHidden } as never)
        .eq('id', messageId)

      if (error) throw error

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, is_hidden: !currentlyHidden } : m
        )
      )

      setMessage({
        type: 'success',
        text: currentlyHidden ? 'Message is now visible' : 'Message hidden from users',
      })
    } catch (err) {
      console.error('Error toggling message visibility:', err)
      setMessage({ type: 'error', text: 'Failed to update message' })
    }
  }

  // Delete message permanently
  const deleteMessage = async (messageId: string) => {
    if (!confirm('Permanently delete this message? This cannot be undone.')) return

    if (!supabase) {
      setMessage({ type: 'error', text: 'Database connection not available' })
      return
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      setMessage({ type: 'success', text: 'Message deleted permanently' })
    } catch (err) {
      console.error('Error deleting message:', err)
      setMessage({ type: 'error', text: 'Failed to delete message' })
    }
  }

  // Clear message after delay
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    router.push('/login?redirect=/admin/moderation')
    return null
  }

  // No admin access
  if (!hasAdminAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <AlertCircle className="mb-4 h-12 w-12 text-neon-pink" />
        <h1 className="mb-2 font-display text-xl font-bold text-foreground uppercase">Access Denied</h1>
        <p className="mb-4 text-foreground-muted text-sm text-center">
          You need admin privileges to access this area.
        </p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display font-bold text-lg neon-text-yellow uppercase tracking-wider">
              Comment Moderation
            </h1>
          </div>
        </div>
      </header>

      <main className="p-4 pb-24">
        {/* Message Toast */}
        {message && (
          <div className={cn(
            'mb-4 flex items-center gap-2 p-3 text-sm border-2',
            message.type === 'success'
              ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
              : 'bg-neon-pink/10 border-neon-pink/30 text-neon-pink'
          )}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              placeholder="Search messages, users, games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
          >
            <option value="reported">Reported Messages</option>
            <option value="hidden">Hidden Messages</option>
            <option value="all">All Messages</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-3 text-center">
            <div className="text-2xl font-display font-bold text-neon-pink">
              {messages.filter((m) => m.report_count > 0).length}
            </div>
            <div className="text-xs text-foreground-muted">Reported</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-display font-bold text-neon-yellow">
              {messages.filter((m) => m.is_hidden).length}
            </div>
            <div className="text-xs text-foreground-muted">Hidden</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-display font-bold text-neon-blue">
              {messages.length}
            </div>
            <div className="text-xs text-foreground-muted">Total</div>
          </Card>
        </div>

        {/* Messages List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-foreground-muted" />
            <p className="text-foreground-muted font-display">
              {filter === 'reported'
                ? 'No reported messages'
                : filter === 'hidden'
                ? 'No hidden messages'
                : 'No messages found'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((msg) => (
              <MessageCard
                key={msg.id}
                message={msg}
                onToggleHidden={() => toggleHidden(msg.id, msg.is_hidden)}
                onDelete={() => deleteMessage(msg.id)}
                onViewGame={() => router.push(`/game/${msg.game_id}`)}
              />
            ))}
            {/* Load More */}
            {hasMore && filteredMessages.length >= PAGE_SIZE && (
              <div className="pt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// Message Card Component
function MessageCard({
  message,
  onToggleHidden,
  onDelete,
  onViewGame,
}: {
  message: MessageWithDetails
  onToggleHidden: () => void
  onDelete: () => void
  onViewGame: () => void
}) {
  return (
    <Card className={cn(
      'border-2 p-4',
      message.is_hidden && 'border-neon-yellow/30 bg-neon-yellow/5',
      message.report_count > 0 && !message.is_hidden && 'border-neon-pink/30'
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {message.is_hidden && (
              <Badge variant="warning" className="text-[10px]">
                <EyeOff className="mr-1 h-3 w-3" />
                Hidden
              </Badge>
            )}
            {message.report_count > 0 && (
              <Badge variant="destructive" className="text-[10px]">
                <Flag className="mr-1 h-3 w-3" />
                {message.report_count} Reports
              </Badge>
            )}
          </div>

          {/* Content */}
          <p className="text-foreground mb-2 break-words">{message.content}</p>

          {/* User & Game Info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground-muted">
            <span>
              By: <span className="text-neon-blue">{message.user?.display_name || 'Unknown'}</span>
            </span>
            {message.game && (
              <span>
                Game: {message.game.away_team?.short_name} @ {message.game.home_team?.short_name}
              </span>
            )}
            <span>
              {new Date(message.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleHidden}
            title={message.is_hidden ? 'Show message' : 'Hide message'}
          >
            {message.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewGame}
            title="View game"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            title="Delete permanently"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
