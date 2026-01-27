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

  // Color based on icon type for variety
  const iconColors: Record<IconType, { border: string; bg: string; text: string; glow: string }> = {
    calendar: { border: 'border-neon-blue/30', bg: 'bg-neon-blue/5', text: 'text-neon-blue', glow: 'shadow-[0_0_20px_rgba(0,212,255,0.15)]' },
    star: { border: 'border-neon-yellow/30', bg: 'bg-neon-yellow/5', text: 'text-neon-yellow', glow: 'shadow-[0_0_20px_rgba(255,215,0,0.15)]' },
    search: { border: 'border-neon-pink/30', bg: 'bg-neon-pink/5', text: 'text-neon-pink', glow: 'shadow-[0_0_20px_rgba(255,42,109,0.15)]' },
    trophy: { border: 'border-neon-yellow/30', bg: 'bg-neon-yellow/5', text: 'text-neon-yellow', glow: 'shadow-[0_0_20px_rgba(255,215,0,0.15)]' },
    chat: { border: 'border-neon-green/30', bg: 'bg-neon-green/5', text: 'text-neon-green', glow: 'shadow-[0_0_20px_rgba(0,255,136,0.15)]' },
    bell: { border: 'border-neon-blue/30', bg: 'bg-neon-blue/5', text: 'text-neon-blue', glow: 'shadow-[0_0_20px_rgba(0,212,255,0.15)]' },
    users: { border: 'border-neon-green/30', bg: 'bg-neon-green/5', text: 'text-neon-green', glow: 'shadow-[0_0_20px_rgba(0,255,136,0.15)]' },
  }

  const colors = iconColors[icon]

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className || ''}`}>
      {/* Illustrated container with decorations */}
      <div className={`relative p-8 mb-6 border-2 ${colors.border} ${colors.bg} ${colors.glow}`}>
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-current opacity-30" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-current opacity-30" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-current opacity-30" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-current opacity-30" />

        {/* Decorative dots */}
        <div className="absolute top-3 right-3 flex gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${colors.text} opacity-40`} style={{ backgroundColor: 'currentColor' }} />
          <div className={`w-1 h-1 rounded-full ${colors.text} opacity-20`} style={{ backgroundColor: 'currentColor' }} />
        </div>

        {/* Score display */}
        <div className={`score-led text-4xl mb-3 ${colors.text} opacity-50`}>--</div>

        {/* Main icon */}
        <Icon className={`h-12 w-12 mx-auto ${colors.text}`} aria-hidden="true" />

        {/* Subtle animated pulse */}
        <div className={`absolute inset-0 ${colors.bg} animate-pulse opacity-30 pointer-events-none`} />
      </div>

      <h3 className="mb-2 font-display text-xl font-black text-foreground uppercase tracking-widest">
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
