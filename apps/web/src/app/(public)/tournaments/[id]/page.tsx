'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header, Breadcrumbs } from '@/components/layout'
import { Bracket, CompactBracket } from '@/components/tournament'
// GameCard import removed - using inline game display
import { useTournamentBracket } from '@/hooks'
import {
  Trophy,
  Loader2,
  ChevronLeft,
  Calendar,
  MapPin,
  Users,
  Grid3X3,
  List,
  Award,
} from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { TournamentFormat, TournamentStatus, TournamentRound } from '@/types/database'

type ViewMode = 'bracket' | 'games' | 'standings'

const FORMAT_LABELS: Record<TournamentFormat, string> = {
  single_elimination: 'Single Elimination',
  double_elimination: 'Double Elimination',
  round_robin: 'Round Robin',
  pool_play: 'Pool Play',
  custom: 'Custom',
}

const STATUS_LABELS: Record<TournamentStatus, string> = {
  upcoming: 'Upcoming',
  in_progress: 'In Progress',
  completed: 'Completed',
  canceled: 'Canceled',
}

const ROUND_LABELS: Record<TournamentRound, string> = {
  play_in: 'Play-In',
  round_of_32: 'Round of 32',
  round_of_16: 'Round of 16',
  quarterfinal: 'Quarterfinals',
  semifinal: 'Semifinals',
  third_place: 'Third Place',
  final: 'Championship',
  pool_a: 'Pool A',
  pool_b: 'Pool B',
  pool_c: 'Pool C',
  pool_d: 'Pool D',
}

