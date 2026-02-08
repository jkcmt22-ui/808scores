import { describe, it, expect } from 'vitest'
import {
  calculatePoints,
  calculateReputationChange,
  getTierFromReputation,
  checkBadgeEligibility,
  selectGoldenGames,
} from '@/lib/points/calculator'

// Minimal mock types matching the fields the calculator actually uses
const mockSubmission = (overrides: Record<string, unknown> = {}) => ({
  submission_type: 'final_score',
  photo_url: null,
  at_game: false,
  ...overrides,
})

const mockUser = (overrides: Record<string, unknown> = {}) => ({
  is_trusted_reporter: false,
  submission_count: 0,
  accuracy_rate: null,
  ...overrides,
})

const mockGame = (overrides: Record<string, unknown> = {}) => ({
  golden_game: false,
  ...overrides,
})

describe('calculatePoints', () => {
  it('awards 10 base points for final score', () => {
    const result = calculatePoints(
      mockSubmission() as never, mockUser() as never, mockGame() as never,
      false, 0, 0
    )
    expect(result.base).toBe(10)
    expect(result.total).toBe(10)
  })

  it('awards 5 base points for period score', () => {
    const result = calculatePoints(
      mockSubmission({ submission_type: 'period_score' }) as never,
      mockUser() as never, mockGame() as never,
      false, 0, 0
    )
    expect(result.base).toBe(5)
    expect(result.total).toBe(5)
  })

  it('awards 5 base points for live update', () => {
    const result = calculatePoints(
      mockSubmission({ submission_type: 'live_update' }) as never,
      mockUser() as never, mockGame() as never,
      false, 0, 0
    )
    expect(result.base).toBe(5)
  })

  it('awards first-to-report bonus only for final scores', () => {
    const result = calculatePoints(
      mockSubmission() as never, mockUser() as never, mockGame() as never,
      true, 0, 0
    )
    expect(result.firstToReport).toBe(5)
    expect(result.total).toBe(15) // 10 base + 5 first
  })

  it('does not award first-to-report for period scores', () => {
    const result = calculatePoints(
      mockSubmission({ submission_type: 'period_score' }) as never,
      mockUser() as never, mockGame() as never,
      true, 0, 0
    )
    expect(result.firstToReport).toBe(0)
  })

  it('awards photo bonus', () => {
    const result = calculatePoints(
      mockSubmission({ photo_url: 'https://example.com/photo.jpg' }) as never,
      mockUser() as never, mockGame() as never,
      false, 0, 0
    )
    expect(result.photoBonus).toBe(3)
    expect(result.total).toBe(13) // 10 + 3
  })

  it('awards location bonus', () => {
    const result = calculatePoints(
      mockSubmission({ at_game: true }) as never,
      mockUser() as never, mockGame() as never,
      false, 0, 0
    )
    expect(result.locationBonus).toBe(2)
    expect(result.total).toBe(12) // 10 + 2
  })

  it('applies streak multiplier at 5+ streak', () => {
    const result = calculatePoints(
      mockSubmission() as never, mockUser() as never, mockGame() as never,
      false, 0, 5
    )
    expect(result.streakMultiplier).toBe(1.5)
    expect(result.total).toBe(15) // 10 * 1.5
  })

  it('does not apply streak multiplier below 5', () => {
    const result = calculatePoints(
      mockSubmission() as never, mockUser() as never, mockGame() as never,
      false, 0, 4
    )
    expect(result.streakMultiplier).toBe(1)
    expect(result.total).toBe(10)
  })

  it('applies trusted reporter 2x multiplier', () => {
    const result = calculatePoints(
      mockSubmission() as never,
      mockUser({ is_trusted_reporter: true }) as never,
      mockGame() as never,
      false, 0, 0
    )
    expect(result.trustedMultiplier).toBe(2)
    expect(result.total).toBe(20) // 10 * 2
  })

  it('applies golden game 3x multiplier', () => {
    const result = calculatePoints(
      mockSubmission() as never, mockUser() as never,
      mockGame({ golden_game: true }) as never,
      false, 0, 0
    )
    expect(result.goldenGameMultiplier).toBe(3)
    expect(result.total).toBe(20) // 10 * 3 = 30 but capped at 20
  })

  it('stacks multipliers multiplicatively', () => {
    const result = calculatePoints(
      mockSubmission() as never,
      mockUser({ is_trusted_reporter: true }) as never,
      mockGame() as never,
      false, 0, 5
    )
    // 10 * 1.5 * 2 = 30, capped at 20
    expect(result.total).toBe(20)
  })

  it('caps points at 20 per game', () => {
    const result = calculatePoints(
      mockSubmission() as never, mockUser() as never, mockGame() as never,
      false, 0, 0
    )
    expect(result.total).toBeLessThanOrEqual(20)
  })

  it('respects remaining cap from previous submissions', () => {
    // Already earned 15 points for this game
    const result = calculatePoints(
      mockSubmission() as never, mockUser() as never, mockGame() as never,
      false, 15, 0
    )
    // 10 base, but only 5 remaining cap
    expect(result.total).toBe(5)
  })

  it('returns 0 when game cap already reached', () => {
    const result = calculatePoints(
      mockSubmission() as never, mockUser() as never, mockGame() as never,
      false, 20, 0
    )
    expect(result.total).toBe(0)
  })

  it('combines all bonuses correctly', () => {
    const result = calculatePoints(
      mockSubmission({ photo_url: 'photo.jpg', at_game: true }) as never,
      mockUser() as never, mockGame() as never,
      true, 0, 0
    )
    // 10 base + 5 first + 3 photo + 2 location = 20
    expect(result.total).toBe(20)
  })

  it('provides breakdown strings', () => {
    const result = calculatePoints(
      mockSubmission() as never, mockUser() as never, mockGame() as never,
      false, 0, 0
    )
    expect(result.breakdown.length).toBeGreaterThan(0)
    expect(result.breakdown[0]).toContain('Base')
  })
})

