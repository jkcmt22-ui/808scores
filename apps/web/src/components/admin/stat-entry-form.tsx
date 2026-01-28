'use client'

import { useState, useMemo, useCallback } from 'react'
import { ChevronDown, ChevronUp, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { PlayerGameStats } from '@/types/database'
import type { PlayerWithStats, TeamRosterWithStats, GameWithDetails } from '@/hooks/use-game-stats'
import {
  getSportStatConfig,
  getMvpStatFields,
  getExpandedStatFields,
  type StatField,
} from '@/lib/sports-config'

interface StatEntryFormProps {
  game: GameWithDetails
  homeRoster: TeamRosterWithStats
  awayRoster: TeamRosterWithStats
  onSave: (
    stats: Array<{
      playerId: string
      schoolId: string
      stats: Partial<PlayerGameStats>
    }>
  ) => Promise<boolean>
  isSaving: boolean
}

// Individual stat input component
interface StatInputProps {
  field: StatField
  value: number | null
  onChange: (value: number | null) => void
  disabled?: boolean
}

function StatInput({ field, value, onChange, disabled }: StatInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '') {
      onChange(null)
    } else {
      const num = field.type === 'decimal' ? parseFloat(val) : parseInt(val, 10)
      if (!isNaN(num)) {
        onChange(num)
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      <label className="text-xs text-foreground-muted mb-1 font-mono">
        {field.shortLabel}
      </label>
      <Input
        type="number"
        value={value ?? ''}
        onChange={handleChange}
        min={field.min ?? 0}
        max={field.max}
        step={field.step ?? 1}
        disabled={disabled}
        className="w-16 text-center text-sm h-8 px-1"
        aria-label={field.label}
      />
    </div>
  )
}

// Player stat row component
interface PlayerStatRowProps {
  player: PlayerWithStats
  sportCode: string
  stats: Partial<PlayerGameStats>
  onStatsChange: (stats: Partial<PlayerGameStats>) => void
  disabled?: boolean
}

function PlayerStatRow({ player, sportCode, stats, onStatsChange, disabled }: PlayerStatRowProps) {
  const [expanded, setExpanded] = useState(false)

  const mvpFields = useMemo(() => getMvpStatFields(sportCode), [sportCode])
  const expandedFields = useMemo(() => getExpandedStatFields(sportCode), [sportCode])

  const handleStatChange = useCallback((key: string, value: number | null) => {
    onStatsChange({
      ...stats,
      [key]: value,
    })
  }, [stats, onStatsChange])

  const hasExpandedFields = expandedFields.length > 0

  return (
    <div className="border-b border-border last:border-b-0 py-3">
      <div className="flex items-center gap-4">
        {/* Player info */}
        <div className="w-12 text-center font-mono text-sm text-foreground-muted">
          {player.jerseyNumber ?? '-'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {player.player.first_name} {player.player.last_name}
          </div>
          {player.position && (
            <div className="text-xs text-foreground-muted">{player.position}</div>
          )}
        </div>

        {/* MVP stat fields */}
        <div className="flex items-center gap-2">
          {mvpFields.map((field) => (
            <StatInput
              key={field.key}
              field={field}
              value={(stats[field.key as keyof PlayerGameStats] as number | null) ?? null}
              onChange={(val) => handleStatChange(field.key, val)}
              disabled={disabled}
            />
          ))}
        </div>

        {/* Expand button */}
        {hasExpandedFields && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-foreground-muted hover:text-foreground transition-colors"
            aria-label={expanded ? 'Hide additional stats' : 'Show additional stats'}
            aria-expanded={expanded}
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Expanded fields */}
      {expanded && hasExpandedFields && (
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-3 pl-16">
          {expandedFields.map((field) => (
            <StatInput
              key={field.key}
              field={field}
              value={(stats[field.key as keyof PlayerGameStats] as number | null) ?? null}
              onChange={(val) => handleStatChange(field.key, val)}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Team roster stats table
interface TeamStatsTableProps {
  roster: TeamRosterWithStats
  sportCode: string
  statsMap: Map<string, Partial<PlayerGameStats>>
  onPlayerStatsChange: (playerId: string, stats: Partial<PlayerGameStats>) => void
  disabled?: boolean
}

function TeamStatsTable({ roster, sportCode, statsMap, onPlayerStatsChange, disabled }: TeamStatsTableProps) {
  const mvpFields = useMemo(() => getMvpStatFields(sportCode), [sportCode])

  if (roster.players.length === 0) {
    return (
      <div className="text-center py-8 text-foreground-muted">
        <p>No players on roster for this game.</p>
        <p className="text-sm mt-2">Add players to the team roster first.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 pb-2 border-b-2 border-border mb-2">
        <div className="w-12 text-center text-xs font-mono text-foreground-muted">#</div>
        <div className="flex-1 text-xs font-mono text-foreground-muted">PLAYER</div>
        <div className="flex items-center gap-2">
          {mvpFields.map((field) => (
            <div key={field.key} className="w-16 text-center text-xs font-mono text-foreground-muted">
              {field.shortLabel}
            </div>
          ))}
        </div>
        <div className="w-7" /> {/* Spacer for expand button */}
      </div>

      {/* Player rows */}
      {roster.players.map((playerWithStats) => (
        <PlayerStatRow
          key={playerWithStats.player.id}
          player={playerWithStats}
          sportCode={sportCode}
          stats={statsMap.get(playerWithStats.player.id) || {}}
          onStatsChange={(stats) => onPlayerStatsChange(playerWithStats.player.id, stats)}
          disabled={disabled}
        />
      ))}
    </div>
  )
}

export function StatEntryForm({
  game,
  homeRoster,
  awayRoster,
  onSave,
  isSaving,
}: StatEntryFormProps) {
  // Local state for all player stats
  const [statsMap, setStatsMap] = useState<Map<string, Partial<PlayerGameStats>>>(() => {
    const map = new Map<string, Partial<PlayerGameStats>>()

    // Initialize with existing stats from rosters
    for (const player of homeRoster.players) {
      if (player.stats) {
        map.set(player.player.id, player.stats)
      }
    }
    for (const player of awayRoster.players) {
      if (player.stats) {
        map.set(player.player.id, player.stats)
      }
    }

    return map
  })

  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [activeTab, setActiveTab] = useState('home')

  const sportCode = game.sport.code

  const sportConfig = useMemo(() => getSportStatConfig(sportCode), [sportCode])

  const handlePlayerStatsChange = useCallback((playerId: string, stats: Partial<PlayerGameStats>) => {
    setStatsMap(prev => {
      const newMap = new Map(prev)
      newMap.set(playerId, stats)
      return newMap
    })
    setSaveStatus('idle')
  }, [])

  const handleSave = async () => {
    // Collect all stats to save
    const statsToSave: Array<{
      playerId: string
      schoolId: string
      stats: Partial<PlayerGameStats>
    }> = []

    // Home team stats
    for (const player of homeRoster.players) {
      const playerStats = statsMap.get(player.player.id)
      if (playerStats && Object.keys(playerStats).length > 0) {
        statsToSave.push({
          playerId: player.player.id,
          schoolId: homeRoster.school.id,
          stats: playerStats,
        })
      }
    }

    // Away team stats
    for (const player of awayRoster.players) {
      const playerStats = statsMap.get(player.player.id)
      if (playerStats && Object.keys(playerStats).length > 0) {
        statsToSave.push({
          playerId: player.player.id,
          schoolId: awayRoster.school.id,
          stats: playerStats,
        })
      }
    }

    const success = await onSave(statsToSave)
    setSaveStatus(success ? 'success' : 'error')

    // Reset success status after 3 seconds
    if (success) {
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  if (!sportConfig) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-8 h-8 text-score-amber mx-auto mb-3" />
          <p className="text-foreground-muted">
            Stat tracking is not available for {game.sport.display_name || game.sport.name}.
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Pacific/Honolulu',
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Game Stats Entry</CardTitle>
            <p className="text-sm text-foreground-muted mt-1">
              {homeRoster.school.name} vs {awayRoster.school.name}
            </p>
            <p className="text-xs text-foreground-muted">
              {formatDate(game.scheduled_at)} &bull; {game.sport.display_name || game.sport.name}
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            loading={isSaving}
            className="gap-2"
          >
            {saveStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved!
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4" />
                Retry
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab}>
          <TabsList aria-label="Select team">
            <TabsTrigger value="home">
              {homeRoster.school.short_name || homeRoster.school.name}
            </TabsTrigger>
            <TabsTrigger value="away">
              {awayRoster.school.short_name || awayRoster.school.name}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <TeamStatsTable
              roster={homeRoster}
              sportCode={sportCode}
              statsMap={statsMap}
              onPlayerStatsChange={handlePlayerStatsChange}
              disabled={isSaving}
            />
          </TabsContent>

          <TabsContent value="away">
            <TeamStatsTable
              roster={awayRoster}
              sportCode={sportCode}
              statsMap={statsMap}
              onPlayerStatsChange={handlePlayerStatsChange}
              disabled={isSaving}
            />
          </TabsContent>
        </Tabs>

        {/* Save button at bottom too for convenience */}
        <div className="flex justify-end mt-6 pt-4 border-t border-border">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            loading={isSaving}
            className="gap-2"
          >
            {saveStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved!
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4" />
                Retry
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Stats
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
