'use client'

import { useMemo } from 'react'
import { Image } from 'lucide-react'
import { Input } from '@/components/ui'
import { getPeriodOptions, getPeriodTypeLabel, isInningsBased, type PeriodOption } from '@/lib/sport-periods'
import type { GameWithTeams, Sport, GameStatus, GameType, PeriodsConfig, TeamWithSchool, Tournament, TournamentRound } from '@/types/database'
import { getHomeSchool, getAwaySchool } from '@/types/database'

export interface GameFormData {
  sport_id: string
  home_team_id: string
  away_team_id: string
  scheduled_at: string
  venue: string
  status: GameStatus
  game_type: GameType
  home_score: number
  away_score: number
  current_period: string
  time_remaining: string
  is_verified: boolean
  golden_game: boolean
  photos_url: string
  instagram_url: string
  streaming_url: string
  tournament_id: string
  tournament_round: string
  home_team_source_game_id: string
  home_team_source_type: 'winner' | 'loser' | ''
  away_team_source_game_id: string
  away_team_source_type: 'winner' | 'loser' | ''
}

export const initialFormData: GameFormData = {
  sport_id: '',
  home_team_id: '',
  away_team_id: '',
  scheduled_at: '',
  venue: '',
  status: 'scheduled',
  game_type: 'regular_season',
  home_score: 0,
  away_score: 0,
  current_period: '',
  time_remaining: '',
  is_verified: false,
  golden_game: false,
  photos_url: '',
  instagram_url: '',
  streaming_url: '',
  tournament_id: '',
  tournament_round: '',
  home_team_source_game_id: '',
  home_team_source_type: '',
  away_team_source_game_id: '',
  away_team_source_type: '',
}

// TBD school ID for identifying TBD teams
const TBD_SCHOOL_ID = 'aaaaaaaa-0000-0000-0000-000000000001'

// Tournament round options for dropdown
export const TOURNAMENT_ROUNDS: { value: TournamentRound; label: string }[] = [
  { value: 'play_in', label: 'Play-In' },
  { value: 'round_of_32', label: 'Round of 32' },
  { value: 'round_of_16', label: 'Round of 16' },
  { value: 'quarterfinal', label: 'Quarterfinal' },
  { value: 'semifinal', label: 'Semifinal' },
  { value: 'third_place', label: 'Third Place' },
  { value: 'final', label: 'Final' },
  { value: 'pool_a', label: 'Pool A' },
  { value: 'pool_b', label: 'Pool B' },
  { value: 'pool_c', label: 'Pool C' },
  { value: 'pool_d', label: 'Pool D' },
]

