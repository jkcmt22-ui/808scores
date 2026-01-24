'use client'

import Link from 'next/link'
import { Search, Trophy, BarChart3, Medal, Building2 } from 'lucide-react'

interface QuickAccessProps {
  onSearchClick: () => void
}

const quickLinks = [
  { label: 'Tournaments', href: '/tournaments', icon: Trophy, color: 'neon-yellow' },
  { label: 'Standings', href: '/standings', icon: BarChart3, color: 'neon-pink' },
  { label: 'Leaders', href: '/leaderboard', icon: Medal, color: 'neon-green' },
  { label: 'Schools', href: '/schools', icon: Building2, color: 'neon-blue' },
]

export function QuickAccess({ onSearchClick }: QuickAccessProps) {
  return (
    <div className="mb-4 space-y-3">
      {/* Search Trigger */}
      <button
        onClick={onSearchClick}
        className="w-full flex items-center gap-3 px-4 py-3 border-2 border-border bg-background-secondary hover:border-neon-blue hover:bg-background-tertiary transition-all"
      >
        <Search className="h-5 w-5 text-foreground-muted" />
        <span className="text-foreground-muted text-sm flex-1 text-left">
          Search schools, players...
        </span>
        <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs bg-background rounded border border-border text-foreground-muted">
          <span className="text-[10px]">Cmd</span>
          <span>K</span>
        </kbd>
      </button>

      {/* Quick Link Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {quickLinks.map((link) => {
          const Icon = link.icon
          const colorClasses = {
            'neon-yellow': 'border-neon-yellow/40 text-neon-yellow hover:bg-neon-yellow/10',
            'neon-pink': 'border-neon-pink/40 text-neon-pink hover:bg-neon-pink/10',
            'neon-green': 'border-neon-green/40 text-neon-green hover:bg-neon-green/10',
            'neon-blue': 'border-neon-blue/40 text-neon-blue hover:bg-neon-blue/10',
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 border-2 bg-background-secondary whitespace-nowrap transition-all ${colorClasses[link.color as keyof typeof colorClasses]}`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-display text-xs font-bold uppercase tracking-wider">
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
