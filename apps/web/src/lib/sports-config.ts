// Sports-specific stat field configuration
// Defines which stat fields to show for each sport and their display settings

export interface StatField {
  // Database column name in player_game_stats
  key: string
  // Display label
  label: string
  // Short label for compact display
  shortLabel: string
  // Input type
  type: 'integer' | 'decimal'
  // Whether this is an MVP (always visible) field or expanded field
  isMvp: boolean
  // Minimum value (usually 0)
  min?: number
  // Maximum reasonable value (for validation hints)
  max?: number
  // Step for decimal inputs
  step?: number
}

export interface SportStatConfig {
  sportCode: string
  displayName: string
  mvpFields: StatField[]
  expandedFields: StatField[]
}

// Basketball configuration
const basketballConfig: SportStatConfig = {
  sportCode: 'basketball',
  displayName: 'Basketball',
  mvpFields: [
    { key: 'points', label: 'Points', shortLabel: 'PTS', type: 'integer', isMvp: true, min: 0 },
    { key: 'rebounds_offensive', label: 'Offensive Rebounds', shortLabel: 'OREB', type: 'integer', isMvp: false, min: 0 },
    { key: 'rebounds_defensive', label: 'Defensive Rebounds', shortLabel: 'DREB', type: 'integer', isMvp: false, min: 0 },
    { key: 'assists', label: 'Assists', shortLabel: 'AST', type: 'integer', isMvp: true, min: 0 },
  ],
  expandedFields: [
    { key: 'field_goals_made', label: 'Field Goals Made', shortLabel: 'FGM', type: 'integer', isMvp: false, min: 0 },
    { key: 'field_goals_attempted', label: 'Field Goals Attempted', shortLabel: 'FGA', type: 'integer', isMvp: false, min: 0 },
    { key: 'three_pointers_made', label: '3-Pointers Made', shortLabel: '3PM', type: 'integer', isMvp: false, min: 0 },
    { key: 'three_pointers_attempted', label: '3-Pointers Attempted', shortLabel: '3PA', type: 'integer', isMvp: false, min: 0 },
    { key: 'free_throws_made', label: 'Free Throws Made', shortLabel: 'FTM', type: 'integer', isMvp: false, min: 0 },
    { key: 'free_throws_attempted', label: 'Free Throws Attempted', shortLabel: 'FTA', type: 'integer', isMvp: false, min: 0 },
    { key: 'steals', label: 'Steals', shortLabel: 'STL', type: 'integer', isMvp: false, min: 0 },
    { key: 'blocks', label: 'Blocks', shortLabel: 'BLK', type: 'integer', isMvp: false, min: 0 },
    { key: 'turnovers', label: 'Turnovers', shortLabel: 'TO', type: 'integer', isMvp: false, min: 0 },
    { key: 'fouls', label: 'Fouls', shortLabel: 'PF', type: 'integer', isMvp: false, min: 0, max: 5 },
    { key: 'minutes_played', label: 'Minutes Played', shortLabel: 'MIN', type: 'integer', isMvp: false, min: 0 },
  ],
}

// Football configuration - simplified to TDs + Total Yards
const footballConfig: SportStatConfig = {
  sportCode: 'football',
  displayName: 'Football',
  mvpFields: [
    { key: 'rushing_tds', label: 'Rushing TDs', shortLabel: 'RUSH TD', type: 'integer', isMvp: true, min: 0 },
    { key: 'receiving_tds', label: 'Receiving TDs', shortLabel: 'REC TD', type: 'integer', isMvp: true, min: 0 },
    { key: 'passing_tds', label: 'Passing TDs', shortLabel: 'PASS TD', type: 'integer', isMvp: true, min: 0 },
    { key: 'rushing_yards', label: 'Rushing Yards', shortLabel: 'RUSH YDS', type: 'integer', isMvp: true },
    { key: 'receiving_yards', label: 'Receiving Yards', shortLabel: 'REC YDS', type: 'integer', isMvp: true },
    { key: 'passing_yards', label: 'Passing Yards', shortLabel: 'PASS YDS', type: 'integer', isMvp: true },
  ],
  expandedFields: [
    { key: 'completions', label: 'Completions', shortLabel: 'COMP', type: 'integer', isMvp: false, min: 0 },
    { key: 'pass_attempts', label: 'Pass Attempts', shortLabel: 'ATT', type: 'integer', isMvp: false, min: 0 },
    { key: 'passing_ints', label: 'Interceptions Thrown', shortLabel: 'INT', type: 'integer', isMvp: false, min: 0 },
    { key: 'rushing_attempts', label: 'Rushing Attempts', shortLabel: 'CAR', type: 'integer', isMvp: false, min: 0 },
    { key: 'receptions', label: 'Receptions', shortLabel: 'REC', type: 'integer', isMvp: false, min: 0 },
    { key: 'tackles', label: 'Tackles', shortLabel: 'TCKL', type: 'integer', isMvp: false, min: 0 },
    { key: 'sacks', label: 'Sacks', shortLabel: 'SACK', type: 'decimal', isMvp: false, min: 0, step: 0.5 },
    { key: 'interceptions', label: 'Interceptions', shortLabel: 'INT', type: 'integer', isMvp: false, min: 0 },
  ],
}

