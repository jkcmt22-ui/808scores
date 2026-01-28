'use client'

import Link from 'next/link'
import type { School } from '@/types/database'
import { LEAGUES } from '@/lib/league-config'
import { cn } from '@/lib/utils'

interface SchoolCardProps {
  school: School
  showIsland?: boolean
}

export function SchoolCard({ school, showIsland = true }: SchoolCardProps) {
  const colors = school.colors as { primary?: string; secondary?: string } | null
  const primaryColor = colors?.primary || '#374151'

  return (
    <Link href={`/school/${school.id}`}>
      <div
        className={cn(
          'group border border-border bg-background-secondary rounded-lg p-4',
          'hover:border-score-amber transition-all cursor-pointer',
          'hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]'
        )}
      >
        <div className="flex items-start gap-4">
          {/* Color indicator */}
          <div
            className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-display text-lg"
            style={{ backgroundColor: primaryColor }}
          >
            {school.short_name.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* School name */}
            <h3 className="font-display text-foreground group-hover:text-score-amber transition-colors truncate">
              {school.name}
            </h3>

            {/* Mascot */}
            {school.mascot && (
              <p className="text-sm text-foreground-muted truncate">
                {school.mascot}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-2">
              {showIsland && school.island && (
                <span className="text-xs px-2 py-0.5 rounded bg-background border border-border text-foreground-muted">
                  {school.island}
                </span>
              )}
              {school.league && (
                <span className="text-xs px-2 py-0.5 rounded bg-neon-blue/10 border border-neon-blue/30 text-neon-blue">
                  {school.league}
                </span>
              )}
              {school.division && (
                <span className="text-xs px-2 py-0.5 rounded bg-neon-pink/10 border border-neon-pink/30 text-neon-pink">
                  {school.division}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Skeleton for loading state
export function SchoolCardSkeleton() {
  return (
    <div className="border border-border bg-background-secondary rounded-lg p-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-border flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-5 bg-border rounded w-3/4 mb-2" />
          <div className="h-4 bg-border rounded w-1/2 mb-3" />
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-border rounded" />
            <div className="h-5 w-12 bg-border rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
