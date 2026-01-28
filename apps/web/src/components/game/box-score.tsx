'use client'

import { cn } from '@/lib/utils'
import type { School } from '@/types/database'

// Player stat types for different sports
interface BasePlayerStat {
  playerId: string
  playerName: string
  jerseyNumber: number | null
  isStarter: boolean
}

interface BasketballPlayerStat extends BasePlayerStat {
  minutes: number | null
  points: number
  fgm: number | null
  fga: number | null
  threePm: number | null
  threePa: number | null
  ftm: number | null
  fta: number | null
  rebOff: number | null
  rebDef: number | null
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  fouls: number
}

interface FootballPlayerStat extends BasePlayerStat {
  // Passing
  passingYards: number | null
  passingTds: number | null
  passAttempts: number | null
  completions: number | null
  interceptions: number | null
  // Rushing
  rushingYards: number | null
  rushingTds: number | null
  rushAttempts: number | null
  // Receiving
  receivingYards: number | null
  receivingTds: number | null
  receptions: number | null
  // Defense
  tackles: number | null
  sacks: number | null
  defensiveInts: number | null
}

interface VolleyballPlayerStat extends BasePlayerStat {
  kills: number
  attackErrors: number | null
  attackAttempts: number | null
  aces: number
  digs: number
  blocksTotal: number
}

interface BoxScoreProps {
  sportCode: string
  homeTeam: School
  awayTeam: School
  homeStats: BasePlayerStat[]
  awayStats: BasePlayerStat[]
  className?: string
}

export function BoxScore({
  sportCode,
  homeTeam,
  awayTeam,
  homeStats,
  awayStats,
  className,
}: BoxScoreProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Away Team Box Score */}
      <TeamBoxScore
        team={awayTeam}
        stats={awayStats}
        sportCode={sportCode}
        isHome={false}
      />

      {/* Home Team Box Score */}
      <TeamBoxScore
        team={homeTeam}
        stats={homeStats}
        sportCode={sportCode}
        isHome={true}
      />
    </div>
  )
}

interface TeamBoxScoreProps {
  team: School
  stats: BasePlayerStat[]
  sportCode: string
  isHome: boolean
}

function TeamBoxScore({ team, stats, sportCode, isHome }: TeamBoxScoreProps) {
  if (stats.length === 0) {
    return (
      <div className="border-2 border-border bg-background-secondary p-4">
        <h3 className="font-display font-bold text-foreground mb-2">
          {team.short_name}
        </h3>
        <p className="text-sm text-foreground-muted">No player stats available</p>
      </div>
    )
  }

  const isBasketball = sportCode.includes('basketball')
  const isFootball = sportCode === 'football'
  const isVolleyball = sportCode.includes('volleyball')

  return (
    <div className="border-2 border-border bg-background-secondary overflow-hidden">
      {/* Team Header */}
      <div className={cn(
        'px-4 py-2 border-b-2 border-border',
        isHome ? 'bg-neon-pink/10' : 'bg-neon-blue/10'
      )}>
        <h3 className={cn(
          'font-display font-bold',
          isHome ? 'text-neon-pink' : 'text-neon-blue'
        )}>
          {team.short_name}
        </h3>
      </div>

      {/* Stats Table */}
      <div className="overflow-x-auto">
        {isBasketball && (
          <BasketballStatsTable stats={stats as BasketballPlayerStat[]} />
        )}
        {isVolleyball && (
          <VolleyballStatsTable stats={stats as VolleyballPlayerStat[]} />
        )}
        {isFootball && (
          <FootballStatsTable stats={stats as FootballPlayerStat[]} />
        )}
        {!isBasketball && !isVolleyball && !isFootball && (
          <GenericStatsTable stats={stats} />
        )}
      </div>
    </div>
  )
}