// Soccer configuration
const soccerConfig: SportStatConfig = {
  sportCode: 'soccer',
  displayName: 'Soccer',
  mvpFields: [
    { key: 'goals', label: 'Goals', shortLabel: 'G', type: 'integer', isMvp: true, min: 0 },
    { key: 'assists_soccer', label: 'Assists', shortLabel: 'A', type: 'integer', isMvp: true, min: 0 },
  ],
  expandedFields: [
    { key: 'shots', label: 'Shots', shortLabel: 'SH', type: 'integer', isMvp: false, min: 0 },
    { key: 'shots_on_target', label: 'Shots on Target', shortLabel: 'SOT', type: 'integer', isMvp: false, min: 0 },
    { key: 'saves', label: 'Saves (GK)', shortLabel: 'SV', type: 'integer', isMvp: false, min: 0 },
    { key: 'yellow_cards', label: 'Yellow Cards', shortLabel: 'YC', type: 'integer', isMvp: false, min: 0, max: 2 },
    { key: 'red_cards', label: 'Red Cards', shortLabel: 'RC', type: 'integer', isMvp: false, min: 0, max: 1 },
    { key: 'minutes_played', label: 'Minutes Played', shortLabel: 'MIN', type: 'integer', isMvp: false, min: 0 },
  ],
}

// Volleyball configuration
const volleyballConfig: SportStatConfig = {
  sportCode: 'volleyball',
  displayName: 'Volleyball',
  mvpFields: [
    { key: 'kills', label: 'Kills', shortLabel: 'K', type: 'integer', isMvp: true, min: 0 },
    { key: 'aces', label: 'Aces', shortLabel: 'A', type: 'integer', isMvp: true, min: 0 },
    { key: 'digs', label: 'Digs', shortLabel: 'D', type: 'integer', isMvp: true, min: 0 },
  ],
  expandedFields: [
    { key: 'errors_attack', label: 'Attack Errors', shortLabel: 'AE', type: 'integer', isMvp: false, min: 0 },
    { key: 'attack_attempts', label: 'Attack Attempts', shortLabel: 'ATT', type: 'integer', isMvp: false, min: 0 },
    { key: 'serve_errors', label: 'Serve Errors', shortLabel: 'SE', type: 'integer', isMvp: false, min: 0 },
    { key: 'blocks_solo', label: 'Solo Blocks', shortLabel: 'BS', type: 'integer', isMvp: false, min: 0 },
    { key: 'blocks_assist', label: 'Block Assists', shortLabel: 'BA', type: 'integer', isMvp: false, min: 0 },
  ],
}