describe('calculateReputationChange', () => {
  it('returns -10 for overturned submissions', () => {
    expect(calculateReputationChange(false, true, false, false)).toBe(-10)
  })

  it('returns 0 for unverified submissions', () => {
    expect(calculateReputationChange(false, false, false, false)).toBe(0)
  })

  it('returns 2 for verified submission without bonuses', () => {
    expect(calculateReputationChange(true, false, false, false)).toBe(2)
  })

  it('adds 3 for photo bonus', () => {
    expect(calculateReputationChange(true, false, true, false)).toBe(5) // 2 + 3
  })

  it('adds 5 for resolved dispute', () => {
    expect(calculateReputationChange(true, false, false, true)).toBe(7) // 2 + 5
  })

  it('stacks photo and dispute bonuses', () => {
    expect(calculateReputationChange(true, false, true, true)).toBe(10) // 2 + 3 + 5
  })

  it('penalizes overturned even with photo', () => {
    // Overturned check comes first
    expect(calculateReputationChange(true, true, true, true)).toBe(-10)
  })
})

describe('getTierFromReputation', () => {
  it('returns elite for 91+', () => {
    expect(getTierFromReputation(91)).toBe('elite')
    expect(getTierFromReputation(100)).toBe('elite')
  })

  it('returns verified for 61-90', () => {
    expect(getTierFromReputation(61)).toBe('verified')
    expect(getTierFromReputation(90)).toBe('verified')
  })

  it('returns standard for 31-60', () => {
    expect(getTierFromReputation(31)).toBe('standard')
    expect(getTierFromReputation(60)).toBe('standard')
  })

  it('returns new for 30 and below', () => {
    expect(getTierFromReputation(30)).toBe('new')
    expect(getTierFromReputation(0)).toBe('new')
    expect(getTierFromReputation(-10)).toBe('new')
  })
})

describe('checkBadgeEligibility', () => {
  it('checks milestone badges correctly', () => {
    const user = mockUser({ submission_count: 0, accuracy_rate: null, is_trusted_reporter: false })
    const checks = checkBadgeEligibility(user as never, 50, {})

    const firstScore = checks.find(c => c.badgeCode === 'first_score')
    expect(firstScore?.earned).toBe(true)

    const tenClub = checks.find(c => c.badgeCode === 'ten_club')
    expect(tenClub?.earned).toBe(true)

    const fiftyClub = checks.find(c => c.badgeCode === 'fifty_club')
    expect(fiftyClub?.earned).toBe(true)

    const centuryClub = checks.find(c => c.badgeCode === 'century_club')
    expect(centuryClub?.earned).toBe(false)
  })

  it('checks accuracy badges only with 20+ submissions', () => {
    const user = mockUser({ submission_count: 19, accuracy_rate: 96, is_trusted_reporter: false })
    const checks = checkBadgeEligibility(user as never, 19, {})

    // Should not have accuracy badges since submission_count < 20
    const sharpshooter = checks.find(c => c.badgeCode === 'sharpshooter')
    expect(sharpshooter).toBeUndefined()
  })

  it('awards accuracy badges with 20+ submissions and high accuracy', () => {
    const user = mockUser({ submission_count: 25, accuracy_rate: 96, is_trusted_reporter: false })
    const checks = checkBadgeEligibility(user as never, 25, {})

    const sharpshooter = checks.find(c => c.badgeCode === 'sharpshooter')
    expect(sharpshooter?.earned).toBe(true)

    const reliable = checks.find(c => c.badgeCode === 'reliable')
    expect(reliable?.earned).toBe(true)
  })

  it('checks sport-specific badges', () => {
    const user = mockUser({ submission_count: 30, accuracy_rate: null, is_trusted_reporter: false })
    const sportSubmissions = { football: 30, basketball: 10 }
    const checks = checkBadgeEligibility(user as never, 30, sportSubmissions)

    const gridironGuru = checks.find(c => c.badgeCode === 'gridiron_guru')
    expect(gridironGuru?.earned).toBe(true)

    const hoopsInsider = checks.find(c => c.badgeCode === 'hoops_insider')
    expect(hoopsInsider?.earned).toBe(false)
  })
})

describe('selectGoldenGames', () => {
  it('returns at least 1 game', () => {
    const result = selectGoldenGames(['a', 'b', 'c'])
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('returns subset of input games', () => {
    const games = ['a', 'b', 'c', 'd', 'e']
    const result = selectGoldenGames(games)
    for (const id of result) {
      expect(games).toContain(id)
    }
  })

  it('respects percentage parameter', () => {
    const games = Array.from({ length: 100 }, (_, i) => `game-${i}`)
    const result = selectGoldenGames(games, 0.1) // 10%
    expect(result.length).toBe(10)
  })

  it('returns unique games (no duplicates)', () => {
    const games = Array.from({ length: 20 }, (_, i) => `game-${i}`)
    const result = selectGoldenGames(games, 0.5)
    const unique = new Set(result)
    expect(unique.size).toBe(result.length)
  })
})