function BasketballStatsTable({ stats }: { stats: BasketballPlayerStat[] }) {
  // Sort: starters first, then by points
  const sortedStats = [...stats].sort((a, b) => {
    if (a.isStarter !== b.isStarter) return a.isStarter ? -1 : 1
    return b.points - a.points
  })

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-background-tertiary text-foreground-muted text-[10px] uppercase tracking-wider">
          <th scope="col" className="px-2 py-2 text-left">Player</th>
          <th scope="col" className="px-2 py-2 text-center">MIN</th>
          <th scope="col" className="px-2 py-2 text-center">PTS</th>
          <th scope="col" className="px-2 py-2 text-center">FG</th>
          <th scope="col" className="px-2 py-2 text-center">3PT</th>
          <th scope="col" className="px-2 py-2 text-center">FT</th>
          <th scope="col" className="px-2 py-2 text-center">REB</th>
          <th scope="col" className="px-2 py-2 text-center">AST</th>
          <th scope="col" className="px-2 py-2 text-center">STL</th>
          <th scope="col" className="px-2 py-2 text-center">BLK</th>
          <th scope="col" className="px-2 py-2 text-center">TO</th>
          <th scope="col" className="px-2 py-2 text-center">PF</th>
        </tr>
      </thead>
      <tbody>
        {sortedStats.map((player, idx) => (
          <tr
            key={player.playerId}
            className={cn(
              'border-t border-border',
              idx % 2 === 0 && 'bg-background-secondary/50'
            )}
          >
            <td className="px-2 py-2 font-display">
              <span className="text-foreground-muted text-xs mr-2">
                {player.jerseyNumber ?? '-'}
              </span>
              <span className={cn(
                'font-medium',
                player.isStarter && 'text-neon-yellow'
              )}>
                {player.playerName}
              </span>
            </td>
            <td className="px-2 py-2 text-center text-foreground-muted">
              {player.minutes ?? '-'}
            </td>
            <td className="px-2 py-2 text-center font-bold text-neon-green">
              {player.points}
            </td>
            <td className="px-2 py-2 text-center text-foreground-muted">
              {player.fgm ?? 0}-{player.fga ?? 0}
            </td>
            <td className="px-2 py-2 text-center text-foreground-muted">
              {player.threePm ?? 0}-{player.threePa ?? 0}
            </td>
            <td className="px-2 py-2 text-center text-foreground-muted">
              {player.ftm ?? 0}-{player.fta ?? 0}
            </td>
            <td className="px-2 py-2 text-center">{player.rebounds}</td>
            <td className="px-2 py-2 text-center">{player.assists}</td>
            <td className="px-2 py-2 text-center">{player.steals}</td>
            <td className="px-2 py-2 text-center">{player.blocks}</td>
            <td className="px-2 py-2 text-center">{player.turnovers}</td>
            <td className="px-2 py-2 text-center">{player.fouls}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function VolleyballStatsTable({ stats }: { stats: VolleyballPlayerStat[] }) {
  const sortedStats = [...stats].sort((a, b) => {
    if (a.isStarter !== b.isStarter) return a.isStarter ? -1 : 1
    return b.kills - a.kills
  })

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-background-tertiary text-foreground-muted text-[10px] uppercase tracking-wider">
          <th scope="col" className="px-2 py-2 text-left">Player</th>
          <th scope="col" className="px-2 py-2 text-center">K</th>
          <th scope="col" className="px-2 py-2 text-center">E</th>
          <th scope="col" className="px-2 py-2 text-center">TA</th>
          <th scope="col" className="px-2 py-2 text-center">PCT</th>
          <th scope="col" className="px-2 py-2 text-center">A</th>
          <th scope="col" className="px-2 py-2 text-center">D</th>
          <th scope="col" className="px-2 py-2 text-center">B</th>
        </tr>
      </thead>
      <tbody>
        {sortedStats.map((player, idx) => {
          const attackPct = player.attackAttempts && player.attackAttempts > 0
            ? ((player.kills - (player.attackErrors ?? 0)) / player.attackAttempts).toFixed(3)
            : '.000'
          return (
            <tr
              key={player.playerId}
              className={cn(
                'border-t border-border',
                idx % 2 === 0 && 'bg-background-secondary/50'
              )}
            >
              <td className="px-2 py-2 font-display">
                <span className="text-foreground-muted text-xs mr-2">
                  {player.jerseyNumber ?? '-'}
                </span>
                <span className={cn(
                  'font-medium',
                  player.isStarter && 'text-neon-yellow'
                )}>
                  {player.playerName}
                </span>
              </td>
              <td className="px-2 py-2 text-center font-bold text-neon-green">{player.kills}</td>
              <td className="px-2 py-2 text-center text-foreground-muted">{player.attackErrors ?? 0}</td>
              <td className="px-2 py-2 text-center text-foreground-muted">{player.attackAttempts ?? 0}</td>
              <td className="px-2 py-2 text-center">{attackPct}</td>
              <td className="px-2 py-2 text-center">{player.aces}</td>
              <td className="px-2 py-2 text-center">{player.digs}</td>
              <td className="px-2 py-2 text-center">{player.blocksTotal}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function FootballStatsTable({ stats }: { stats: FootballPlayerStat[] }) {
  // Group by category: passers, rushers, receivers
  const passers = stats.filter(p => (p.passAttempts ?? 0) > 0)
  const rushers = stats.filter(p => (p.rushAttempts ?? 0) > 0)
  const receivers = stats.filter(p => (p.receptions ?? 0) > 0)

  return (
    <div className="space-y-4 p-2">
      {passers.length > 0 && (
        <div>
          <h4 className="text-xs font-display font-bold text-foreground-muted uppercase mb-2">Passing</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background-tertiary text-foreground-muted text-[10px] uppercase">
                <th scope="col" className="px-2 py-1 text-left">Player</th>
                <th scope="col" className="px-2 py-1 text-center">C/A</th>
                <th scope="col" className="px-2 py-1 text-center">YDS</th>
                <th scope="col" className="px-2 py-1 text-center">TD</th>
                <th scope="col" className="px-2 py-1 text-center">INT</th>
              </tr>
            </thead>
            <tbody>
              {passers.map((p) => (
                <tr key={p.playerId} className="border-t border-border">
                  <td className="px-2 py-1 font-display">{p.playerName}</td>
                  <td className="px-2 py-1 text-center">{p.completions ?? 0}/{p.passAttempts ?? 0}</td>
                  <td className="px-2 py-1 text-center font-bold text-neon-green">{p.passingYards ?? 0}</td>
                  <td className="px-2 py-1 text-center">{p.passingTds ?? 0}</td>
                  <td className="px-2 py-1 text-center text-neon-pink">{p.interceptions ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rushers.length > 0 && (
        <div>
          <h4 className="text-xs font-display font-bold text-foreground-muted uppercase mb-2">Rushing</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background-tertiary text-foreground-muted text-[10px] uppercase">
                <th scope="col" className="px-2 py-1 text-left">Player</th>
                <th scope="col" className="px-2 py-1 text-center">ATT</th>
                <th scope="col" className="px-2 py-1 text-center">YDS</th>
                <th scope="col" className="px-2 py-1 text-center">TD</th>
              </tr>
            </thead>
            <tbody>
              {rushers.map((p) => (
                <tr key={p.playerId} className="border-t border-border">
                  <td className="px-2 py-1 font-display">{p.playerName}</td>
                  <td className="px-2 py-1 text-center">{p.rushAttempts ?? 0}</td>
                  <td className="px-2 py-1 text-center font-bold text-neon-green">{p.rushingYards ?? 0}</td>
                  <td className="px-2 py-1 text-center">{p.rushingTds ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {receivers.length > 0 && (
        <div>
          <h4 className="text-xs font-display font-bold text-foreground-muted uppercase mb-2">Receiving</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background-tertiary text-foreground-muted text-[10px] uppercase">
                <th scope="col" className="px-2 py-1 text-left">Player</th>
                <th scope="col" className="px-2 py-1 text-center">REC</th>
                <th scope="col" className="px-2 py-1 text-center">YDS</th>
                <th scope="col" className="px-2 py-1 text-center">TD</th>
              </tr>
            </thead>
            <tbody>
              {receivers.map((p) => (
                <tr key={p.playerId} className="border-t border-border">
                  <td className="px-2 py-1 font-display">{p.playerName}</td>
                  <td className="px-2 py-1 text-center">{p.receptions ?? 0}</td>
                  <td className="px-2 py-1 text-center font-bold text-neon-green">{p.receivingYards ?? 0}</td>
                  <td className="px-2 py-1 text-center">{p.receivingTds ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function GenericStatsTable({ stats }: { stats: BasePlayerStat[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-background-tertiary text-foreground-muted text-[10px] uppercase tracking-wider">
          <th scope="col" className="px-2 py-2 text-left">Player</th>
          <th scope="col" className="px-2 py-2 text-center">Starter</th>
        </tr>
      </thead>
      <tbody>
        {stats.map((player, idx) => (
          <tr
            key={player.playerId}
            className={cn(
              'border-t border-border',
              idx % 2 === 0 && 'bg-background-secondary/50'
            )}
          >
            <td className="px-2 py-2 font-display">
              <span className="text-foreground-muted text-xs mr-2">
                {player.jerseyNumber ?? '-'}
              </span>
              <span className="font-medium">{player.playerName}</span>
            </td>
            <td className="px-2 py-2 text-center">
              {player.isStarter ? (
                <span className="text-neon-yellow">★</span>
              ) : (
                <span className="text-foreground-muted">-</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Empty state component
export function BoxScoreEmpty({ className }: { className?: string }) {
  return (
    <div className={cn(
      'border-2 border-border bg-background-secondary p-8 text-center',
      className
    )}>
      <p className="font-display text-foreground-muted">
        No box score available for this game
      </p>
      <p className="text-sm text-foreground-subtle mt-2">
        Player statistics will appear here once submitted
      </p>
    </div>
  )
}
