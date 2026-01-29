'use client'

import { useMemo, useState, useCallback } from 'react'
import { Loader2, Trophy, Pencil, Save, X, Check } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { LeagueStandings, TeamStanding } from '@/lib/standings-calculator'

export interface RecordEdit {
  schoolId: string
  overallWins: number
  overallLosses: number
  overallTies: number
  leagueWins: number
  leagueLosses: number
  leagueTies: number
}

interface StandingsPreviewProps {
  standings: LeagueStandings | null
  isLoading?: boolean
  league: string
  division: string
  region?: string | null
  editable?: boolean
  onSaveRecord?: (edit: RecordEdit) => Promise<void>
}

export function StandingsPreview({
  standings,
  isLoading,
  league,
  division,
  region,
  editable = false,
  onSaveRecord,
}: StandingsPreviewProps) {
  const locationText = region
    ? `${league} ${division} ${region}`
    : `${league} ${division}`

  // Editing state
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<RecordEdit | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Start editing a team's record
  const handleStartEdit = useCallback((team: TeamStanding) => {
    setEditingTeamId(team.school.id)
    setEditValues({
      schoolId: team.school.id,
      overallWins: team.wins,
      overallLosses: team.losses,
      overallTies: team.ties,
      leagueWins: team.leagueWins,
      leagueLosses: team.leagueLosses,
      leagueTies: team.leagueTies,
    })
  }, [])

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditingTeamId(null)
    setEditValues(null)
  }, [])

  // Save edited record
  const handleSaveEdit = useCallback(async () => {
    if (!editValues || !onSaveRecord) return

    setIsSaving(true)
    try {
      await onSaveRecord(editValues)
      setEditingTeamId(null)
      setEditValues(null)
    } catch (err) {
      console.error('Failed to save record:', err)
    } finally {
      setIsSaving(false)
    }
  }, [editValues, onSaveRecord])

  // Update edit value
  const updateEditValue = useCallback((field: keyof RecordEdit, value: number) => {
    if (!editValues) return
    setEditValues({ ...editValues, [field]: Math.max(0, value) })
  }, [editValues])

  // Format record string
  const formatRecord = (w: number, l: number, t: number) => {
    if (t > 0) return `${w}-${l}-${t}`
    return `${w}-${l}`
  }

  // Number input component
  const NumberInput = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <input
      type="number"
      min="0"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      className="w-10 h-6 text-center text-xs border border-border bg-background text-foreground rounded"
      aria-label={label}
    />
  )

  return (
    <Card className="flex flex-col h-full">
      <div className="p-3 border-b-2 border-border bg-background-secondary flex-shrink-0">
        <h3 className="font-display font-bold text-neon-green uppercase tracking-wider text-sm">
          Computed Standings
        </h3>
        <p className="text-xs text-foreground-muted mt-1">{locationText}</p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-neon-yellow" />
          </div>
        ) : !standings || standings.teams.length === 0 ? (
          <div className="p-4 text-center text-foreground-muted text-sm">
            <Trophy className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No standings data yet.</p>
            <p className="text-xs mt-1">Assign teams and play games to see standings.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border bg-background-tertiary">
                <th className="p-2 text-left font-display text-xs font-bold text-foreground-muted uppercase tracking-wider w-8">
                  #
                </th>
                <th className="p-2 text-left font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">
                  Team
                </th>
                <th className="p-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">
                  Overall
                </th>
                <th className="p-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">
                  League
                </th>
                {editable && (
                  <th className="p-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider w-16">
                    Edit
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {standings.teams.map((team, index) => {
                const isEditing = editingTeamId === team.school.id

                return (
                  <tr
                    key={team.school.id}
                    className={cn(
                      'border-b border-border hover:bg-background-tertiary transition-colors',
                      index === 0 && 'bg-neon-yellow/5',
                      isEditing && 'bg-neon-blue/10'
                    )}
                  >
                    <td className="p-2">
                      <span className={cn(
                        'font-mono text-sm',
                        index === 0 && 'text-neon-yellow font-bold'
                      )}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="font-display font-bold text-foreground">
                        {team.school.short_name}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      {isEditing && editValues ? (
                        <div className="flex items-center justify-center gap-1">
                          <NumberInput
                            value={editValues.overallWins}
                            onChange={(v) => updateEditValue('overallWins', v)}
                            label="Overall Wins"
                          />
                          <span className="text-foreground-muted">-</span>
                          <NumberInput
                            value={editValues.overallLosses}
                            onChange={(v) => updateEditValue('overallLosses', v)}
                            label="Overall Losses"
                          />
                          <span className="text-foreground-muted">-</span>
                          <NumberInput
                            value={editValues.overallTies}
                            onChange={(v) => updateEditValue('overallTies', v)}
                            label="Overall Ties"
                          />
                        </div>
                      ) : (
                        <span className="font-mono text-foreground-muted">
                          {formatRecord(team.wins, team.losses, team.ties)}
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {isEditing && editValues ? (
                        <div className="flex items-center justify-center gap-1">
                          <NumberInput
                            value={editValues.leagueWins}
                            onChange={(v) => updateEditValue('leagueWins', v)}
                            label="League Wins"
                          />
                          <span className="text-foreground-muted">-</span>
                          <NumberInput
                            value={editValues.leagueLosses}
                            onChange={(v) => updateEditValue('leagueLosses', v)}
                            label="League Losses"
                          />
                          <span className="text-foreground-muted">-</span>
                          <NumberInput
                            value={editValues.leagueTies}
                            onChange={(v) => updateEditValue('leagueTies', v)}
                            label="League Ties"
                          />
                        </div>
                      ) : (
                        <span className={cn(
                          'font-mono',
                          team.leagueGamesPlayed > 0 ? 'text-foreground' : 'text-foreground-muted'
                        )}>
                          {team.leagueGamesPlayed > 0
                            ? formatRecord(team.leagueWins, team.leagueLosses, team.leagueTies)
                            : '-'
                          }
                        </span>
                      )}
                    </td>
                    {editable && (
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={handleSaveEdit}
                              disabled={isSaving}
                              className="p-1 text-neon-green hover:bg-neon-green/20 rounded disabled:opacity-50"
                              aria-label="Save changes"
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="p-1 text-neon-pink hover:bg-neon-pink/20 rounded disabled:opacity-50"
                              aria-label="Cancel editing"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(team)}
                            className="p-1 text-foreground-muted hover:text-neon-blue hover:bg-neon-blue/20 rounded"
                            aria-label={`Edit ${team.school.short_name} record`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {standings && standings.teams.length > 0 && (
        <div className="p-2 border-t border-border bg-background-secondary text-xs text-foreground-muted text-center flex-shrink-0">
          Sorted by league record, then overall record
        </div>
      )}
    </Card>
  )
}
