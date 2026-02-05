'use client'

import { useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Trophy,
  Clock,
  Minus,
  Save,
  X,
  BarChart2,
} from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { cn, formatGameTime, isGameLive, isGameFinal } from '@/lib/utils'
import type { GameWithTeams, GameStatus } from '@/types/database'
import { getHomeSchool, getAwaySchool } from '@/types/database'

export function GameRow({
  game,
  onEdit,
  onDelete,
  onQuickUpdate,
  onEnterStats,
}: {
  game: GameWithTeams
  onEdit: () => void
  onDelete: () => void
  onQuickUpdate: (gameId: string, updates: { home_score?: number; away_score?: number; status?: GameStatus }) => Promise<void>
  onEnterStats: () => void
}) {
  const isLive = isGameLive(game.status)
  const isFinal = isGameFinal(game.status)
  const [isQuickEditing, setIsQuickEditing] = useState(false)
  const [quickHomeScore, setQuickHomeScore] = useState(game.home_score)
  const [quickAwayScore, setQuickAwayScore] = useState(game.away_score)
  const [isSaving, setIsSaving] = useState(false)

  // After migration 072: Get school data from team or directly
  const homeSchool = getHomeSchool(game)
  const awaySchool = getAwaySchool(game)

  const handleQuickSave = async () => {
    setIsSaving(true)
    try {
      await onQuickUpdate(game.id, {
        home_score: quickHomeScore,
        away_score: quickAwayScore,
      })
      setIsQuickEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuickCancel = () => {
    setQuickHomeScore(game.home_score)
    setQuickAwayScore(game.away_score)
    setIsQuickEditing(false)
  }

  const handleQuickStatusChange = async (newStatus: GameStatus) => {
    await onQuickUpdate(game.id, { status: newStatus })
  }

  return (
    <div className={cn(
      'border-2 border-border bg-background-secondary p-4',
      isLive && 'border-neon-pink/50',
      isQuickEditing && 'border-neon-yellow/50'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Status & Sport */}
          <div className="flex items-center gap-2 mb-2">
            {isLive && (
              <Badge variant="destructive" className="text-[10px]">Live</Badge>
            )}
            {isFinal && (
              <Badge variant="secondary" className="text-[10px]">Final</Badge>
            )}
            {game.status === 'scheduled' && (
              <Badge variant="default" className="text-[10px]">Scheduled</Badge>
            )}
            {(game.status === 'postponed' || game.status === 'canceled') && (
              <Badge variant="secondary" className="text-[10px]">{game.status}</Badge>
            )}
            <span className="text-[10px] text-neon-blue font-display font-bold uppercase">
              {game.sport.display_name || game.sport.name}
            </span>
            {game.game_type !== 'regular_season' && (
              <Badge variant="warning" className="text-[10px] gap-1">
                <Trophy className="h-2.5 w-2.5" />
                {game.game_type.replace('_', ' ')}
              </Badge>
            )}
          </div>

          {/* Teams & Score - Quick Edit Mode */}
          {isQuickEditing ? (
            <div className="flex items-center gap-2 font-display">
              <span className="text-foreground font-bold">{awaySchool.short_name}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQuickAwayScore(Math.max(0, quickAwayScore - 1))}
                  className="w-6 h-6 flex items-center justify-center bg-background-tertiary border border-border hover:bg-neon-blue/20 text-sm"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <input
                  type="number"
                  value={quickAwayScore}
                  onChange={(e) => setQuickAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-6 text-center bg-background border-2 border-neon-blue text-neon-blue font-bold text-sm"
                  min="0"
                />
                <button
                  onClick={() => setQuickAwayScore(quickAwayScore + 1)}
                  className="w-6 h-6 flex items-center justify-center bg-background-tertiary border border-border hover:bg-neon-blue/20 text-sm"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <span className="text-foreground-muted">@</span>
              <span className="text-foreground font-bold">{homeSchool.short_name}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQuickHomeScore(Math.max(0, quickHomeScore - 1))}
                  className="w-6 h-6 flex items-center justify-center bg-background-tertiary border border-border hover:bg-neon-pink/20 text-sm"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <input
                  type="number"
                  value={quickHomeScore}
                  onChange={(e) => setQuickHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-6 text-center bg-background border-2 border-neon-pink text-neon-pink font-bold text-sm"
                  min="0"
                />
                <button
                  onClick={() => setQuickHomeScore(quickHomeScore + 1)}
                  className="w-6 h-6 flex items-center justify-center bg-background-tertiary border border-border hover:bg-neon-pink/20 text-sm"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <div
              className="font-display cursor-pointer hover:bg-background-tertiary/50 -mx-2 px-2 py-1 rounded transition-colors"
              onClick={() => setIsQuickEditing(true)}
              title="Click to quick edit score"
            >
              <span className="text-foreground font-bold">{awaySchool.short_name}</span>
              <span className="text-neon-blue font-bold mx-2">{game.away_score}</span>
              <span className="text-foreground-muted">@</span>
              <span className="text-foreground font-bold mx-2">{homeSchool.short_name}</span>
              <span className="text-neon-pink font-bold">{game.home_score}</span>
            </div>
          )}

          {/* Time & Venue */}
          <div className="flex items-center gap-3 mt-1 text-xs text-foreground-subtle">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatGameTime(game.scheduled_at)}
            </span>
            {game.venue && <span>{game.venue}</span>}
          </div>

          {/* Period info if live */}
          {isLive && game.current_period && (
            <p className="text-xs text-neon-pink mt-1">
              {game.current_period}
              {game.time_remaining && ` - ${game.time_remaining}`}
            </p>
          )}

          {/* Quick Status Buttons */}
          {isQuickEditing && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-foreground-muted">Status:</span>
              {(['scheduled', 'in_progress', 'final'] as GameStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleQuickStatusChange(status)}
                  className={cn(
                    'px-2 py-1 text-[10px] font-display font-bold uppercase border',
                    game.status === status
                      ? 'bg-neon-yellow/20 border-neon-yellow text-neon-yellow'
                      : 'bg-background-tertiary border-border text-foreground-muted hover:border-foreground-muted'
                  )}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isQuickEditing ? (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handleQuickCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="icon"
                onClick={handleQuickSave}
                disabled={isSaving}
                className="bg-neon-green hover:bg-neon-green/80"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </>
          ) : (
            <>
              {isFinal && (
                <Button variant="outline" size="icon" onClick={onEnterStats} title="Enter Stats">
                  <BarChart2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={onEdit}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
