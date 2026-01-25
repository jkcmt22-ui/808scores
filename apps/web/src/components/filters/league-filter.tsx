'use client'

import { LEAGUES, getLeaguesForIsland } from '@/lib/league-config'
import { cn } from '@/lib/utils'

interface LeagueFilterProps {
  selected: string | null
  onChange: (league: string | null) => void
  island?: string | null
}

export function LeagueFilter({ selected, onChange, island }: LeagueFilterProps) {
  // If an island is selected, only show leagues for that island
  // If no island, show all leagues
  const availableLeagues = island
    ? getLeaguesForIsland(island)
    : Object.keys(LEAGUES)

  // Reset selection if the current selected league is not available
  const isSelectedAvailable = selected ? availableLeagues.includes(selected) : true
  if (!isSelectedAvailable && selected) {
    onChange(null)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'px-4 py-2 text-sm font-display rounded border transition-all',
          selected === null
            ? 'bg-neon-blue text-black border-neon-blue shadow-[0_0_10px_rgba(5,217,232,0.5)]'
            : 'border-border text-foreground-muted hover:border-neon-blue hover:text-neon-blue'
        )}
      >
        All Leagues
      </button>
      {availableLeagues.map(leagueCode => {
        const league = LEAGUES[leagueCode]
        return (
          <button
            key={leagueCode}
            onClick={() => onChange(leagueCode)}
            className={cn(
              'px-4 py-2 text-sm font-display rounded border transition-all group relative',
              selected === leagueCode
                ? 'bg-neon-blue text-black border-neon-blue shadow-[0_0_10px_rgba(5,217,232,0.5)]'
                : 'border-border text-foreground-muted hover:border-neon-blue hover:text-neon-blue'
            )}
            title={league.name}
          >
            {leagueCode}
          </button>
        )
      })}
    </div>
  )
}
