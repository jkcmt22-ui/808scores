/**
 * Hawaii Sports Center Points Calculator
 *
 * Simplified 1:1 system: 1 verified score = 1 point = 1 raffle entry.
 * Optional +1 for first reporter. Golden game = 3 points.
 */

import type { Submission, User, Game } from '@/types/database'

/**
 * Unbiased random integer in [0, max) using rejection sampling.
 * Avoids modulo bias from crypto.getRandomValues().
 */
function unbiasedRandomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max
  const buf = new Uint32Array(1)
  let value: number
  do {
    crypto.getRandomValues(buf)
    value = buf[0]
  } while (value >= limit)
  return value % max
}

export interface PointsBreakdown {
  base: number
  firstToReport: number
  goldenGameMultiplier: number
  total: number
  breakdown: string[]
}

/**
 * Base points: 1 per submission, regardless of type
 */
const BASE_POINTS = 1

/**
 * First to report bonus
 */
const FIRST_TO_REPORT_BONUS = 1

/**
 * Maximum points per game (anti-gaming: base + first + golden = 3 max on golden)
 */
const MAX_POINTS_PER_GAME = 3

/**
 * Maximum submission points per day
 */
const MAX_DAILY_SUBMISSION_POINTS = 50

/**
 * Calculate points for a submission
 */
export function calculatePoints(
  submission: Submission,
  _user: User,
  game: Game,
  isFirstToReport: boolean,
  currentGamePoints: number,
): PointsBreakdown {
  const breakdown: string[] = []

  // Base: 1 point per submission
  const base = BASE_POINTS
  breakdown.push(`Score submitted: +${base} pt`)

  // First to report bonus (+1)
  let firstToReport = 0
  if (isFirstToReport) {
    firstToReport = FIRST_TO_REPORT_BONUS
    breakdown.push(`First to report: +${firstToReport} pt`)
  }

  // Subtotal before golden game
  const subtotal = base + firstToReport

  // Golden game multiplier (3x)
  let goldenGameMultiplier = 1
  if (game.golden_game) {
    goldenGameMultiplier = 3
    breakdown.push('Golden game: 3x')
  }

  let total = Math.round(subtotal * goldenGameMultiplier)

  // Apply per-game cap
  const remainingCap = MAX_POINTS_PER_GAME - currentGamePoints
  if (total > remainingCap) {
    total = Math.max(0, remainingCap)
    breakdown.push(`Capped at game limit: ${total} pts`)
  }

  return {
    base,
    firstToReport,
    goldenGameMultiplier,
    total,
    breakdown,
  }
}

export { MAX_POINTS_PER_GAME, MAX_DAILY_SUBMISSION_POINTS }

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
 * Disabled under simplified 1:1 points system.
 */
export function checkRandomReward(): { triggered: boolean; bonusPoints: number } {
  return { triggered: false, bonusPoints: 0 }
}

/**
 * Mark games as "Golden Games" (randomly selected for 3x points)
 * Called when generating the daily schedule
 */
export function selectGoldenGames(gameIds: string[], percentage: number = 0.05): string[] {
  const count = Math.max(1, Math.floor(gameIds.length * percentage))
  // Fisher-Yates shuffle with crypto-secure randomness
  const shuffled = [...gameIds]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = unbiasedRandomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}
