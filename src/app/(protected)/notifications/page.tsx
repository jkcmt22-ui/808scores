'use client'

import { useState } from 'react'
import { Header } from '@/components/layout'
import { Card, Badge, Button } from '@/components/ui'
import {
  Bell,
  BellRing,
  BellOff,
  Trophy,
  Target,
  AlertCircle,
  CheckCircle,
  Star,
  Settings,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRequireAuth, usePushNotifications } from '@/hooks'

// Mock notifications
const mockNotifications = [
  {
    id: '1',
    type: 'points_earned',
    title: 'Points Earned!',
    body: 'You earned 15 points for reporting the Kahuku vs Mililani score.',
    read: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    data: { points: 15, game: 'Kahuku vs Mililani' },
  },
  {
    id: '2',
    type: 'score_verified',
    title: 'Score Verified',
    body: 'Your submission for Saint Louis vs Punahou has been verified.',
    read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    data: { game: 'Saint Louis vs Punahou' },
  },
  {
    id: '3',
    type: 'badge_earned',
    title: 'Badge Earned! 🎯',
    body: 'You earned the "First Score" badge for your first verified submission.',
    read: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    data: { badge: 'first_score' },
  },
  {
    id: '4',
    type: 'game_alert',
    title: 'Game Starting Soon',
    body: 'Kahuku vs Kamehameha starts in 30 minutes.',
    read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    data: { game_id: '123' },
  },
  {
    id: '5',
    type: 'lucky_reporter',
    title: 'Lucky Reporter! 🎰',
    body: 'You won a random bonus of 50 points!',
    read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    data: { bonus_points: 50 },
  },
]

export default function NotificationsPage() {
  const { isLoading } = useRequireAuth()
  const [notifications, setNotifications] = useState(mockNotifications)
  const {
    isSupported: pushSupported,
    permission: pushPermission,
    isSubscribed: pushSubscribed,
    isLoading: pushLoading,
    error: pushError,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush
  } = usePushNotifications()

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleTogglePush = async () => {
    if (pushSubscribed) {
      await unsubscribePush()
    } else {
      await subscribePush()
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'points_earned':
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 'score_verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'badge_earned':
        return <Star className="h-5 w-5 text-purple-500" />
      case 'game_alert':
        return <Bell className="h-5 w-5 text-blue-500" />
      case 'lucky_reporter':
        return <Star className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <Header title="Notifications" />

      <main className="px-4 pb-8 grid-bg">
        {/* Push Notifications Toggle */}
        <div className="my-4 scoreboard-panel p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {pushSubscribed ? (
                <BellRing className="h-6 w-6 text-neon-green" style={{ filter: 'drop-shadow(0 0 6px var(--neon-green))' }} />
              ) : (
                <BellOff className="h-6 w-6 text-foreground-muted" />
              )}
              <div>
                <p className="font-display font-bold text-foreground">Push Notifications</p>
                <p className="text-xs text-foreground-muted font-display">
                  {!pushSupported
                    ? 'Not supported in this browser'
                    : pushPermission === 'denied'
                    ? 'Blocked - enable in browser settings'
                    : pushSubscribed
                    ? 'You will receive score alerts'
                    : 'Get notified when scores update'}
                </p>
                {pushError && (
                  <p className="text-xs text-neon-pink mt-1">{pushError}</p>
                )}
              </div>
            </div>
            <Button
              onClick={handleTogglePush}
              disabled={!pushSupported || pushPermission === 'denied' || pushLoading}
              variant={pushSubscribed ? 'outline' : 'default'}
              size="sm"
            >
              {pushLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : pushSubscribed ? (
                'Disable'
              ) : (
                'Enable'
              )}
            </Button>
          </div>
        </div>

        {/* Header actions */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} new</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Notifications list */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-900',
                  !notification.read && 'border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30'
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-4 p-4">
                  <div className="flex-shrink-0 pt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('font-medium', !notification.read && 'text-blue-900 dark:text-blue-100')}>
                        {notification.title}
                      </p>
                      <span className="flex-shrink-0 text-xs text-gray-500">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {notification.body}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No notifications</h3>
            <p className="text-sm text-gray-500">
              You&apos;re all caught up! Check back later for updates.
            </p>
          </div>
        )}
      </main>
    </>
  )
}