export function GameForm({
  formData,
  onChange,
  sports,
  teams,
  tournaments,
  games,
  isEdit,
  editingGame,
}: {
  formData: GameFormData
  onChange: (field: keyof GameFormData, value: string | number | boolean) => void
  sports: Sport[]
  teams: TeamWithSchool[]
  tournaments: Tournament[]
  games: GameWithTeams[]
  isEdit: boolean
  editingGame?: GameWithTeams | null
}) {
  // Filter teams by selected sport for the form dropdowns
  const teamsForSelectedSport = formData.sport_id
    ? teams.filter((t) => t.sport_id === formData.sport_id)
    : []

  // Filter tournaments by selected sport
  const tournamentsForSelectedSport = formData.sport_id
    ? tournaments.filter((t) => t.sport_id === formData.sport_id)
    : []

  // Group teams by school for better display
  // Division II teams show with "II" suffix
  const teamOptions = teamsForSelectedSport
    .map((t) => {
      const divisionSuffix = t.division === 'Division II' ? ' II' : ''
      const genderLabel = t.gender === 'boys' ? 'B' : t.gender === 'girls' ? 'G' : 'Co'
      return {
        id: t.id,
        label: `${t.school.short_name}${divisionSuffix} (${genderLabel})`,
        schoolName: t.school.name,
        gender: t.gender,
        division: t.division,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))

  // Check if selected teams are TBD teams
  const selectedAwayTeam = teamsForSelectedSport.find(t => t.id === formData.away_team_id)
  const selectedHomeTeam = teamsForSelectedSport.find(t => t.id === formData.home_team_id)
  const isAwayTeamTBD = selectedAwayTeam?.school?.id === TBD_SCHOOL_ID
  const isHomeTeamTBD = selectedHomeTeam?.school?.id === TBD_SCHOOL_ID

  // Get tournament games for "Winner of Game X" dropdown
  // Only show games from the same tournament (excluding the current game being edited)
  const tournamentGamesForSource = useMemo(() => {
    if (!formData.tournament_id) return []
    return games
      .filter(g => g.tournament_id === formData.tournament_id)
      .filter(g => !editingGame || g.id !== editingGame.id) // Exclude current game
      .map(g => {
        const homeSchool = getHomeSchool(g).short_name
        const awaySchool = getAwaySchool(g).short_name
        const roundLabel = g.tournament_round
          ? TOURNAMENT_ROUNDS.find(r => r.value === g.tournament_round)?.label || g.tournament_round
          : ''
        return {
          id: g.id,
          label: `${roundLabel}: ${awaySchool} vs ${homeSchool}`,
          round: g.tournament_round,
          status: g.status,
        }
      })
      .sort((a, b) => {
        // Sort by round order
        const roundOrder = ['play_in', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']
        return roundOrder.indexOf(a.round || '') - roundOrder.indexOf(b.round || '')
      })
  }, [formData.tournament_id, games, editingGame])

  // Get the selected sport for period options
  const selectedSport = isEdit && editingGame
    ? editingGame.sport
    : sports.find(s => s.id === formData.sport_id)

  const periodsConfig = selectedSport?.periods_config as PeriodsConfig | null
  const periodOptions = getPeriodOptions(periodsConfig)
  const periodLabel = getPeriodTypeLabel(periodsConfig)
  const showInningsHalf = isInningsBased(periodsConfig)

  return (
    <div className="space-y-4">
      {!isEdit && (
        <>
          {/* Sport */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Sport *</label>
            <select
              value={formData.sport_id}
              onChange={(e) => onChange('sport_id', e.target.value)}
              className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
            >
              <option value="">Select sport...</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.display_name || sport.name}
                </option>
              ))}
            </select>
          </div>

          {/* Teams */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground mb-1">Away Team *</label>
              <select
                value={formData.away_team_id}
                onChange={(e) => {
                  onChange('away_team_id', e.target.value)
                  // Clear source game when team changes
                  onChange('away_team_source_game_id', '')
                  onChange('away_team_source_type', '')
                }}
                className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                disabled={!formData.sport_id}
              >
                <option value="">{formData.sport_id ? 'Select team...' : 'Select sport first'}</option>
                {teamOptions.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.label}
                  </option>
                ))}
              </select>
              {/* Show "Determined by" when TBD team is selected */}
              {isAwayTeamTBD && formData.tournament_id && (
                <div className="p-2 bg-neon-yellow/10 border border-neon-yellow/30 rounded">
                  <label className="block text-xs font-medium text-neon-yellow mb-1">
                    Determined by:
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.away_team_source_type}
                      onChange={(e) => onChange('away_team_source_type', e.target.value)}
                      className="flex-shrink-0 h-8 px-2 border border-border bg-background text-foreground text-xs"
                    >
                      <option value="">Select...</option>
                      <option value="winner">Winner of</option>
                      <option value="loser">Loser of</option>
                    </select>
                    {formData.away_team_source_type && (
                      <select
                        value={formData.away_team_source_game_id}
                        onChange={(e) => onChange('away_team_source_game_id', e.target.value)}
                        className="flex-1 h-8 px-2 border border-border bg-background text-foreground text-xs"
                      >
                        <option value="">Select game...</option>
                        {tournamentGamesForSource.map((game) => (
                          <option key={game.id} value={game.id}>
                            {game.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}
              {isAwayTeamTBD && !formData.tournament_id && (
                <p className="text-xs text-neon-yellow">Select a tournament to link to source game</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground mb-1">Home Team *</label>
              <select
                value={formData.home_team_id}
                onChange={(e) => {
                  onChange('home_team_id', e.target.value)
                  // Clear source game when team changes
                  onChange('home_team_source_game_id', '')
                  onChange('home_team_source_type', '')
                }}
                className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                disabled={!formData.sport_id}
              >
                <option value="">{formData.sport_id ? 'Select team...' : 'Select sport first'}</option>
                {teamOptions.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.label}
                  </option>
                ))}
              </select>
              {/* Show "Determined by" when TBD team is selected */}
              {isHomeTeamTBD && formData.tournament_id && (
                <div className="p-2 bg-neon-yellow/10 border border-neon-yellow/30 rounded">
                  <label className="block text-xs font-medium text-neon-yellow mb-1">
                    Determined by:
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.home_team_source_type}
                      onChange={(e) => onChange('home_team_source_type', e.target.value)}
                      className="flex-shrink-0 h-8 px-2 border border-border bg-background text-foreground text-xs"
                    >
                      <option value="">Select...</option>
                      <option value="winner">Winner of</option>
                      <option value="loser">Loser of</option>
                    </select>
                    {formData.home_team_source_type && (
                      <select
                        value={formData.home_team_source_game_id}
                        onChange={(e) => onChange('home_team_source_game_id', e.target.value)}
                        className="flex-1 h-8 px-2 border border-border bg-background text-foreground text-xs"
                      >
                        <option value="">Select game...</option>
                        {tournamentGamesForSource.map((game) => (
                          <option key={game.id} value={game.id}>
                            {game.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}
              {isHomeTeamTBD && !formData.tournament_id && (
                <p className="text-xs text-neon-yellow">Select a tournament to link to source game</p>
              )}
            </div>
          </div>

        </>
      )}

      {/* Date/Time — always editable so games can be rescheduled */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Scheduled Date/Time *</label>
        <Input
          type="datetime-local"
          value={formData.scheduled_at}
          onChange={(e) => onChange('scheduled_at', e.target.value)}
        />
      </div>

      {/* Venue */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Venue</label>
        <Input
          placeholder="e.g., Aloha Stadium"
          value={formData.venue}
          onChange={(e) => onChange('venue', e.target.value)}
        />
      </div>

      {/* Status & Game Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => onChange('status', e.target.value as GameStatus)}
            className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
          >
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="final">Final</option>
            <option value="postponed">Postponed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Game Type</label>
          <select
            value={formData.game_type}
            onChange={(e) => onChange('game_type', e.target.value as GameType)}
            className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
          >
            <option value="regular_season">Regular Season</option>
            <option value="playoff">Playoff</option>
            <option value="championship">Championship</option>
            <option value="tournament">Tournament</option>
            <option value="exhibition">Exhibition</option>
            <option value="scrimmage">Scrimmage</option>
          </select>
        </div>
      </div>

      {/* Tournament Association */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Tournament
            <span className="text-foreground-muted font-normal ml-1">(optional)</span>
          </label>
          <select
            value={formData.tournament_id}
            onChange={(e) => onChange('tournament_id', e.target.value)}
            className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
            disabled={!formData.sport_id}
          >
            <option value="">None (Regular Season)</option>
            {tournamentsForSelectedSport.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.league ? `${tournament.league} ` : ''}
                {tournament.division ? `${tournament.division} ` : ''}
                {tournament.name}
              </option>
            ))}
          </select>
          {!formData.sport_id && (
            <p className="text-xs text-foreground-muted mt-1">Select a sport first</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Tournament Round
            <span className="text-foreground-muted font-normal ml-1">(optional)</span>
          </label>
          <select
            value={formData.tournament_round}
            onChange={(e) => onChange('tournament_round', e.target.value)}
            className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
            disabled={!formData.tournament_id}
          >
            <option value="">Select round...</option>
            {TOURNAMENT_ROUNDS.map((round) => (
              <option key={round.value} value={round.value}>
                {round.label}
              </option>
            ))}
          </select>
          {!formData.tournament_id && formData.sport_id && (
            <p className="text-xs text-foreground-muted mt-1">Select a tournament first</p>
          )}
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Away Score</label>
          <Input
            type="number"
            min="0"
            value={formData.away_score}
            onChange={(e) => onChange('away_score', parseInt(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Home Score</label>
          <Input
            type="number"
            min="0"
            value={formData.home_score}
            onChange={(e) => onChange('home_score', parseInt(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
          />
        </div>
      </div>

      {/* Period & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Current {periodLabel}
          </label>
          {selectedSport ? (
            <select
              value={formData.current_period}
              onChange={(e) => onChange('current_period', e.target.value)}
              className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
            >
              <option value="">Not started / Clear</option>
              {periodOptions.map((option) => (
                <option
                  key={option.value}
                  value={showInningsHalf ? `Top ${option.value}` : option.value}
                  className={option.isOvertime ? 'text-neon-pink' : ''}
                >
                  {option.label}
                  {option.isOvertime && ' (OT)'}
                </option>
              ))}
              {showInningsHalf && periodOptions.filter(o => !o.isOvertime).map((option) => (
                <option key={`bot-${option.value}`} value={`Bot ${option.value}`}>
                  Bot {option.label}
                </option>
              ))}
            </select>
          ) : (
            <Input
              placeholder="Select a sport first"
              value={formData.current_period}
              onChange={(e) => onChange('current_period', e.target.value)}
              disabled={!isEdit}
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Time Remaining</label>
          <Input
            placeholder="e.g., 5:42"
            value={formData.time_remaining}
            onChange={(e) => onChange('time_remaining', e.target.value)}
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_verified}
            onChange={(e) => onChange('is_verified', e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-foreground">Verified</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.golden_game}
            onChange={(e) => onChange('golden_game', e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-foreground">Golden Game (3x pts)</span>
        </label>
      </div>

      {/* Media Links */}
      <div className="border-t border-border pt-4 mt-4">
        <h4 className="font-display font-bold text-sm mb-3 text-foreground-muted uppercase tracking-wider flex items-center gap-2">
          <Image className="h-4 w-4" />
          Game Media
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1">Photos URL</label>
            <Input
              placeholder="Link to game photos (e.g., Google Drive, Flickr)"
              value={formData.photos_url}
              onChange={(e) => onChange('photos_url', e.target.value)}
              disabled
              className="opacity-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1">Instagram Post URL</label>
            <Input
              placeholder="https://instagram.com/p/..."
              value={formData.instagram_url}
              onChange={(e) => onChange('instagram_url', e.target.value)}
              disabled
              className="opacity-50 cursor-not-allowed"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground-muted mb-1">Live Stream URL</label>
            <Input
              placeholder="https://youtube.com/watch?v=... or NFHS Network link"
              value={formData.streaming_url}
              onChange={(e) => onChange('streaming_url', e.target.value)}
              disabled
              className="opacity-50 cursor-not-allowed"
            />
          </div>
          <p className="md:col-span-2 text-xs text-foreground-muted -mt-2">Coming soon — requires database migration</p>
        </div>
      </div>
    </div>
  )
}
