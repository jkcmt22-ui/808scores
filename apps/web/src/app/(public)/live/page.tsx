'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout'
import { GameCard, SportFilter } from '@/components/game'
import { useLiveGames, useAuth, useFavoriteTeams, useFavoriteSports } from '@/hooks'
import { Radio, Loader2, Star } from 'lucide-react'
import type { GameWithTeams } from '@/types/database'

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

export default function LivePage() {
  const [selectedSport, setSelectedSport] = useState('all')
  const { games, isLoading } = useLiveGames()

  // Auth and favorites
  const { user } = useAuth()
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

  const hasFavorites = favoriteTeamIds.length > 0 || favoriteSportIds.length > 0

  // Filter by sport
  const filteredGames =
    selectedSport === 'all'
      ? games
      : games.filter((g) => g.sport?.code === selectedSport || g.sport?.name?.toLowerCase().includes(selectedSport.toLowerCase()))

  // Sort with favorites first
  const sortedGames = useMemo(
    () => sortByFavorites(filteredGames as any, favoriteTeamIds, favoriteSportIds),
    [filteredGames, favoriteTeamIds, favoriteSportIds]
  )

  return (
    <>
      <Header title="Live Games" />

      <SportFilter selected={selectedSport} onChange={setSelectedSport} />

      <main className="px-4 pb-24 grid-bg">
        {/* Live indicator */}
        <div className="my-4 flex items-center gap-2">
          <Radio className="h-5 w-5 animate-pulse text-neon-pink" style={{ filter: 'drop-shadow(0 0 6px var(--neon-pink))' }} />
          <span className="text-sm text-foreground-muted font-display">
            Real-time updates via Supabase
          </span>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-neon-blue mb-4" />
            <p className="text-foreground-muted font-display">Loading live games...</p>
          </div>
        )}

        {/* Live Games */}
        {!isLoading && filteredGames.length > 0 && (
          <div className="space-y-3">
            {/* Favorite live games */}
            {hasFavorites && sortedGames.favorites.length > 0 && (
              <>
                <div className="flex items-center gap-2 text-xs text-neon-yellow">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="font-display uppercase tracking-wider">Your Teams</span>
                </div>
                {sortedGames.favorites.map((game) => (
                  <GameCard key={game.id} game={game as any} showSport />
                ))}
                {sortedGames.others.length > 0 && (
                  <div className="border-t border-border/50 pt-3 mt-3" />
                )}
              </>
            )}
            {/* Other live games */}
            {(hasFavorites ? sortedGames.others : filteredGames).map((game) => (
              <GameCard key={game.id} game={game as any} showSport />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredGames.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="scoreboard-panel p-8 mb-4">
              <div className="score-led text-5xl mb-4 neon-text-pink">--</div>
              <Radio className="h-10 w-10 text-neon-blue mx-auto" />
            </div>
            <h3 className="mb-2 font-display text-xl font-black text-foreground uppercase tracking-widest">
              No Live Games
            </h3>
            <p className="text-sm text-foreground-muted max-w-xs font-display">
              Check back during game time or view today&apos;s schedule.
            </p>
          </div>
        )}
      </main>
    </>
  )
}
