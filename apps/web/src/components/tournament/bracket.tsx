'use client'

import React, { useMemo, useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { cn, formatGameTime, formatGameDate } from '@/lib/utils'
import type { TournamentBracket, BracketRound, BracketGame, TournamentRound } from '@/types/database'

interface BracketProps {
  bracket: TournamentBracket
  className?: string
}

// Round order for display (left to right)
const ELIMINATION_ROUND_ORDER: TournamentRound[] = [
  'play_in',
  'round_of_32',
  'round_of_16',
  'quarterfinal',
  'semifinal',
  'final',
]

// Game card height for connector calculations
const GAME_CARD_HEIGHT = 80
const COLUMN_GAP = 16
const COLUMN_WIDTH = 200

export function Bracket({ bracket, className }: BracketProps) {
  const { rounds } = bracket
  const containerRef = useRef<HTMLDivElement>(null)
  const [showConnectors, setShowConnectors] = useState(false)

  // Filter to elimination rounds only (exclude pool play and third place for main bracket)
  const eliminationRounds = useMemo(() => {
    return rounds
      .filter((r) => ELIMINATION_ROUND_ORDER.includes(r.round))
      .sort((a, b) => ELIMINATION_ROUND_ORDER.indexOf(a.round) - ELIMINATION_ROUND_ORDER.indexOf(b.round))
  }, [rounds])

  // Check if there's a third place game
  const thirdPlaceRound = rounds.find((r) => r.round === 'third_place')

  // Show connectors after mount (to ensure proper positioning)
  useEffect(() => {
    const timer = setTimeout(() => setShowConnectors(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (eliminationRounds.length === 0) {
    return (
      <div className={cn('p-4 text-center text-foreground-muted', className)}>
        No bracket games yet
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      {/* Main Bracket */}
      <div ref={containerRef} className="relative flex gap-4 min-w-max p-4">
        {/* Connector Lines SVG Overlay */}
        {showConnectors && eliminationRounds.length > 1 && (
          <BracketConnectors rounds={eliminationRounds} />
        )}

        {eliminationRounds.map((round, roundIndex) => (
          <BracketRoundColumn
            key={round.round}
            round={round}
            roundIndex={roundIndex}
            totalRounds={eliminationRounds.length}
          />
        ))}
      </div>

      {/* Third Place Game */}
      {thirdPlaceRound && thirdPlaceRound.games.length > 0 && (
        <div className="px-4 pb-4">
          <h3 className="font-display text-sm font-bold text-foreground-muted uppercase tracking-wider mb-3">
            Third Place
          </h3>
          <div className="inline-block">
            <BracketGameCard game={thirdPlaceRound.games[0]} />
          </div>
        </div>
      )}
    </div>
  )
}

// SVG Connector Lines between bracket rounds
function BracketConnectors({ rounds }: { rounds: BracketRound[] }) {
  const connectors: React.ReactElement[] = []
  const headerHeight = 28 // Height of round header
  const baseSpacing = 16 // Base margin between games

  for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex++) {
    const currentRound = rounds[roundIndex]
    const spacingMultiplier = Math.pow(2, roundIndex)
    const nextSpacingMultiplier = Math.pow(2, roundIndex + 1)
    const currentOffset = (spacingMultiplier - 1) * 40
    const nextOffset = (nextSpacingMultiplier - 1) * 40

    // X positions
    const x1 = roundIndex * (COLUMN_WIDTH + COLUMN_GAP) + COLUMN_WIDTH // End of current column
    const x2 = (roundIndex + 1) * (COLUMN_WIDTH + COLUMN_GAP) // Start of next column

    // For each pair of games that feed into the next round
    for (let gameIndex = 0; gameIndex < currentRound.games.length; gameIndex += 2) {
      if (gameIndex + 1 >= currentRound.games.length) break

      const gameSpacing = (spacingMultiplier - 1) * 80 + baseSpacing

      // Y positions for the two games feeding into next round
      const y1Top = headerHeight + currentOffset + gameIndex * (GAME_CARD_HEIGHT + gameSpacing) + GAME_CARD_HEIGHT / 2
      const y1Bottom = headerHeight + currentOffset + (gameIndex + 1) * (GAME_CARD_HEIGHT + gameSpacing) + GAME_CARD_HEIGHT / 2

      // Y position for the target game in next round
      const nextGameIndex = Math.floor(gameIndex / 2)
      const nextGameSpacing = (nextSpacingMultiplier - 1) * 80 + baseSpacing
      const y2 = headerHeight + nextOffset + nextGameIndex * (GAME_CARD_HEIGHT + nextGameSpacing) + GAME_CARD_HEIGHT / 2

      // Midpoint X for the connector bend
      const midX = x1 + COLUMN_GAP / 2

      // Draw connector path: horizontal from game -> vertical merge -> horizontal to next game
      const path = `
        M ${x1} ${y1Top}
        H ${midX}
        V ${y2}
        H ${x2}
        M ${x1} ${y1Bottom}
        H ${midX}
        V ${y2}
      `

      connectors.push(
        <path
          key={`connector-${roundIndex}-${gameIndex}`}
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border"
        />
      )
    }
  }

  // Calculate SVG dimensions
  const totalWidth = rounds.length * (COLUMN_WIDTH + COLUMN_GAP)
  const lastRoundMultiplier = Math.pow(2, rounds.length - 1)
  const lastRoundOffset = (lastRoundMultiplier - 1) * 40
  const lastRoundGames = rounds[rounds.length - 1]?.games.length || 1
  const lastRoundSpacing = (lastRoundMultiplier - 1) * 80 + baseSpacing
  const totalHeight = headerHeight + lastRoundOffset + lastRoundGames * (GAME_CARD_HEIGHT + lastRoundSpacing)

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      width={totalWidth}
      height={totalHeight}
      style={{ zIndex: 0 }}
    >
      {connectors}
    </svg>
  )
}

interface BracketRoundColumnProps {
  round: BracketRound
  roundIndex: number
  totalRounds: number
}

function BracketRoundColumn({ round, roundIndex, totalRounds }: BracketRoundColumnProps) {
  // Calculate spacing between games based on round depth
  // Later rounds have more vertical spacing to align with earlier rounds
  const spacingMultiplier = Math.pow(2, roundIndex)
  const initialOffset = (spacingMultiplier - 1) * 40 // Offset to center vertically

  return (
    <div className="flex flex-col min-w-[200px]">
      {/* Round Header */}
      <div className="mb-4 text-center">
        <h3 className="font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">
          {round.label}
        </h3>
      </div>

      {/* Games */}
      <div
        className="flex flex-col"
        style={{ paddingTop: `${initialOffset}px` }}
      >
        {round.games.map((game, gameIndex) => (
          <div
            key={game.id}
            style={{
              marginBottom: gameIndex < round.games.length - 1 ? `${(spacingMultiplier - 1) * 80 + 16}px` : 0,
            }}
          >
            <BracketGameCard game={game} />
          </div>
        ))}
      </div>
    </div>
  )
}

interface BracketGameCardProps {
  game: BracketGame
}

function BracketGameCard({ game }: BracketGameCardProps) {
  const isLive = game.status === 'in_progress'
  const isFinal = game.status === 'final'
  const isScheduled = game.status === 'scheduled'

  const homeWon = isFinal && game.homeScore !== null && game.awayScore !== null && game.homeScore > game.awayScore
  const awayWon = isFinal && game.homeScore !== null && game.awayScore !== null && game.awayScore > game.homeScore

  return (
    <Link
      href={`/game/${game.id}`}
      className={cn(
        'block border-2 bg-background-secondary transition-colors hover:border-neon-blue',
        isLive && 'border-neon-pink animate-pulse-subtle',
        isFinal && 'border-border',
        isScheduled && 'border-border'
      )}
    >
      {/* Game Time/Status */}
      <div className={cn(
        'px-3 py-1 text-center text-[10px] font-display font-bold uppercase tracking-wider border-b border-border',
        isLive && 'bg-neon-pink/20 text-neon-pink',
        isFinal && 'bg-background-tertiary text-foreground-muted',
        isScheduled && 'bg-background-tertiary text-foreground-subtle'
      )}>
        {isLive ? (
          <span className="flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse" />
            Live
          </span>
        ) : isFinal ? (
          'Final'
        ) : (
          <>
            {formatGameDate(game.scheduledAt)} · {formatGameTime(game.scheduledAt)}
          </>
        )}
      </div>

      {/* Teams */}
      <div className="divide-y divide-border">
        {/* Away Team (Top) */}
        <TeamRow
          team={game.awayTeam}
          seed={game.awaySeed}
          score={game.awayScore}
          isWinner={awayWon}
          isLive={isLive}
          isFinal={isFinal}
        />

        {/* Home Team (Bottom) */}
        <TeamRow
          team={game.homeTeam}
          seed={game.homeSeed}
          score={game.homeScore}
          isWinner={homeWon}
          isLive={isLive}
          isFinal={isFinal}
        />
      </div>
    </Link>
  )
}

interface TeamRowProps {
  team: { id: string; name: string; short_name: string } | null
  seed: number | null
  score: number | null
  isWinner: boolean
  isLive: boolean
  isFinal: boolean
}

function TeamRow({ team, seed, score, isWinner, isLive, isFinal }: TeamRowProps) {
  return (
    <div className={cn(
      'flex items-center justify-between px-2 py-2',
      isWinner && 'bg-neon-green/10'
    )}>
      <div className="flex items-center gap-2 min-w-0">
        {seed && (
          <span className="text-[10px] font-display font-bold text-foreground-muted w-4 text-center">
            {seed}
          </span>
        )}
        <span className={cn(
          'font-display text-sm truncate',
          isWinner ? 'font-bold text-neon-green' : 'text-foreground',
          !team && 'text-foreground-subtle italic'
        )}>
          {team ? team.short_name : 'TBD'}
        </span>
      </div>

      {(isLive || isFinal) && score !== null && (
        <span className={cn(
          'font-display font-bold text-sm min-w-[24px] text-right',
          isWinner ? 'text-neon-green' : isLive ? 'text-neon-pink' : 'text-foreground'
        )}>
          {score}
        </span>
      )}
    </div>
  )
}

// Compact bracket for mobile/smaller views
interface CompactBracketProps {
  bracket: TournamentBracket
  className?: string
}

export function CompactBracket({ bracket, className }: CompactBracketProps) {
  const { rounds } = bracket

  return (
    <div className={cn('space-y-6', className)}>
      {rounds.map((round) => (
        <div key={round.round}>
          <h3 className="font-display text-sm font-bold text-foreground-muted uppercase tracking-wider mb-3">
            {round.label}
          </h3>
          <div className="space-y-2">
            {round.games.map((game) => (
              <CompactGameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function CompactGameCard({ game }: { game: BracketGame }) {
  const isLive = game.status === 'in_progress'
  const isFinal = game.status === 'final'

  const homeWon = isFinal && game.homeScore !== null && game.awayScore !== null && game.homeScore > game.awayScore
  const awayWon = isFinal && game.homeScore !== null && game.awayScore !== null && game.awayScore > game.homeScore

  return (
    <Link
      href={`/game/${game.id}`}
      className={cn(
        'block border-2 bg-background-secondary p-3 transition-colors hover:border-neon-blue',
        isLive && 'border-neon-pink',
        !isLive && 'border-border'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Teams */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {game.awaySeed && (
              <span className="text-[10px] text-foreground-muted">#{game.awaySeed}</span>
            )}
            <span className={cn(
              'font-display text-sm',
              awayWon ? 'font-bold text-neon-green' : 'text-foreground'
            )}>
              {game.awayTeam?.short_name || 'TBD'}
            </span>
            {(isLive || isFinal) && (
              <span className={cn(
                'font-display font-bold',
                awayWon ? 'text-neon-green' : isLive ? 'text-neon-pink' : 'text-foreground'
              )}>
                {game.awayScore}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {game.homeSeed && (
              <span className="text-[10px] text-foreground-muted">#{game.homeSeed}</span>
            )}
            <span className={cn(
              'font-display text-sm',
              homeWon ? 'font-bold text-neon-green' : 'text-foreground'
            )}>
              {game.homeTeam?.short_name || 'TBD'}
            </span>
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

        {/* Status */}
        <div className="text-right">
          {isLive ? (
            <span className="flex items-center gap-1 text-xs text-neon-pink font-display font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse" />
              Live
            </span>
          ) : isFinal ? (
            <span className="text-xs text-foreground-muted font-display">Final</span>
          ) : (
            <span className="text-xs text-foreground-subtle font-display">
              {formatGameTime(game.scheduledAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
