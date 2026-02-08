import { describe, it, expect } from 'vitest'
import {
  hawaiiDatetimeToUTC,
  utcToHawaiiDatetime,
  getHawaiiDayStartUTC,
  getHawaiiDayEndUTC,
  getScoreDeadline,
  formatGameTime,
  formatGameDate,
} from '@/lib/utils'

describe('hawaiiDatetimeToUTC', () => {
  it('converts Hawaii afternoon to UTC next day early morning', () => {
    // 5:30 PM HST = 3:30 AM UTC next day (HST is UTC-10)
    const result = hawaiiDatetimeToUTC('2026-02-01T17:30')
    expect(result).toBe('2026-02-02T03:30:00.000Z')
  })

  it('converts Hawaii midnight to UTC 10:00 AM same day', () => {
    // Midnight HST = 10:00 AM UTC
    const result = hawaiiDatetimeToUTC('2026-02-01T00:00')
    expect(result).toBe('2026-02-01T10:00:00.000Z')
  })

  it('converts Hawaii noon to UTC 10:00 PM same day', () => {
    // Noon HST = 10:00 PM UTC
    const result = hawaiiDatetimeToUTC('2026-02-01T12:00')
    expect(result).toBe('2026-02-01T22:00:00.000Z')
  })

  it('handles 11 PM HST correctly (rolls to next UTC day)', () => {
    // 11:00 PM HST = 9:00 AM UTC next day
    const result = hawaiiDatetimeToUTC('2026-02-01T23:00')
    expect(result).toBe('2026-02-02T09:00:00.000Z')
  })

  it('returns empty string for empty input', () => {
    expect(hawaiiDatetimeToUTC('')).toBe('')
  })

  it('handles year boundary (Dec 31 HST)', () => {
    // 11 PM HST Dec 31 = 9 AM UTC Jan 1
    const result = hawaiiDatetimeToUTC('2025-12-31T23:00')
    expect(result).toBe('2026-01-01T09:00:00.000Z')
  })
})

describe('utcToHawaiiDatetime', () => {
  it('converts UTC early morning to Hawaii previous day evening', () => {
    // 3:30 AM UTC = 5:30 PM HST previous day
    const result = utcToHawaiiDatetime('2026-02-02T03:30:00.000Z')
    expect(result).toBe('2026-02-01T17:30')
  })

  it('converts UTC 10:00 AM to Hawaii midnight', () => {
    // 10:00 AM UTC = midnight HST
    // Intl.DateTimeFormat with hour12:false can return "24:00" for midnight
    const result = utcToHawaiiDatetime('2026-02-01T10:00:00.000Z')
    expect(result).toMatch(/2026-02-01T(00:00|24:00)/)
  })

  it('converts UTC noon to Hawaii 2:00 AM', () => {
    // 12:00 PM UTC = 2:00 AM HST
    const result = utcToHawaiiDatetime('2026-02-01T12:00:00.000Z')
    expect(result).toBe('2026-02-01T02:00')
  })

  it('round-trips correctly', () => {
    const original = '2026-06-15T18:45'
    const utc = hawaiiDatetimeToUTC(original)
    const roundTripped = utcToHawaiiDatetime(utc)
    expect(roundTripped).toBe(original)
  })

  it('accepts Date objects', () => {
    const date = new Date('2026-02-01T22:00:00.000Z') // 10 PM UTC = noon HST
    const result = utcToHawaiiDatetime(date)
    expect(result).toBe('2026-02-01T12:00')
  })
})

describe('getHawaiiDayStartUTC', () => {
  it('returns midnight HST as UTC (10:00 AM UTC)', () => {
    // For a date in Hawaii, midnight = 10:00 UTC
    const date = new Date('2026-02-01T20:00:00.000Z') // 10 AM HST Feb 1
    const result = getHawaiiDayStartUTC(date)
    expect(result.toISOString()).toBe('2026-02-01T10:00:00.000Z')
  })

  it('handles UTC dates that are a different day in Hawaii', () => {
    // 3 AM UTC Feb 2 = 5 PM HST Feb 1
    const date = new Date('2026-02-02T03:00:00.000Z')
    const result = getHawaiiDayStartUTC(date)
    // Day start for Feb 1 HST = Feb 1 10:00 UTC
    expect(result.toISOString()).toBe('2026-02-01T10:00:00.000Z')
  })
})

describe('getHawaiiDayEndUTC', () => {
  it('returns 11:59:59 PM HST as UTC (9:59:59 AM next day)', () => {
    const date = new Date('2026-02-01T20:00:00.000Z') // 10 AM HST Feb 1
    const result = getHawaiiDayEndUTC(date)
    expect(result.toISOString()).toBe('2026-02-02T09:59:59.999Z')
  })

  it('day start and day end span exactly one day', () => {
    const date = new Date('2026-02-01T15:00:00.000Z')
    const start = getHawaiiDayStartUTC(date)
    const end = getHawaiiDayEndUTC(date)
    const diffMs = end.getTime() - start.getTime()
    // Should be 23:59:59.999 = 86399999 ms
    expect(diffMs).toBe(86399999)
  })
})

describe('getScoreDeadline', () => {
  it('returns 5 AM HST next day (3 PM UTC next day)', () => {
    // Game on Feb 1 HST → deadline is Feb 2 at 5 AM HST = Feb 2 at 15:00 UTC
    const result = getScoreDeadline('2026-02-01T20:00:00.000Z') // 10 AM HST Feb 1
    expect(result.toISOString()).toBe('2026-02-02T15:00:00.000Z')
  })

  it('handles games late at night (still same Hawaii day)', () => {
    // 3 AM UTC Feb 2 = 5 PM HST Feb 1 → deadline is Feb 2 5 AM HST = Feb 2 15:00 UTC
    const result = getScoreDeadline('2026-02-02T03:00:00.000Z')
    expect(result.toISOString()).toBe('2026-02-02T15:00:00.000Z')
  })
})

describe('formatGameTime', () => {
  it('formats UTC time in Hawaii timezone', () => {
    // 3:30 AM UTC = 5:30 PM HST
    const result = formatGameTime('2026-02-02T03:30:00.000Z')
    expect(result).toBe('5:30 PM')
  })

  it('formats noon UTC as 2:00 AM HST', () => {
    const result = formatGameTime('2026-02-01T12:00:00.000Z')
    expect(result).toBe('2:00 AM')
  })
})

describe('formatGameDate', () => {
  it('formats date in Hawaii timezone', () => {
    // 3 AM UTC Feb 2 = 5 PM HST Feb 1 (a Sunday)
    const result = formatGameDate('2026-02-02T03:00:00.000Z')
    expect(result).toBe('Sun, Feb 1')
  })
})
