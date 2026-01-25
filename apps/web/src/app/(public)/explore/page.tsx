'use client'

import Link from 'next/link'
import { Header } from '@/components/layout'
import { Building2, BarChart3, Trophy, Medal } from 'lucide-react'

const exploreItems = [
  {
    title: 'Schools',
    subtitle: 'Browse all Hawaii high schools',
    href: '/schools',
    icon: Building2,
    color: 'neon-blue',
    bgClass: 'bg-neon-blue/10',
    borderClass: 'border-neon-blue/30',
    textClass: 'text-neon-blue',
  },
  {
    title: 'Standings',
    subtitle: 'League standings by sport',
    href: '/standings',
    icon: BarChart3,
    color: 'neon-pink',
    bgClass: 'bg-neon-pink/10',
    borderClass: 'border-neon-pink/30',
    textClass: 'text-neon-pink',
  },
  {
    title: 'Tournaments',
    subtitle: 'Playoffs, championships & brackets',
    href: '/tournaments',
    icon: Trophy,
    color: 'neon-yellow',
    bgClass: 'bg-neon-yellow/10',
    borderClass: 'border-neon-yellow/30',
    textClass: 'text-neon-yellow',
  },
  {
    title: 'Leaderboard',
    subtitle: 'Top score reporters',
    href: '/leaderboard',
    icon: Medal,
    color: 'neon-green',
    bgClass: 'bg-neon-green/10',
    borderClass: 'border-neon-green/30',
    textClass: 'text-neon-green',
  },
]

export default function ExplorePage() {
  return (
    <>
      <Header />
      <main className="px-4 py-6 pb-24 grid-bg">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-black text-foreground uppercase tracking-wider">
            Explore
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Discover schools, standings, tournaments, and more
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {exploreItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex flex-col items-center justify-center p-6 border-2 ${item.borderClass} ${item.bgClass} transition-all hover:scale-[1.02] active:scale-[0.98]`}
                style={{ minHeight: '160px' }}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center ${item.bgClass} border-2 ${item.borderClass} mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`h-7 w-7 ${item.textClass}`} />
                </div>
                <h2 className={`font-display text-lg font-bold ${item.textClass} uppercase tracking-wider text-center`}>
                  {item.title}
                </h2>
                <p className="mt-1 text-xs text-foreground-muted text-center">
                  {item.subtitle}
                </p>
              </Link>
            )
          })}
        </div>
      </main>
    </>
  )
}
