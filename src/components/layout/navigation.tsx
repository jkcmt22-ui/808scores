'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar,
  Radio,
  Trophy,
  User,
  Plus,
  BarChart3,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Today', icon: Calendar },
  { href: '/live', label: 'Live', icon: Radio },
  { href: '/submit', label: 'Submit', icon: Plus, isAction: true },
  { href: '/schools', label: 'Schools', icon: Building2 },
  { href: '/standings', label: 'Standings', icon: BarChart3 },
  { href: '/profile', label: 'Profile', icon: User },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-neon-pink bg-background safe-bottom" style={{ boxShadow: '0 -2px 20px rgba(255, 42, 109, 0.2)' }}>
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-neon-pink text-black font-bold transition-transform active:scale-95"
                  style={{ boxShadow: '0 0 15px var(--neon-pink), 0 0 30px var(--neon-pink)' }}
                >
                  <Icon className="h-7 w-7" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all',
                isActive
                  ? 'neon-text-blue'
                  : 'text-foreground-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-display text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function SubmitFAB() {
  return (
    <Link
      href="/submit"
      className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-lg bg-score-green border-2 border-green-700 text-black transition-all active:scale-95"
      style={{ boxShadow: '0 0 16px var(--score-green), inset 0 -2px 4px rgba(0,0,0,0.3)' }}
    >
      <Plus className="h-7 w-7" />
    </Link>
  )
}
