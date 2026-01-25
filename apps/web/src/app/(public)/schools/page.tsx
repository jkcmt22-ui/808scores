'use client'

import { useState, useMemo } from 'react'
import { useSchools } from '@/hooks/use-schools'
import { IslandFilter } from '@/components/filters/island-filter'
import { LeagueFilter } from '@/components/filters/league-filter'
import { SchoolCard, SchoolCardSkeleton } from '@/components/school/school-card'
import { Search } from 'lucide-react'
import { LEAGUES } from '@/lib/league-config'

export default function SchoolsPage() {
  const [selectedIsland, setSelectedIsland] = useState<string | null>(null)
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { schools, isLoading, error } = useSchools({
    island: selectedIsland || undefined,
    league: selectedLeague || undefined,
    search: searchQuery || undefined
  })

  // Group schools by league for display
  const schoolsByLeague = useMemo(() => {
    const grouped: Record<string, typeof schools> = {}

    for (const school of schools) {
      const league = school.league || 'Other'
      if (!grouped[league]) {
        grouped[league] = []
      }
      grouped[league].push(school)
    }

    // Sort leagues to put standard ones first
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      const aIndex = Object.keys(LEAGUES).indexOf(a)
      const bIndex = Object.keys(LEAGUES).indexOf(b)
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })

    return sortedKeys.map(key => ({ league: key, schools: grouped[key] }))
  }, [schools])

  // Handle island change - reset league if not available on new island
  const handleIslandChange = (island: string | null) => {
    setSelectedIsland(island)
    // Reset league if it's not available on the new island
    if (selectedLeague && island) {
      const leagueConfig = LEAGUES[selectedLeague]
      if (leagueConfig && leagueConfig.island !== island) {
        setSelectedLeague(null)
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display text-foreground mb-2">
          Schools Directory
        </h1>
        <p className="text-foreground-muted">
          Browse all Hawaii high school sports programs
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
        <input
          type="text"
          placeholder="Search schools by name or mascot..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-background-secondary border border-border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-score-amber transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="text-sm text-foreground-muted block mb-2">Filter by Island</label>
          <IslandFilter selected={selectedIsland} onChange={handleIslandChange} />
        </div>
        <div>
          <label className="text-sm text-foreground-muted block mb-2">Filter by League</label>
          <LeagueFilter
            selected={selectedLeague}
            onChange={setSelectedLeague}
            island={selectedIsland}
          />
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-foreground-muted mb-4">
          Showing {schools.length} {schools.length === 1 ? 'school' : 'schools'}
          {selectedIsland && ` on ${selectedIsland}`}
          {selectedLeague && ` in ${selectedLeague}`}
        </p>
      )}

      {/* Error state */}
      {error && (
        <div className="scoreboard-panel p-6 text-center text-neon-pink">
          Error loading schools: {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="h-6 w-32 bg-border rounded mb-3 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(j => (
                  <SchoolCardSkeleton key={j} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schools grid grouped by league */}
      {!isLoading && !error && (
        <div className="space-y-8">
          {schoolsByLeague.map(({ league, schools: leagueSchools }) => (
            <div key={league}>
              <h2 className="font-display text-lg text-foreground mb-3 flex items-center gap-2">
                <span className="text-neon-blue">{league}</span>
                <span className="text-sm text-foreground-muted font-normal">
                  ({leagueSchools.length})
                </span>
                {LEAGUES[league] && (
                  <span className="text-xs text-foreground-muted font-normal ml-2">
                    {LEAGUES[league].name}
                  </span>
                )}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leagueSchools.map(school => (
                  <SchoolCard
                    key={school.id}
                    school={school}
                    showIsland={!selectedIsland}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {schoolsByLeague.length === 0 && (
            <div className="scoreboard-panel p-12 text-center">
              <span className="text-4xl mb-4 block">🏫</span>
              <p className="text-foreground-muted">
                No schools found matching your criteria
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