export default function TournamentPage() {
  const params = useParams()
  const router = useRouter()
  const tournamentId = params.id as string

  const [viewMode, setViewMode] = useState<ViewMode>('bracket')

  const { bracket, isLoading, error } = useTournamentBracket(tournamentId)

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
          <p className="mt-4 font-display text-sm text-foreground-muted">Loading tournament...</p>
        </main>
      </>
    )
  }

  if (error || !bracket) {
    return (
      <>
        <Header />
        <main className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Trophy className="h-12 w-12 text-foreground-muted mb-4" />
          <h1 className="font-display text-xl font-bold text-foreground mb-2">Tournament Not Found</h1>
          <p className="text-foreground-muted text-sm text-center mb-4">
            This tournament may have been removed or doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push('/tournaments')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Tournaments
          </Button>
        </main>
      </>
    )
  }

  const { tournament, rounds } = bracket
  const isLive = tournament.status === 'in_progress'
  const isCompleted = tournament.status === 'completed'

  // Get all games flat
  const allGames = rounds.flatMap((r) => r.games)
  const liveGames = allGames.filter((g) => g.status === 'in_progress')
  const upcomingGames = allGames.filter((g) => g.status === 'scheduled')
  const completedGames = allGames.filter((g) => g.status === 'final')

  // Get winner if completed
  const finalRound = rounds.find((r) => r.round === 'final')
  const finalGame = finalRound?.games[0]
  const champion = finalGame?.status === 'final' && finalGame.homeScore !== null && finalGame.awayScore !== null
    ? finalGame.homeScore > finalGame.awayScore
      ? finalGame.homeTeam
      : finalGame.awayTeam
    : null

  return (
    <>
      <Header />

      <main className="pb-24 grid-bg">
        {/* Back Button */}
        <div className="px-4 py-3 border-b border-border">
          <Button variant="ghost" size="sm" onClick={() => router.push('/tournaments')}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            All Tournaments
          </Button>
        </div>

        {/* Breadcrumbs */}
        <div className="px-4 border-b border-border bg-background-secondary">
          <Breadcrumbs
            items={[
              { label: 'Tournaments', href: '/tournaments' },
              { label: tournament.name },
            ]}
          />
        </div>

        {/* Tournament Header */}
        <div className="px-4 py-4 border-b border-border bg-background-secondary">
          <div className="flex items-start gap-3 mb-3">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center flex-shrink-0',
              isLive && 'bg-neon-pink/20',
              isCompleted && 'bg-neon-green/20',
              !isLive && !isCompleted && 'bg-neon-yellow/20'
            )}>
              <Trophy className={cn(
                'h-6 w-6',
                isLive && 'text-neon-pink',
                isCompleted && 'text-neon-green',
                !isLive && !isCompleted && 'text-neon-yellow'
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge
                  variant={
                    isLive
                      ? 'destructive'
                      : isCompleted
                      ? 'secondary'
                      : tournament.status === 'canceled'
                      ? 'outline'
                      : 'default'
                  }
                >
                  {isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1.5" />
                  )}
                  {STATUS_LABELS[tournament.status]}
                </Badge>
                <span className="text-xs text-neon-blue font-display font-bold uppercase">
                  {tournament.sport?.display_name || tournament.sport?.name}
                </span>
              </div>
              <h1 className="font-display font-black text-lg text-foreground leading-tight">
                {tournament.name}
              </h1>
            </div>
          </div>

          {/* Tournament Details */}
          <div className="flex items-center gap-4 text-xs text-foreground-muted flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(tournament.start_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'Pacific/Honolulu',
              })}
              {tournament.end_date && tournament.end_date !== tournament.start_date && (
                <>
                  {' - '}
                  {new Date(tournament.end_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'Pacific/Honolulu',
                  })}
                </>
              )}
            </span>

            {tournament.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {tournament.venue}
              </span>
            )}

            {tournament.num_teams && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {tournament.num_teams} teams
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="warning" className="text-[10px]">
              {FORMAT_LABELS[tournament.format]}
            </Badge>
            {tournament.league && (
              <Badge variant="outline" className="text-[10px]">
                {tournament.league}
              </Badge>
            )}
            {tournament.division && (
              <Badge variant="outline" className="text-[10px]">
                {tournament.division}
              </Badge>
            )}
            {tournament.season && (
              <Badge variant="outline" className="text-[10px]">
                {tournament.season}
              </Badge>
            )}
          </div>

          {/* Champion Banner */}
          {champion && (
            <div className="mt-4 p-3 bg-neon-green/10 border-2 border-neon-green/30">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-neon-green" />
                <span className="font-display text-sm font-bold text-neon-green uppercase tracking-wider">
                  Champion
                </span>
              </div>
              <p className="font-display font-black text-lg text-foreground mt-1">
                {champion.name}
              </p>
            </div>
          )}
        </div>

        {/* View Mode Tabs */}
        <div className="px-4 py-3 border-b border-border flex gap-2">
          <Button
            variant={viewMode === 'bracket' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('bracket')}
          >
            <Grid3X3 className="mr-2 h-4 w-4" />
            Bracket
          </Button>
          <Button
            variant={viewMode === 'games' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('games')}
          >
            <List className="mr-2 h-4 w-4" />
            Games ({allGames.length})
          </Button>
          <Button
            variant={viewMode === 'standings' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('standings')}
          >
            <Users className="mr-2 h-4 w-4" />
            Teams
          </Button>
        </div>

        {/* Live Games Banner */}
        {liveGames.length > 0 && (
          <div className="px-4 py-3 bg-neon-pink/10 border-b border-neon-pink/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-neon-pink animate-pulse" />
              <span className="font-display text-xs font-bold text-neon-pink uppercase tracking-wider">
                {liveGames.length} Game{liveGames.length !== 1 ? 's' : ''} Live Now
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-4">
          {/* Bracket View */}
          {viewMode === 'bracket' && (
            <>
              {/* Desktop Bracket */}
              <div className="hidden md:block">
                <Bracket bracket={bracket} />
              </div>

              {/* Mobile Bracket */}
              <div className="md:hidden">
                <CompactBracket bracket={bracket} />
              </div>
            </>
          )}

          {/* Games View */}
          {viewMode === 'games' && (
            <div className="space-y-6">
              {/* Live Games */}
              {liveGames.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-3 w-3 animate-live-pulse rounded-full bg-neon-pink" />
                    <h2 className="font-display text-sm font-black neon-text-pink uppercase tracking-widest">
                      Live Now
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {liveGames.map((game) => (
                      <TournamentGameCard key={game.id} game={game} />
                    ))}
                  </div>
                </section>
              )}

              {/* Upcoming Games */}
              {upcomingGames.length > 0 && (
                <section>
                  <h2 className="mb-3 font-display text-sm font-black neon-text-yellow uppercase tracking-widest">
                    Upcoming
                  </h2>
                  <div className="space-y-3">
                    {upcomingGames.map((game) => (
                      <TournamentGameCard key={game.id} game={game} />
                    ))}
                  </div>
                </section>
              )}

              {/* Completed Games */}
              {completedGames.length > 0 && (
                <section>
                  <h2 className="mb-3 font-display text-sm font-black text-foreground-muted uppercase tracking-widest">
                    Completed
                  </h2>
                  <div className="space-y-3">
                    {completedGames.map((game) => (
                      <TournamentGameCard key={game.id} game={game} />
                    ))}
                  </div>
                </section>
              )}

              {allGames.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-foreground-muted font-display">
                    No games scheduled yet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Standings/Teams View */}
          {viewMode === 'standings' && (
            <TeamsStandings bracket={bracket} />
          )}
        </div>
      </main>
    </>
  )
}

// Tournament Game Card (simplified)
import Link from 'next/link'
import { formatGameTime, formatGameDate } from '@/lib/utils'
import type { BracketGame } from '@/types/database'

function TournamentGameCard({ game }: { game: BracketGame }) {
  const isLive = game.status === 'in_progress'
  const isFinal = game.status === 'final'

  const homeWon = isFinal && game.homeScore !== null && game.awayScore !== null && game.homeScore > game.awayScore
  const awayWon = isFinal && game.homeScore !== null && game.awayScore !== null && game.awayScore > game.homeScore

  return (
    <Link
      href={`/game/${game.id}`}
      className={cn(
        'block border-2 bg-background-secondary p-3 transition-colors hover:border-neon-blue',
        isLive && 'border-neon-pink/50',
        !isLive && 'border-border'
      )}
    >
      {/* Round & Time */}
      <div className="flex items-center justify-between mb-2">
        <Badge variant="warning" className="text-[10px]">
          {ROUND_LABELS[game.round]}
        </Badge>
        {isLive ? (
          <span className="flex items-center gap-1 text-xs text-neon-pink font-display font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse" />
            Live
          </span>
        ) : isFinal ? (
          <span className="text-xs text-foreground-muted font-display">Final</span>
        ) : (
          <span className="text-xs text-foreground-subtle font-display">
            {formatGameDate(game.scheduledAt)} · {formatGameTime(game.scheduledAt)}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {game.awaySeed && (
              <span className="text-xs text-foreground-muted font-display">#{game.awaySeed}</span>
            )}
            <span className={cn(
              'font-display font-bold',
              awayWon ? 'text-neon-green' : 'text-foreground'
            )}>
              {game.awayTeam?.short_name || 'TBD'}
            </span>
          </div>
          {(isLive || isFinal) && (
            <span className={cn(
              'font-display font-bold',
              awayWon ? 'text-neon-green' : isLive ? 'text-neon-pink' : 'text-foreground'
            )}>
              {game.awayScore}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {game.homeSeed && (
              <span className="text-xs text-foreground-muted font-display">#{game.homeSeed}</span>
            )}
            <span className={cn(
              'font-display font-bold',
              homeWon ? 'text-neon-green' : 'text-foreground'
            )}>
              {game.homeTeam?.short_name || 'TBD'}
            </span>
          </div>
          {(isLive || isFinal) && (
            <span className={cn(
              'font-display font-bold',
              homeWon ? 'text-neon-green' : isLive ? 'text-neon-pink' : 'text-foreground'
            )}>
              {game.homeScore}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// Teams Standings Component
import type { TournamentBracket as TournamentBracketType } from '@/types/database'

function TeamsStandings({ bracket }: { bracket: TournamentBracketType }) {
  const { tournament } = bracket

  // For now, show a simple message - actual team stats would come from tournament_teams
  return (
    <div className="text-center py-12">
      <Users className="mx-auto h-12 w-12 text-foreground-muted mb-4" />
      <p className="text-foreground-muted font-display">
        Team standings coming soon
      </p>
      <p className="text-xs text-foreground-subtle mt-2">
        {tournament.num_teams || 'Multiple'} teams participating
      </p>
    </div>
  )
}
