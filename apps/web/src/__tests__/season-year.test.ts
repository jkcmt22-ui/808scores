import { describe, it, expect, vi, afterEach } from 'vitest'
import { getCurrentSeasonYear, parseSeasonYear } from '@/hooks/use-team-roster'

describe('getCurrentSeasonYear', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns current-next year format during Aug-Dec', () => {
    // October 15, 2025 in Hawaii time
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-10-15T20:00:00.000Z')) // 10 AM HST
    expect(getCurrentSeasonYear()).toBe('2025-2026')
  })

  it('returns prev-current year format during Jan-Jul', () => {
    // February 15, 2026 in Hawaii time
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T20:00:00.000Z')) // 10 AM HST
    expect(getCurrentSeasonYear()).toBe('2025-2026')
  })

  it('August starts a new season', () => {
    // August 1, 2026 in Hawaii time
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-01T20:00:00.000Z')) // 10 AM HST
    expect(getCurrentSeasonYear()).toBe('2026-2027')
  })

  it('July is still the previous season', () => {
    // July 31, 2026 in Hawaii time
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-31T20:00:00.000Z')) // 10 AM HST
    expect(getCurrentSeasonYear()).toBe('2025-2026')
  })

  it('December is still the current season', () => {
    // December 31, 2025
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-12-31T20:00:00.000Z'))
    expect(getCurrentSeasonYear()).toBe('2025-2026')
  })

  it('January 1 is the second half of the season', () => {
    // January 1, 2026
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T20:00:00.000Z'))
    expect(getCurrentSeasonYear()).toBe('2025-2026')
  })
})

describe('parseSeasonYear', () => {
  it('extracts the start year from season string', () => {
    expect(parseSeasonYear('2025-2026')).toBe(2025)
    expect(parseSeasonYear('2024-2025')).toBe(2024)
  })

  it('handles future seasons', () => {
    expect(parseSeasonYear('2030-2031')).toBe(2030)
  })
})
