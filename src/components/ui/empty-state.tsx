'use client'

import { Calendar, Star, Search, Trophy, MessageCircle, Bell, Users } from 'lucide-react'
import { Button } from './button'
import Link from 'next/link'

type IconType = 'calendar' | 'star' | 'search' | 'trophy' | 'chat' | 'bell' | 'users'

interface EmptyStateProps {
  icon?: IconType
  title: string
  message: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

const iconMap = {
  calendar: Calendar,
  star: Star,
  search: Search,
  trophy: Trophy,
  chat: MessageCircle,
  bell: Bell,
  users: Users,
}

export function EmptyState({
  icon = 'calendar',
  title,
  message,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const Icon = iconMap[icon]

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className || ''}`}>
      <div className="scoreboard-panel p-6 mb-4">
        <div className="score-led text-4xl mb-4 text-foreground-muted">--</div>
        <Icon className="h-10 w-10 text-neon-blue mx-auto" />
      </div>
      <h3 className="mb-2 font-display text-lg font-bold text-foreground uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-sm text-foreground-muted max-w-xs font-display mb-6">
        {message}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button>{action.label}</Button>
              </Link>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant="outline">{secondaryAction.label}</Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  )
}

// Pre-configured empty states for common scenarios
export function NoGamesToday() {
  return (
    <EmptyState
      icon="calendar"
      title="No Games Today"
      message="No games scheduled for today. Check back tomorrow or browse other dates!"
      action={{
        label: 'View Live Games',
        href: '/live',
      }}
    />
  )
}

export function NoFavorites() {
  return (
    <EmptyState
      icon="star"
      title="No Favorites Yet"
      message="Tap the star on any school to add them to your favorites and see their games first."
      action={{
        label: 'Browse Schools',
        href: '/schools',
      }}
    />
  )
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon="search"
      title="No Results Found"
      message={`We couldn't find anything matching "${query}". Try a different search term.`}
    />
  )
}

export function NoChatMessages() {
  return (
    <EmptyState
      icon="chat"
      title="No Messages Yet"
      message="Be the first to start the conversation! Share your thoughts about the game."
    />
  )
}

export function NoNotifications() {
  return (
    <EmptyState
      icon="bell"
      title="All Caught Up"
      message="You don't have any notifications right now. Check back after games you're following!"
    />
  )
}

export function NoTournaments() {
  return (
    <EmptyState
      icon="trophy"
      title="No Active Tournaments"
      message="There are no active tournaments right now. Check back during tournament season!"
    />
  )
}
