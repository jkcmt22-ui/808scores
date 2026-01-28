/**
 * Sport period configuration utilities
 * Generates period options based on sport configuration
 */

import type { PeriodsConfig } from '@/types/database'

export interface PeriodOption {
  value: string
  label: string
  isOvertime: boolean
}

/**
 * Generate overtime period names based on sport type
 */
export function getOvertimePeriods(periodsConfig: PeriodsConfig, maxOT: number = 3): string[] {
  const overtimePeriods: string[] = []

  if (!periodsConfig.overtime) return overtimePeriods

  switch (periodsConfig.overtime.type) {
    case 'kansas':
      // Kansas tiebreaker for football - alternating possessions
      for (let i = 1; i <= maxOT; i++) {
        overtimePeriods.push(i === 1 ? 'OT' : `${i}OT`)
      }
      break
    case 'periods':
      // Standard overtime periods (basketball, etc.)
      for (let i = 1; i <= maxOT; i++) {
        overtimePeriods.push(i === 1 ? 'OT' : `${i}OT`)
      }
      break
    case 'golden_goal':
      // Soccer overtime with penalty kicks
      overtimePeriods.push('OT1', 'OT2', 'PKs')
      break
    case 'extra_innings':
      // Baseball/softball extra innings
      const baseInnings = periodsConfig.count
      for (let i = 1; i <= maxOT; i++) {
        overtimePeriods.push(`${baseInnings + i}`)
      }
      break
    default:
      for (let i = 1; i <= maxOT; i++) {
        overtimePeriods.push(i === 1 ? 'OT' : `${i}OT`)
      }
  }

  return overtimePeriods
}

/**
 * Get all period options for a sport (including overtime)
 */
export function getPeriodOptions(periodsConfig: PeriodsConfig | null, includeOvertime: boolean = true): PeriodOption[] {
  if (!periodsConfig) {
    // Default to basketball-style quarters if no config
    return [
      { value: 'Q1', label: 'Q1', isOvertime: false },
      { value: 'Q2', label: 'Q2', isOvertime: false },
      { value: 'Q3', label: 'Q3', isOvertime: false },
      { value: 'Q4', label: 'Q4', isOvertime: false },
      { value: 'OT', label: 'OT', isOvertime: true },
    ]
  }

  const regularPeriods = periodsConfig.names || ['Q1', 'Q2', 'Q3', 'Q4']
  const options: PeriodOption[] = regularPeriods.map(name => ({
    value: name,
    label: name,
    isOvertime: false,
  }))

  if (includeOvertime && periodsConfig.overtime) {
    const overtimePeriods = getOvertimePeriods(periodsConfig)
    overtimePeriods.forEach(name => {
      options.push({
        value: name,
        label: name,
        isOvertime: true,
      })
    })
  }

  return options
}

/**
 * Get period type label for a sport (Quarter, Inning, Set, Half, etc.)
 */
export function getPeriodTypeLabel(periodsConfig: PeriodsConfig | null): string {
  if (!periodsConfig) return 'Period'

  switch (periodsConfig.type) {
    case 'innings':
      return 'Inning'
    case 'sets':
      return 'Set'
    case 'timed':
      // Check the period names to determine if it's quarters or halves
      const names = periodsConfig.names || []
      if (names[0]?.startsWith('Q')) return 'Quarter'
      if (names[0]?.includes('Half')) return 'Half'
      return 'Period'
    default:
      return 'Period'
  }
}

/**
 * Check if a sport uses innings (baseball/softball)
 */
export function isInningsBased(periodsConfig: PeriodsConfig | null): boolean {
  return periodsConfig?.type === 'innings'
}

/**
 * Check if a sport has overtime rules
 */
export function hasOvertimeRules(periodsConfig: PeriodsConfig | null): boolean {
  return periodsConfig?.overtime !== null && periodsConfig?.overtime !== undefined
}

/**
 * Format a period value for display (e.g., "Top 3" for innings)
 */
export function formatPeriodDisplay(
  period: string,
  inningHalf?: 'top' | 'bottom',
  periodsConfig?: PeriodsConfig | null
): string {
  if (!period) return ''

  // For innings-based sports, add top/bottom
  if (periodsConfig?.type === 'innings' && inningHalf) {
    const halfLabel = inningHalf === 'top' ? 'Top' : 'Bot'
    return `${halfLabel} ${period}`
  }

  return period
}

/**
 * Parse a period string to extract inning half if present
 */
export function parsePeriodString(periodString: string): { period: string; inningHalf?: 'top' | 'bottom' } {
  if (!periodString) return { period: '' }

  const lowerPeriod = periodString.toLowerCase()

  if (lowerPeriod.startsWith('top ')) {
    return { period: periodString.slice(4), inningHalf: 'top' }
  }
  if (lowerPeriod.startsWith('bot ') || lowerPeriod.startsWith('bottom ')) {
    const period = lowerPeriod.startsWith('bot ') ? periodString.slice(4) : periodString.slice(7)
    return { period, inningHalf: 'bottom' }
  }

  return { period: periodString }
}
