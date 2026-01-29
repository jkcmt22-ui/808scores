'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Loader2, Radio, Calendar } from 'lucide-react'
// Header not used - using GameSelectPage component instead
import { GameCardCompact } from '@/components/game'
import { Input, Button } from '@/components/ui'
import { useGames } from '@/hooks'
import { getHomeSchool, getAwaySchool } from '@/types/database'

export default function SelectGamePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  // Start with today's date
  const today = useMemo(() => new Date(), [])
  const [selectedDate, setSelectedDate] = useState(today)
  const { games, isLoading, error } = useGames({ date: selectedDate })

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + 'T00:00:00')
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(today)
  }

  const filteredGames = games.filter((game) => {
    const homeSchool = getHomeSchool(game)
    const awaySchool = getAwaySchool(game)
    return (
      homeSchool.name.toLowerCase().includes(search.toLowerCase()) ||
      awaySchool.name.toLowerCase().includes(search.toLowerCase()) ||
      homeSchool.short_name.toLowerCase().includes(search.toLowerCase()) ||
      awaySchool.short_name.toLowerCase().includes(search.toLowerCase())
    )
  })

  // Group by status
  const liveGames = filteredGames.filter((g) => g.status === 'in_progress')
  const scheduledGames = filteredGames.filter((g) => g.status === 'scheduled')
  const otherGames = filteredGames.filter((g) => !['in_progress', 'scheduled'].includes(g.status))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background-secondary">
        <div className="flex h-14 items-center px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-foreground-muted hover:text-neon-blue transition-colors font-display"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        </div>
      </header>

      <main className="p-4 grid-bg pb-24">
        <h1 className="mb-4 text-xl font-display font-bold uppercase tracking-wider text-foreground">Select a Game</h1>

        {/* Date Picker */}
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted pointer-events-none" />
            <Input
              type="date"
              value={formatDateForInput(selectedDate)}
              onChange={handleDateChange}
              className="pl-10 bg-background-secondary border-2 border-border focus:border-neon-blue"
            />
          </div>
          <Button
            onClick={goToToday}
            variant="secondary"
            className="font-display"
          >
            Today
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <Input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background-secondary border-2 border-border focus:border-neon-blue"
          />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-neon-blue mb-4" />
            <p className="text-foreground-muted font-display">Loading games...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="scoreboard-panel p-4 border-red-500/50">
            <p className="text-red-400 font-display">Failed to load games. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Live Games */}
            {liveGames.length > 0 && (
              <section className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <Radio className="h-4 w-4 animate-pulse text-neon-pink" style={{ filter: 'drop-shadow(0 0 6px var(--neon-pink))' }} />
                  <h2 className="font-display font-bold text-neon-pink uppercase tracking-wider">Live Now</h2>
                </div>
                <div className="space-y-2">
                  {liveGames.map((game) => (
                    <div key={game.id} onClick={() => router.push(`/submit/${game.id}`)} className="cursor-pointer">
                      <GameCardCompact game={game as any} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Scheduled Games */}
            {scheduledGames.length > 0 && (
              <section className="mb-6">
                <h2 className="mb-3 font-display font-bold text-neon-blue uppercase tracking-wider">Upcoming</h2>
                <div className="space-y-2">
                  {scheduledGames.map((game) => (
                    <div key={game.id} onClick={() => router.push(`/submit/${game.id}`)} className="cursor-pointer">
                      <GameCardCompact game={game as any} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Other Games (Final, etc.) */}
            {otherGames.length > 0 && (
              <section className="mb-6">
                <h2 className="mb-3 font-display font-bold text-foreground-muted uppercase tracking-wider">Completed</h2>
                <div className="space-y-2">
                  {otherGames.map((game) => (
                    <div key={game.id} onClick={() => router.push(`/submit/${game.id}`)} className="cursor-pointer">
                      <GameCardCompact game={game as any} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {filteredGames.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                <div className="scoreboard-panel p-8 mb-4">
                  <div className="score-led text-5xl mb-4 neon-text-pink">--</div>
                  <Search className="h-10 w-10 text-neon-blue mx-auto" />
                </div>
                <h3 className="mb-2 font-display text-xl font-black text-foreground uppercase tracking-widest">
                  {search ? 'No Matches' : 'No Games Today'}
                </h3>
                <p className="text-sm text-foreground-muted max-w-xs font-display">
                  {search
                    ? `No games found matching "${search}"`
                    : 'Check back later for scheduled games.'}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
