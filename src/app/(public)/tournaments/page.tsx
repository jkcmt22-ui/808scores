'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout'
import { TournamentCard } from '@/components/tournament'
import { useTournaments, useSports } from '@/hooks'
import { Trophy, Loader2, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { TournamentStatus } from '@/types/database'

const STATUS_TABS: { value: TournamentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in_progress', label: 'Live' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
]

export default function TournamentsPage() {
  const [statusFilter, setStatusFilter] = useState<TournamentStatus | 'all'>('all')
  const [sportFilter, setSportFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { sports } = useSports()
  const { tournaments, isLoading } = useTournaments(
    statusFilter !== 'all' ? { status: statusFilter } : {}
  )

  // Filter tournaments
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((tournament) => {
      const matchesSport =
        sportFilter === 'all' || tournament.sport_id === sportFilter

      const matchesSearch =
        searchTerm === '' ||
        tournament.name.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSport && matchesSearch
    })
  }, [tournaments, sportFilter, searchTerm])

  // Group by status for display
  const liveTournaments = filteredTournaments.filter((t) => t.status === 'in_progress')
  const upcomingTournaments = filteredTournaments.filter((t) => t.status === 'upcoming')
  const completedTournaments = filteredTournaments.filter((t) => t.status === 'completed')

  return (
    <>
      <Header />

      <main className="px-4 pb-24 grid-bg">
        {/* Page Header */}
        <div className="my-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center bg-neon-yellow/20 border-2 border-neon-yellow/30">
            <Trophy className="h-6 w-6 text-neon-yellow" />
          </div>
          <div>
            <h1 className="font-display font-black text-lg text-foreground uppercase tracking-wider">
              Tournaments
            </h1>
            <p className="font-display text-xs text-foreground-muted">
              Playoffs, Championships & Brackets
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  'px-4 py-2 font-display text-xs font-bold uppercase tracking-wider whitespace-nowrap border-2 transition-colors',
                  statusFilter === tab.value
                    ? 'bg-neon-yellow text-background border-neon-yellow'
                    : 'bg-background-secondary text-foreground-muted border-border hover:border-foreground-muted'
                )}
              >
                {tab.label}
                {tab.value === 'in_progress' && liveTournaments.length > 0 && (
                  <span className="ml-1 text-neon-pink">({liveTournaments.length})</span>
                )}
              </button>
            ))}
          </div>

          {/* Sport Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 text-foreground-muted flex-shrink-0" />
            <button
              onClick={() => setSportFilter('all')}
              className={cn(
                'px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border-2 transition-colors',
                sportFilter === 'all'
                  ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/50'
                  : 'bg-background-secondary text-foreground-muted border-border hover:border-foreground-muted'
              )}
            >
              All Sports
            </button>
            {sports.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSportFilter(sport.id)}
                className={cn(
                  'px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border-2 transition-colors',
                  sportFilter === sport.id
                    ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/50'
                    : 'bg-background-secondary text-foreground-muted border-border hover:border-foreground-muted'
                )}
              >
                {sport.display_name || sport.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
            <p className="mt-4 font-display text-sm text-foreground-muted">Loading tournaments...</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredTournaments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="scoreboard-panel p-8 mb-4">
              <Trophy className="h-10 w-10 text-foreground-muted mx-auto" />
            </div>
            <h3 className="mb-2 font-display text-xl font-black text-foreground uppercase tracking-widest">
              No Tournaments
            </h3>
            <p className="text-sm text-foreground-muted max-w-xs font-display">
              No tournaments match your filters. Try adjusting your search or filters.
            </p>
          </div>
        )}

        {/* Tournaments List */}
        {!isLoading && filteredTournaments.length > 0 && (
          <div className="space-y-6">
            {/* Live Tournaments */}
            {(statusFilter === 'all' || statusFilter === 'in_progress') && liveTournaments.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-3 w-3 animate-live-pulse rounded-full bg-neon-pink" style={{ boxShadow: '0 0 10px var(--neon-pink)' }} />
                  <h2 className="font-display text-sm font-black neon-text-pink uppercase tracking-widest">
                    Live Now
                  </h2>
                  <span className="font-display text-xs text-foreground-muted">
                    ({liveTournaments.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {liveTournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament as never} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Tournaments */}
            {(statusFilter === 'all' || statusFilter === 'upcoming') && upcomingTournaments.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="font-display text-sm font-black neon-text-yellow uppercase tracking-widest">
                    Upcoming
                  </h2>
                  <span className="font-display text-xs text-foreground-muted">
                    ({upcomingTournaments.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {upcomingTournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament as never} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Tournaments */}
            {(statusFilter === 'all' || statusFilter === 'completed') && completedTournaments.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="font-display text-sm font-black text-foreground-muted uppercase tracking-widest">
                    Completed
                  </h2>
                  <span className="font-display text-xs text-foreground-muted">
                    ({completedTournaments.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {completedTournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament as never} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </>
  )
}
