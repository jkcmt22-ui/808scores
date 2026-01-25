'use client'

import Link from 'next/link'
import { Header } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import {
  Bell,
  Trophy,
  CheckCircle,
  Star,
  Settings,
  MessageCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRequireAuth, useNotifications } from '@/hooks'

export default function NotificationsPage() {
  const { profile, isLoading: authLoading } = useRequireAuth()
  const {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications(profile?.id)

  const getIcon = (type: string) => {
    switch (type) {
      case 'points_earned':
        return <Trophy className="h-5 w-5 text-neon-yellow" />
      case 'score_verified':
        return <CheckCircle className="h-5 w-5 text-neon-green" />
      case 'badge_earned':
        return <Star className="h-5 w-5 text-neon-purple" />
      case 'game_alert':
      case 'game_reminder':
        return <Bell className="h-5 w-5 text-neon-blue" />
      case 'chat_mention':
      case 'chat_reply':
        return <MessageCircle className="h-5 w-5 text-neon-blue" />
      case 'score_rejected':
        return <AlertTriangle className="h-5 w-5 text-neon-pink" />
      default:
        return <Bell className="h-5 w-5 text-foreground-muted" />
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  // Get link from notification data
  const getNotificationLink = (notification: { type: string; data: Record<string, unknown> | null }) => {
    if (!notification.data) return undefined

    switch (notification.type) {
      case 'points_earned':
      case 'score_verified':
      case 'score_rejected':
      case 'chat_mention':
      case 'chat_reply':
        return notification.data.game_id ? `/game/${notification.data.game_id}` : undefined
      case 'game_alert':
      case 'game_reminder':
        return notification.data.game_id ? `/game/${notification.data.game_id}` : undefined
      case 'badge_earned':
        return '/profile/badges'
      default:
        return undefined
    }
  }

  if (authLoading || isLoading) {
    return (
      <>
        <Header title="Notifications" />
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Notifications" />

      <main className="px-4 pb-8">

        {/* Header actions */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="bg-neon-pink">{unreadCount} new</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            <Link href="/profile/settings">
              <Button variant="ghost" size="icon" aria-label="Notification settings">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Notifications list */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const link = getNotificationLink(notification)
              const cardContent = (
                <Card
                  className={cn(
                    'cursor-pointer transition-colors border-2',
                    !notification.read
                      ? 'border-neon-blue/30 bg-neon-blue/5'
                      : 'border-border hover:border-border-hover'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-4 p-4">
                    <div className="flex-shrink-0 pt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          'font-display font-bold',
                          !notification.read ? 'text-neon-blue' : 'text-foreground'
                        )}>
                          {notification.title}
                        </p>
                        <span className="flex-shrink-0 text-xs text-foreground-subtle font-display">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      {notification.body && (
                        <p className="mt-1 text-sm text-foreground-muted">
                          {notification.body}
                        </p>
                      )}
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 self-center">
                        <div className="h-2 w-2 rounded-full bg-neon-blue" style={{ boxShadow: '0 0 8px var(--neon-blue)' }} />
                      </div>
                    )}
                  </div>
                </Card>
              )

              return link ? (
                <Link key={notification.id} href={link}>
                  {cardContent}
                </Link>
              ) : (
                <div key={notification.id}>
                  {cardContent}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background-tertiary border-2 border-border">
              <Bell className="h-8 w-8 text-foreground-muted" />
            </div>
            <h3 className="mb-2 text-lg font-display font-bold text-foreground">No notifications</h3>
            <p className="text-sm text-foreground-muted">
              You&apos;re all caught up! Check back later for updates.
            </p>
          </div>
        )}
      </main>
    </>
  )
}
