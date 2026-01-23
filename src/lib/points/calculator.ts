/**
 * Hawaii Sports Center Points Calculator
 *
 * Calculates points earned for submissions based on:
 * - Submission type (final score, period score, live update)
 * - Bonuses (photo, location, first to report)
 * - Multipliers (trusted reporter, accuracy streak, golden game)
 */

import type { Submission, User, Game } from '@/types/database'

export interface PointsBreakdown {
  base: number
  firstToReport: number
  photoBonus: number
  locationBonus: number
  streakMultiplier: number
  trustedMultiplier: number
  goldenGameMultiplier: number
  total: number
  breakdown: string[]
}

/**
 * Base points by submission type
 */
const BASE_POINTS: Record<string, number> = {
  final_score: 10,
  period_score: 5,
  live_update: 5,
  event: 2,
  status_change: 2,
}

/**
 * Maximum points per game (anti-gaming)
 */
const MAX_POINTS_PER_GAME = 20

/**
 * Calculate points for a submission
 */
export function calculatePoints(
  submission: Submission,
  user: User,
  game: Game,
  isFirstToReport: boolean,
  currentGamePoints: number, // Points already earned for this game
  accuracyStreak: number // Number of consecutive verified submissions
): PointsBreakdown {
  const breakdown: string[] = []

  // Base points
  const base = BASE_POINTS[submission.submission_type] || 0
  breakdown.push(`Base: ${base} pts (${submission.submission_type.replace('_', ' ')})`)

  // First to report bonus
  let firstToReport = 0
  if (isFirstToReport && submission.submission_type === 'final_score') {
    firstToReport = 5
    breakdown.push(`First to report: +${firstToReport} pts`)
  }

  // Photo bonus
  let photoBonus = 0
  if (submission.photo_url) {
    photoBonus = 3
    breakdown.push(`Photo bonus: +${photoBonus} pts`)
  }

  // Location bonus
  let locationBonus = 0
  if (submission.at_game) {
    locationBonus = 2
    breakdown.push(`At game bonus: +${locationBonus} pts`)
  }

  // Subtotal before multipliers
  const subtotal = base + firstToReport + photoBonus + locationBonus

  // Streak multiplier (5+ streak = 1.5x)
  let streakMultiplier = 1
  if (accuracyStreak >= 5) {
    streakMultiplier = 1.5
    breakdown.push(`Accuracy streak (${accuracyStreak}): 1.5x`)
  }

  // Trusted reporter multiplier (2x)
  let trustedMultiplier = 1
  if (user.is_trusted_reporter) {
    trustedMultiplier = 2
    breakdown.push('Trusted reporter: 2x')
  }

  // Golden game multiplier (3x)
  let goldenGameMultiplier = 1
  if (game.golden_game) {
    goldenGameMultiplier = 3
    breakdown.push('Golden game: 3x')
  }

  // Calculate total with multipliers
  // Multipliers stack multiplicatively
  let total = Math.round(
    subtotal * streakMultiplier * trustedMultiplier * goldenGameMultiplier
  )

  // Apply per-game cap
  const remainingCap = MAX_POINTS_PER_GAME - currentGamePoints
  if (total > remainingCap) {
    total = Math.max(0, remainingCap)
    breakdown.push(`Capped at game limit: ${total} pts`)
  }

  return {
    base,
    firstToReport,
    photoBonus,
    locationBonus,
    streakMultiplier,
    trustedMultiplier,
    goldenGameMultiplier,
    total,
    breakdown,
  }
}

/**
 * Calculate reputation change based on submission outcome
 */
export function calculateReputationChange(
  wasVerified: boolean,
  wasOverturned: boolean,
  hadPhoto: boolean,
  resolvedDispute: boolean
): number {
  if (wasOverturned) {
    return -10 // Penalize overturned submissions
  }

  if (!wasVerified) {
    return 0 // No change for pending
  }

  let change = 2 // Base for verified submission

  if (hadPhoto) {
    change += 3 // Photo bonus
  }

  if (resolvedDispute) {
    change += 5 // Resolved a dispute in your favor
  }

  return change
}

/**
 * Determine user tier based on reputation score
 */
export function getTierFromReputation(reputationScore: number): string {
  if (reputationScore >= 91) return 'elite'
  if (reputationScore >= 61) return 'verified'
  if (reputationScore >= 31) return 'standard'
  return 'new'
}

/**
 * Check if user qualifies for any badges based on their stats
 */
export interface BadgeCheck {
  badgeCode: string
  earned: boolean
  reason: string
}

export function checkBadgeEligibility(
  user: User,
  submissionCount: number,
  sportSubmissions: Record<string, number>
): BadgeCheck[] {
  const checks: BadgeCheck[] = []

  // Milestone badges
  const milestones = [
    { code: 'first_score', threshold: 1 },
    { code: 'ten_club', threshold: 10 },
    { code: 'fifty_club', threshold: 50 },
    { code: 'century_club', threshold: 100 },
    { code: 'five_hundred_club', threshold: 500 },
  ]

  for (const milestone of milestones) {
    checks.push({
      badgeCode: milestone.code,
      earned: submissionCount >= milestone.threshold,
      reason: `${submissionCount}/${milestone.threshold} submissions`,
    })
  }

  // Accuracy badges
  if (user.submission_count >= 20) {
    checks.push({
      badgeCode: 'sharpshooter',
      earned: (user.accuracy_rate || 0) >= 95,
      reason: `${user.accuracy_rate}% accuracy (need 95%+)`,
    })

    checks.push({
      badgeCode: 'reliable',
      earned: (user.accuracy_rate || 0) >= 90,
      reason: `${user.accuracy_rate}% accuracy (need 90%+)`,
    })
  }

  // Sport badges
  const sportBadges = [
    { code: 'gridiron_guru', sport: 'football' },
    { code: 'hoops_insider', sport: 'basketball' },
    { code: 'diamond_reporter', sport: 'baseball' },
    { code: 'net_master', sport: 'volleyball' },
    { code: 'pitch_perfect', sport: 'soccer' },
  ]

  for (const badge of sportBadges) {
    const count = sportSubmissions[badge.sport] || 0
    checks.push({
      badgeCode: badge.code,
      earned: count >= 25,
      reason: `${count}/25 ${badge.sport} games`,
    })
  }

  // Trusted reporter badge
  checks.push({
    badgeCode: 'trusted_reporter',
    earned: user.is_trusted_reporter,
    reason: user.is_trusted_reporter ? 'Approved' : 'Not yet approved',
  })

  return checks
}

/**
 * Check for random rewards (Lucky Reporter, etc.)
 */
export function checkRandomReward(): { triggered: boolean; bonusPoints: number } {
  // 2% chance of Lucky Reporter bonus
  const roll = Math.random()
  if (roll < 0.02) {
    // Random bonus between 25-100 points
    const bonusPoints = Math.floor(Math.random() * 76) + 25
    return { triggered: true, bonusPoints }
  }
  return { triggered: false, bonusPoints: 0 }
}

/**
 * Mark games as "Golden Games" (randomly selected for 3x points)
 * Called when generating the daily schedule
 */
export function selectGoldenGames(gameIds: string[], percentage: number = 0.05): string[] {
  const count = Math.max(1, Math.floor(gameIds.length * percentage))
  const shuffled = [...gameIds].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