// Baseball/Softball configuration
const baseballConfig: SportStatConfig = {
  sportCode: 'baseball',
  displayName: 'Baseball',
  mvpFields: [
    { key: 'runs', label: 'Runs', shortLabel: 'R', type: 'integer', isMvp: true, min: 0 },
    { key: 'rbis', label: 'RBIs', shortLabel: 'RBI', type: 'integer', isMvp: true, min: 0 },
    { key: 'hits', label: 'Hits', shortLabel: 'H', type: 'integer', isMvp: true, min: 0 },
  ],
  expandedFields: [
    { key: 'at_bats', label: 'At Bats', shortLabel: 'AB', type: 'integer', isMvp: false, min: 0 },
    { key: 'doubles', label: 'Doubles', shortLabel: '2B', type: 'integer', isMvp: false, min: 0 },
    { key: 'triples', label: 'Triples', shortLabel: '3B', type: 'integer', isMvp: false, min: 0 },
    { key: 'home_runs', label: 'Home Runs', shortLabel: 'HR', type: 'integer', isMvp: false, min: 0 },
    { key: 'walks', label: 'Walks', shortLabel: 'BB', type: 'integer', isMvp: false, min: 0 },
    { key: 'strikeouts_batting', label: 'Strikeouts', shortLabel: 'K', type: 'integer', isMvp: false, min: 0 },
    { key: 'stolen_bases', label: 'Stolen Bases', shortLabel: 'SB', type: 'integer', isMvp: false, min: 0 },
    // Pitching stats
    { key: 'innings_pitched', label: 'Innings Pitched', shortLabel: 'IP', type: 'decimal', isMvp: false, min: 0, step: 0.1 },
    { key: 'hits_allowed', label: 'Hits Allowed', shortLabel: 'HA', type: 'integer', isMvp: false, min: 0 },
    { key: 'runs_allowed', label: 'Runs Allowed', shortLabel: 'RA', type: 'integer', isMvp: false, min: 0 },
    { key: 'earned_runs', label: 'Earned Runs', shortLabel: 'ER', type: 'integer', isMvp: false, min: 0 },
    { key: 'strikeouts_pitching', label: 'Strikeouts (P)', shortLabel: 'SO', type: 'integer', isMvp: false, min: 0 },
    { key: 'walks_pitching', label: 'Walks (P)', shortLabel: 'BBP', type: 'integer', isMvp: false, min: 0 },
  ],
}

// Softball uses same config as baseball
const softballConfig: SportStatConfig = {
  ...baseballConfig,
  sportCode: 'softball',
  displayName: 'Softball',
}

// Map of sport codes to their configurations
export const SPORT_STAT_CONFIGS: Record<string, SportStatConfig> = {
  basketball: basketballConfig,
  'boys-basketball': basketballConfig,
  'girls-basketball': basketballConfig,
  football: footballConfig,
  soccer: soccerConfig,
  'boys-soccer': soccerConfig,
  'girls-soccer': soccerConfig,
  volleyball: volleyballConfig,
  'boys-volleyball': volleyballConfig,
  'girls-volleyball': volleyballConfig,
  baseball: baseballConfig,
  softball: softballConfig,
}

// Get sport config by sport code or name
export function getSportStatConfig(sportCodeOrName: string): SportStatConfig | null {
  const normalizedCode = sportCodeOrName.toLowerCase().replace(/\s+/g, '-')
  return SPORT_STAT_CONFIGS[normalizedCode] || null
}

// Get all stat fields for a sport (MVP + expanded)
export function getAllStatFields(sportCode: string): StatField[] {
  const config = getSportStatConfig(sportCode)
  if (!config) return []
  return [...config.mvpFields, ...config.expandedFields]
}

// Get only MVP (always visible) fields for a sport
export function getMvpStatFields(sportCode: string): StatField[] {
  const config = getSportStatConfig(sportCode)
  if (!config) return []
  return config.mvpFields
}

// Get only expanded (hidden by default) fields for a sport
export function getExpandedStatFields(sportCode: string): StatField[] {
  const config = getSportStatConfig(sportCode)
  if (!config) return []
  return config.expandedFields
}

// Check if a sport has stat tracking enabled
export function sportHasStats(sportCode: string): boolean {
  return getSportStatConfig(sportCode) !== null
}

// Calculate total rebounds from offensive and defensive
export function calculateTotalRebounds(oreb: number | null, dreb: number | null): number {
  return (oreb || 0) + (dreb || 0)
}

// Calculate total touchdowns from rush, rec, pass
export function calculateTotalTouchdowns(
  rushTd: number | null,
  recTd: number | null,
  passTd: number | null
): number {
  return (rushTd || 0) + (recTd || 0) + (passTd || 0)
}

// Calculate total yards from rush, rec, pass
export function calculateTotalYards(
  rushYds: number | null,
  recYds: number | null,
  passYds: number | null
): number {
  return (rushYds || 0) + (recYds || 0) + (passYds || 0)
}
