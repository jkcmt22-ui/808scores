import { describe, it, expect } from 'vitest'
import {
  getOvertimePeriods,
  getPeriodOptions,
  getPeriodTypeLabel,
  isInningsBased,
  hasOvertimeRules,
  formatPeriodDisplay,
  parsePeriodString,
} from '@/lib/sport-periods'
import type { PeriodsConfig } from '@/types/database'

// Sport configs matching real 808Scores data
const basketballConfig: PeriodsConfig = {
  type: 'timed',
  count: 4,
  names: ['Q1', 'Q2', 'Q3', 'Q4'],
  overtime: { type: 'periods', period_length_minutes: 4 },
}

const footballConfig: PeriodsConfig = {
  type: 'timed',
  count: 4,
  names: ['Q1', 'Q2', 'Q3', 'Q4'],
  overtime: { type: 'kansas' },
}

const soccerConfig: PeriodsConfig = {
  type: 'timed',
  count: 2,
  names: ['1st Half', '2nd Half'],
  overtime: { type: 'golden_goal', period_length_minutes: 15 },
}

const baseballConfig: PeriodsConfig = {
  type: 'innings',
  count: 7,
  names: ['1', '2', '3', '4', '5', '6', '7'],
  overtime: { type: 'extra_innings' },
}

const volleyballConfig: PeriodsConfig = {
  type: 'sets',
  count: 5,
  names: ['Set 1', 'Set 2', 'Set 3', 'Set 4', 'Set 5'],
  overtime: null,
}

describe('getOvertimePeriods', () => {
  it('generates basketball overtime periods', () => {
    const periods = getOvertimePeriods(basketballConfig)
    expect(periods).toEqual(['OT', '2OT', '3OT'])
  })

  it('generates football Kansas tiebreaker periods', () => {
    const periods = getOvertimePeriods(footballConfig)
    expect(periods).toEqual(['OT', '2OT', '3OT'])
  })

  it('generates soccer overtime with PKs', () => {
    const periods = getOvertimePeriods(soccerConfig)
    expect(periods).toEqual(['OT1', 'OT2', 'PKs'])
  })

  it('generates baseball extra innings', () => {
    const periods = getOvertimePeriods(baseballConfig)
    // 7-inning game → extra innings are 8, 9, 10
    expect(periods).toEqual(['8', '9', '10'])
  })

  it('returns empty array when no overtime config', () => {
    const periods = getOvertimePeriods(volleyballConfig)
    expect(periods).toEqual([])
  })

  it('respects custom maxOT parameter', () => {
    const periods = getOvertimePeriods(basketballConfig, 5)
    expect(periods).toEqual(['OT', '2OT', '3OT', '4OT', '5OT'])
  })
})

describe('getPeriodOptions', () => {
  it('returns basketball quarters + overtime', () => {
    const options = getPeriodOptions(basketballConfig)
    expect(options).toHaveLength(7) // 4 quarters + 3 OT
    expect(options[0]).toEqual({ value: 'Q1', label: 'Q1', isOvertime: false })
    expect(options[4]).toEqual({ value: 'OT', label: 'OT', isOvertime: true })
  })

  it('excludes overtime when includeOvertime is false', () => {
    const options = getPeriodOptions(basketballConfig, false)
    expect(options).toHaveLength(4)
    expect(options.every(o => !o.isOvertime)).toBe(true)
  })

  it('returns volleyball sets without overtime', () => {
    const options = getPeriodOptions(volleyballConfig)
    expect(options).toHaveLength(5)
    expect(options.every(o => !o.isOvertime)).toBe(true)
  })

  it('returns default quarters when config is null', () => {
    const options = getPeriodOptions(null)
    expect(options).toHaveLength(5) // Q1-Q4 + OT
    expect(options[0].value).toBe('Q1')
    expect(options[4].value).toBe('OT')
  })
})

describe('getPeriodTypeLabel', () => {
  it('returns Quarter for basketball', () => {
    expect(getPeriodTypeLabel(basketballConfig)).toBe('Quarter')
  })

  it('returns Half for soccer', () => {
    expect(getPeriodTypeLabel(soccerConfig)).toBe('Half')
  })

  it('returns Inning for baseball', () => {
    expect(getPeriodTypeLabel(baseballConfig)).toBe('Inning')
  })

  it('returns Set for volleyball', () => {
    expect(getPeriodTypeLabel(volleyballConfig)).toBe('Set')
  })

  it('returns Period for null config', () => {
    expect(getPeriodTypeLabel(null)).toBe('Period')
  })
})

describe('isInningsBased', () => {
  it('returns true for baseball', () => {
    expect(isInningsBased(baseballConfig)).toBe(true)
  })

  it('returns false for basketball', () => {
    expect(isInningsBased(basketballConfig)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isInningsBased(null)).toBe(false)
  })
})

describe('hasOvertimeRules', () => {
  it('returns true for sports with overtime', () => {
    expect(hasOvertimeRules(basketballConfig)).toBe(true)
    expect(hasOvertimeRules(footballConfig)).toBe(true)
    expect(hasOvertimeRules(soccerConfig)).toBe(true)
    expect(hasOvertimeRules(baseballConfig)).toBe(true)
  })

  it('returns false for volleyball (no overtime)', () => {
    expect(hasOvertimeRules(volleyballConfig)).toBe(false)
  })

  it('returns false for null', () => {
    expect(hasOvertimeRules(null)).toBe(false)
  })
})

describe('formatPeriodDisplay', () => {
  it('returns period as-is for non-innings sports', () => {
    expect(formatPeriodDisplay('Q1', undefined, basketballConfig)).toBe('Q1')
    expect(formatPeriodDisplay('OT', undefined, basketballConfig)).toBe('OT')
  })

  it('adds Top/Bot prefix for innings sports', () => {
    expect(formatPeriodDisplay('3', 'top', baseballConfig)).toBe('Top 3')
    expect(formatPeriodDisplay('5', 'bottom', baseballConfig)).toBe('Bot 5')
  })

  it('returns period without prefix when no inningHalf', () => {
    expect(formatPeriodDisplay('3', undefined, baseballConfig)).toBe('3')
  })

  it('returns empty string for empty period', () => {
    expect(formatPeriodDisplay('', undefined)).toBe('')
  })
})

describe('parsePeriodString', () => {
  it('parses top inning', () => {
    expect(parsePeriodString('Top 3')).toEqual({ period: '3', inningHalf: 'top' })
  })

  it('parses bot inning', () => {
    expect(parsePeriodString('Bot 5')).toEqual({ period: '5', inningHalf: 'bottom' })
  })

  it('parses bottom inning (full word)', () => {
    expect(parsePeriodString('Bottom 7')).toEqual({ period: '7', inningHalf: 'bottom' })
  })

  it('returns just the period for non-inning strings', () => {
    expect(parsePeriodString('Q1')).toEqual({ period: 'Q1' })
    expect(parsePeriodString('OT')).toEqual({ period: 'OT' })
  })

  it('returns empty period for empty string', () => {
    expect(parsePeriodString('')).toEqual({ period: '' })
  })
})
