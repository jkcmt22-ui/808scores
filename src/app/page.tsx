'use client'

import { useState, useMemo, useCallback } from 'react'
import { Header } from '@/components/layout'
import { GameCard, SportFilter } from '@/components/game'
import { GameCardSkeleton } from '@/components/ui'
import { FavoritesModal } from '@/components/onboarding'
import { QuickAccess, TournamentBanner } from '@/components/home'
import { GlobalSearch } from '@/components/search/global-search'
import { useGames, useAuth, useFavoriteTeams, useFavoriteSports } from '@/hooks'
import { formatFullDate } from '@/lib/utils'
import { Calendar, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import type { GameType, GameWithTeams } from '@/types/database'

// Main competitive game types shown in the main feed
const COMPETITIVE_GAME_TYPES: GameType[] = ['regular_season', 'playoff', 'championship', 'tournament']
// Non-competitive game types shown in the "Other Games" section
const OTHER_GAME_TYPES: GameType[] = ['exhibition', 'scrimmage']

// Helper to get date string in Hawaii time
function getHawaiiDateStr(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu' })
}

// Helper to check if date is today in Hawaii time
function isToday(date: Date): boolean {
  const today = new Date()
  return getHawaiiDateStr(date) === getHawaiiDateStr(today)
}

// Helper to format date for display
function formatDateDisplay(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dateStr = getHawaiiDateStr(date)
  const todayStr = getHawaiiDateStr(today)
  const yesterdayStr = getHawaiiDateStr(yesterday)
  const tomorrowStr = getHawaiiDateStr(tomorrow)

  if (dateStr === todayStr) {
    return 'Today'
  } else if (dateStr === yesterdayStr) {
    return 'Yesterday'
  } else if (dateStr === tomorrowStr) {
    return 'Tomorrow'
  }
  return formatFullDate(date)
}

// Sort games with favorites first
function sortByFavorites(
  games: GameWithTeams[],
  favoriteTeamIds: string[],
  favoriteSportIds: string[]
): { favorites: GameWithTeams[]; others: GameWithTeams[] } {
  const favorites: GameWithTeams[] = []
  const others: GameWithTeams[] = []

  games.forEach((game) => {
    const isFavorite =
      favoriteTeamIds.includes(game.home_team.id) ||
      favoriteTeamIds.includes(game.away_team.id) ||
      favoriteSportIds.includes(game.sport.id)

    if (isFavorite) {
      favorites.push(game)
    } else {
      others.push(game)
    }
  })

  return { favorites, others }
}

export default function HomePage() {
  const [selectedSport, setSelectedSport] = useState('all')
  const [otherGamesExpanded, setOtherGamesExpanded] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  // Auth and favorites
  const { user, profile, isAuthenticated, refreshProfile } = useAuth()
  const { favoriteTeams } = useFavoriteTeams(user?.id)
  const { favoriteSports } = useFavoriteSports(user?.id)

  // Get favorite IDs
  const favoriteTeamIds = useMemo(
    () => favoriteTeams.map((f) => f.school_id),
    [favoriteTeams]
  )
  const favoriteSportIds = useMemo(
    () => favoriteSports.map((f) => f.sport_id),
    [favoriteSports]
  )

  // Check if onboarding should be shown
  const shouldShowOnboarding = useMemo(
    () => isAuthenticated && profile && !profile.onboarding_completed,
    [isAuthenticated, profile]
  )

  // Navigate to previous day
  const goToPreviousDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() - 1)
      return newDate
    })
  }

  // Navigate to next day
  const goToNextDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + 1)
      return newDate
    })
  }

  // Go to today
  const goToToday = () => {
    setSelectedDate(new Date())
  }

  // Fetch main competitive games
  const { games, isLoading } = useGames({
    date: selectedDate,
    sportCode: selectedSport,
    excludeGameTypes: OTHER_GAME_TYPES,
  })

  // Fetch exhibition/scrimmage games
  const { games: otherGames, isLoading: isLoadingOther } = useGames({
    date: selectedDate,
    sportCode: selectedSport,
    gameTypes: OTHER_GAME_TYPES,
  })

  // Categorize games by status
  const liveGames = games.filter((g) => g.status === 'in_progress')
  const scheduledGames = games.filter((g) => g.status === 'scheduled')
  const finalGames = games.filter((g) => g.status === 'final')

  // Sort each category with favorites first
  const hasFavorites = favoriteTeamIds.length > 0 || favoriteSportIds.length > 0

  const sortedLive = useMemo(
    () => sortByFavorites(liveGames, favoriteTeamIds, favoriteSportIds),
    [liveGames, favoriteTeamIds, favoriteSportIds]
  )
  const sortedScheduled = useMemo(
    () => sortByFavorites(scheduledGames, favoriteTeamIds, favoriteSportIds),
    [scheduledGames, favoriteTeamIds, favoriteSportIds]
  )
  const sortedFinal = useMemo(
    () => sortByFavorites(finalGames, favoriteTeamIds, favoriteSportIds),
    [finalGames, favoriteTeamIds, favoriteSportIds]
  )

  // Handle onboarding complete
  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    refreshProfile()
  }

  return (
    <>
      <Header />
      <SportFilter selected={selectedSport} onChange={setSelectedSport} />

      {/* Onboarding Modal */}
      {(shouldShowOnboarding || showOnboarding) && user && (
        <FavoritesModal
          userId={user.id}
          onComplete={handleOnboardingComplete}
        />
      )}

      <main className="px-4 pb-24 grid-bg">
        {/* Date Navigation */}
        <div className="my-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center bg-background-tertiary border-2 border-neon-blue/30">
              <Calendar className="h-6 w-6 text-neon-blue" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-foreground uppercase tracking-wider">
                {formatDateDisplay(selectedDate)}
              </h2>
              {!isLoading && (
                <p className="font-display text-xs text-neon-yellow">
                  {games.length} game{games.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Date Navigation Arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousDay}
              className="flex h-10 w-10 items-center justify-center border-2 border-border bg-background-secondary hover:border-neon-blue hover:text-neon-blue transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={goToToday}
              className={`h-10 px-3 border-2 font-display text-xs font-bold uppercase tracking-wider transition-colors ${
                isToday(selectedDate)
                  ? 'border-neon-yellow bg-neon-yellow/10 text-neon-yellow'
                  : 'border-neon-pink bg-neon-pink/10 text-neon-pink hover:bg-neon-pink/20'
              }`}
            >
              {isToday(selectedDate)
                ? 'Today'
                : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Pacific/Honolulu' })}
            </button>

            <button
              onClick={goToNextDay}
              className="flex h-10 w-10 items-center justify-center border-2 border-border bg-background-secondary hover:border-neon-blue hover:text-neon-blue transition-colors"
              aria-label="Next day"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Full Date Display (when not today/yesterday/tomorrow) */}
        {!['Today', 'Yesterday', 'Tomorrow'].includes(formatDateDisplay(selectedDate)) && (
          <p className="mb-4 font-display text-sm text-foreground-muted">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Pacific/Honolulu' })}
          </p>
        )}

        {/* Quick Access Section */}
        <QuickAccess onSearchClick={openSearch} />

        {/* Tournament Banner (only when active tournaments exist) */}
        <TournamentBanner />

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            <GameCardSkeleton />
            <GameCardSkeleton />
            <GameCardSkeleton />
          </div>
        )}

        {/* Live Games Section */}
        {!isLoading && liveGames.length > 0 && (
          <section className="mb-6 animate-fade-in">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-3 w-3 animate-live-pulse rounded-full bg-neon-pink" style={{ boxShadow: '0 0 10px var(--neon-pink)' }} />
              <h3 className="font-display text-sm font-black neon-text-pink uppercase tracking-widest">Live Now</h3>
              <span className="font-display text-xs text-foreground-muted">({liveGames.length})</span>
            </div>
            <div className="space-y-3">
              {/* Favorite live games */}
              {hasFavorites && sortedLive.favorites.length > 0 && (
                <>
                  <div className="flex items-center gap-2 text-xs text-neon-yellow">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="font-display uppercase tracking-wider">Your Teams</span>
                  </div>
                  {sortedLive.favorites.map((game) => (
                    <GameCard key={game.id} game={game} showSport />
                  ))}
                  {sortedLive.others.length > 0 && (
                    <div className="border-t border-border/50 pt-3 mt-3" />
                  )}
                </>
              )}
              {/* Other live games */}
              {(hasFavorites ? sortedLive.others : liveGames).map((game) => (
                <GameCard key={game.id} game={game} showSport />
              ))}
            </div>
          </section>
        )}

        {/* Scheduled Games Section */}
        {!isLoading && scheduledGames.length > 0 && (
          <section className="mb-6 animate-fade-in">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="font-display text-sm font-black neon-text-yellow uppercase tracking-widest">Upcoming</h3>
              <span className="font-display text-xs text-foreground-muted">({scheduledGames.length})</span>
            </div>
            <div className="space-y-3">
              {/* Favorite upcoming games */}
              {hasFavorites && sortedScheduled.favorites.length > 0 && (
                <>
                  <div className="flex items-center gap-2 text-xs text-neon-yellow">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="font-display uppercase tracking-wider">Your Teams</span>
                  </div>
                  {sortedScheduled.favorites.map((game) => (
                    <GameCard key={game.id} game={game} showSport />
                  ))}
                  {sortedScheduled.others.length > 0 && (
                    <div className="border-t border-border/50 pt-3 mt-3" />
                  )}
                </>
              )}
              {/* Other upcoming games */}
              {(hasFavorites ? sortedScheduled.others : scheduledGames).map((game) => (
                <GameCard key={game.id} game={game} showSport />
              ))}
            </div>
          </section>
        )}

        {/* Final Games Section */}
        {!isLoading && finalGames.length > 0 && (
          <section className="mb-6 animate-fade-in">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="font-display text-sm font-black text-foreground-muted uppercase tracking-widest">Final</h3>
              <span className="font-display text-xs text-foreground-muted">({finalGames.length})</span>
            </div>
            <div className="space-y-3">
              {/* Favorite final games */}
              {hasFavorites && sortedFinal.favorites.length > 0 && (
                <>
                  <div className="flex items-center gap-2 text-xs text-neon-yellow">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="font-display uppercase tracking-wider">Your Teams</span>
                  </div>
                  {sortedFinal.favorites.map((game) => (
                    <GameCard key={game.id} game={game} showSport />
                  ))}
                  {sortedFinal.others.length > 0 && (
                    <div className="border-t border-border/50 pt-3 mt-3" />
                  )}
                </>
              )}
              {/* Other final games */}
              {(hasFavorites ? sortedFinal.others : finalGames).map((game) => (
                <GameCard key={game.id} game={game} showSport />
              ))}
            </div>
          </section>
        )}

        {/* Empty State for Main Games */}
        {!isLoading && games.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="scoreboard-panel p-8 mb-4">
              <div className="score-led text-5xl mb-4 neon-text-pink">--</div>
              <Calendar className="h-10 w-10 text-neon-blue mx-auto" />
            </div>
            <h3 className="mb-2 font-display text-xl font-black text-foreground uppercase tracking-widest">
              No Games
            </h3>
            <p className="text-sm text-foreground-muted max-w-xs font-display">
              No games on {formatDateDisplay(selectedDate).toLowerCase()}. Use the arrows to browse other dates.
            </p>
          </div>
        )}

        {/* Other Games Section (Exhibition/Scrimmage) */}
        {!isLoadingOther && otherGames.length > 0 && (
          <section className="mt-8 animate-fade-in">
            <button
              onClick={() => setOtherGamesExpanded(!otherGamesExpanded)}
              className="w-full mb-3 flex items-center justify-between px-4 py-3 border-2 border-border bg-background-secondary/50 hover:border-foreground-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-foreground-muted uppercase tracking-widest">
                  Other Games
                </h3>
                <span className="font-display text-xs text-foreground-subtle">
                  (Exhibition & Scrimmages)
                </span>
                <span className="font-display text-xs text-foreground-muted">
                  {otherGames.length}
                </span>
              </div>
              {otherGamesExpanded ? (
                <ChevronUp className="h-5 w-5 text-foreground-muted" />
              ) : (
                <ChevronDown className="h-5 w-5 text-foreground-muted" />
              )}
            </button>

            {otherGamesExpanded && (
              <div className="space-y-3 opacity-75">
                {otherGames.map((game) => (
                  <div key={game.id} className="relative">
                    {/* Muted overlay effect */}
                    <div className="absolute top-2 right-2 z-10">
                      <span className="text-[10px] font-display font-bold text-foreground-subtle uppercase tracking-widest px-2 py-1 bg-background-tertiary border border-border">
                        {game.game_type === 'exhibition' ? 'Exhibition' : 'Scrimmage'}
                      </span>
                    </div>
                    <GameCard game={game} showSport />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </main>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={closeSearch} />
    </>
  )
}
