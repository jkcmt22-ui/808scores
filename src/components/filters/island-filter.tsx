'use client'

import { ISLANDS } from '@/lib/league-config'
import { cn } from '@/lib/utils'

interface IslandFilterProps {
  selected: string | null
  onChange: (island: string | null) => void
}

const ISLAND_ICONS: Record<string, string> = {
  Oahu: '🏝️',
  Maui: '🌴',
  Hawaii: '🌋',
  Kauai: '🌺',
  Molokai: '🐚',
  Lanai: '🍍'
}

export function IslandFilter({ selected, onChange }: IslandFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'px-4 py-2 text-sm font-display rounded border transition-all',
          selected === null
            ? 'bg-score-amber text-black border-score-amber shadow-[0_0_10px_rgba(245,158,11,0.5)]'
            : 'border-border text-foreground-muted hover:border-score-amber hover:text-score-amber'
        )}
      >
        All Islands
      </button>
      {ISLANDS.map(island => (
        <button
          key={island}
          onClick={() => onChange(island)}
          className={cn(
            'px-4 py-2 text-sm font-display rounded border transition-all',
            selected === island
              ? 'bg-score-amber text-black border-score-amber shadow-[0_0_10px_rgba(245,158,11,0.5)]'
              : 'border-border text-foreground-muted hover:border-score-amber hover:text-score-amber'
          )}
        >
          <span className="mr-1">{ISLAND_ICONS[island]}</span>
          {island}
        </button>
      ))}
    </div>
  )
}
