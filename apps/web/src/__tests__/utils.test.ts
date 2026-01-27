import { describe, it, expect } from 'vitest'
import {
  isGameLive,
  isGameFinal,
  getStatusLabel,
  getStatusColor,
  getTierLabel,
  getTierColor,
  formatRelativeTime,
  isScoreOverdue,
} from '@/lib/utils'

describe('isGameLive', () => {
  it('returns true for in_progress status', () => {
    expect(isGameLive('in_progress')).toBe(true)
  })

  it('returns false for other statuses', () => {
    expect(isGameLive('scheduled')).toBe(false)
    expect(isGameLive('final')).toBe(false)
    expect(isGameLive('postponed')).toBe(false)
    expect(isGameLive('canceled')).toBe(false)
  })
})

describe('isGameFinal', () => {
  it('returns true for final status', () => {
    expect(isGameFinal('final')).toBe(true)
  })

  it('returns false for other statuses', () => {
    expect(isGameFinal('scheduled')).toBe(false)
    expect(isGameFinal('in_progress')).toBe(false)
    expect(isGameFinal('postponed')).toBe(false)
  })
})

describe('getStatusLabel', () => {
  it('returns correct labels for all statuses', () => {
    expect(getStatusLabel('scheduled')).toBe('Scheduled')
    expect(getStatusLabel('in_progress')).toBe('Live')
    expect(getStatusLabel('final')).toBe('Final')
    expect(getStatusLabel('postponed')).toBe('Postponed')
    expect(getStatusLabel('canceled')).toBe('Canceled')
  })

  it('returns the status itself for unknown statuses', () => {
    expect(getStatusLabel('unknown')).toBe('unknown')
  })
})

describe('getStatusColor', () => {
  it('returns correct colors for statuses', () => {
    expect(getStatusColor('in_progress')).toBe('text-red-500')
    expect(getStatusColor('final')).toBe('text-gray-500')
    expect(getStatusColor('postponed')).toBe('text-yellow-500')
    expect(getStatusColor('canceled')).toBe('text-yellow-500')
    expect(getStatusColor('scheduled')).toBe('text-gray-400')
  })
})

describe('getTierLabel', () => {
  it('returns correct labels for all tiers', () => {
    expect(getTierLabel('new')).toBe('New')
    expect(getTierLabel('standard')).toBe('Standard')
    expect(getTierLabel('verified')).toBe('Verified')
    expect(getTierLabel('elite')).toBe('Elite')
    expect(getTierLabel('trusted')).toBe('Trusted Reporter')
  })

  it('returns the tier itself for unknown tiers', () => {
    expect(getTierLabel('unknown')).toBe('unknown')
  })
})

describe('getTierColor', () => {
  it('returns correct colors for tiers', () => {
    expect(getTierColor('trusted')).toContain('purple')
    expect(getTierColor('elite')).toContain('yellow')
    expect(getTierColor('verified')).toContain('blue')
    expect(getTierColor('standard')).toContain('green')
    expect(getTierColor('new')).toContain('gray')
  })
})

describe('formatRelativeTime', () => {
  it('returns "just now" for times less than a minute ago', () => {
    const now = new Date()
    expect(formatRelativeTime(now)).toBe('just now')
  })

  it('returns minutes ago for times less than an hour ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago')
  })

  it('returns hours ago for times less than a day ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago')
  })

  it('returns days ago for times less than a week ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago')
  })

  it('returns formatted date for times more than a week ago', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(twoWeeksAgo)
    // Should be like "Jan 12" - contains month abbreviation
    expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/)
  })
})

describe('isScoreOverdue', () => {
  it('returns false for final and verified games', () => {
    const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    expect(isScoreOverdue(yesterday, 'final', true)).toBe(false)
  })

  it('returns false for canceled games', () => {
    const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    expect(isScoreOverdue(yesterday, 'canceled', false)).toBe(false)
  })

  it('returns false for postponed games', () => {
    const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    expect(isScoreOverdue(yesterday, 'postponed', false)).toBe(false)
  })

  it('returns false for games scheduled in the future', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    expect(isScoreOverdue(tomorrow, 'scheduled', false)).toBe(false)
  })

  it('returns true for scheduled games past their deadline', () => {
    // Game from 3 days ago - definitely past 5AM HST the next day
    const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
    expect(isScoreOverdue(threeDaysAgo, 'scheduled', false)).toBe(true)
  })
})
