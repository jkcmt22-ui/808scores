/**
 * Hawaii Sports Center Verification Engine
 *
 * Handles the logic for verifying score submissions:
 * - Trusted reporters publish instantly
 * - 2+ matching submissions publish instantly
 * - 1 submission with no conflict after 2 minutes publishes
 * - Conflicts are resolved by majority rule
 */

import type { Submission, User, Game, VerificationMethod } from '@/types/database'

export interface VerificationResult {
  shouldPublish: boolean
  method: VerificationMethod | null
  reason: string
  conflictDetected: boolean
  requiresManualReview: boolean
}

export interface SubmissionGroup {
  homeScore: number
  awayScore: number
  submissions: Submission[]
  hasTrustedReporter: boolean
}

/**
 * Check if a user is a trusted reporter
 */
export function isTrustedReporter(user: User): boolean {
  return user.is_trusted_reporter && user.tier === 'trusted'
}

/**
 * Group submissions by score value
 */
export function groupSubmissionsByScore(submissions: Submission[]): SubmissionGroup[] {
  const groups = new Map<string, SubmissionGroup>()

  for (const sub of submissions) {
    if (sub.home_score === null || sub.away_score === null) continue

    const key = `${sub.home_score}-${sub.away_score}`

    if (!groups.has(key)) {
      groups.set(key, {
        homeScore: sub.home_score,
        awayScore: sub.away_score,
        submissions: [],
        hasTrustedReporter: false,
      })
    }

    const group = groups.get(key)!
    group.submissions.push(sub)
  }

  return Array.from(groups.values())
}

/**
 * Find the majority score group (if any)
 */
export function findMajorityGroup(
  groups: SubmissionGroup[],
  trustedSubmissions: Submission[]
): SubmissionGroup | null {
  if (groups.length === 0) return null
  if (groups.length === 1) return groups[0]

  // Mark groups with trusted reporters
  for (const group of groups) {
    group.hasTrustedReporter = trustedSubmissions.some(
      (ts) => ts.home_score === group.homeScore && ts.away_score === group.awayScore
    )
  }

  // Sort by: trusted reporter first, then by submission count
  const sorted = [...groups].sort((a, b) => {
    if (a.hasTrustedReporter && !b.hasTrustedReporter) return -1
    if (!a.hasTrustedReporter && b.hasTrustedReporter) return 1
    return b.submissions.length - a.submissions.length
  })

  const top = sorted[0]
  const second = sorted[1]

  // Check if there's a clear majority (>50% of submissions)
  const totalSubmissions = groups.reduce((sum, g) => sum + g.submissions.length, 0)
  const majorityThreshold = totalSubmissions / 2

  if (top.submissions.length > majorityThreshold) {
    return top
  }

  // If no clear majority but top has trusted reporter, use it
  if (top.hasTrustedReporter && !second.hasTrustedReporter) {
    return top
  }

  // No clear winner
  return null
}

/**
 * Main verification function
 */
export async function verifySubmission(
  newSubmission: Submission,
  submitter: User,
  existingSubmissions: Submission[],
  trustedSubmissions: Submission[],
  game: Game,
  timeSinceFirstSubmission: number // in milliseconds
): Promise<VerificationResult> {
  // Rule 1: Trusted reporters publish instantly
  if (isTrustedReporter(submitter)) {
    return {
      shouldPublish: true,
      method: 'trusted',
      reason: 'Trusted reporter - instant publish',
      conflictDetected: false,
      requiresManualReview: false,
    }
  }

  // Combine all submissions including the new one
  const allSubmissions = [...existingSubmissions, newSubmission]
  const groups = groupSubmissionsByScore(allSubmissions)

  // Rule 2: 2+ matching submissions publish instantly
  const matchingGroup = groups.find((g) => g.submissions.length >= 2)
  if (matchingGroup) {
    // Check if new submission matches
    const newMatches =
      newSubmission.home_score === matchingGroup.homeScore &&
      newSubmission.away_score === matchingGroup.awayScore

    if (newMatches) {
      return {
        shouldPublish: true,
        method: 'majority',
        reason: '2+ matching submissions - instant publish',
        conflictDetected: groups.length > 1,
        requiresManualReview: false,
      }
    }
  }

  // Check for conflicts
  if (groups.length > 1) {
    // Try to find majority
    const majorityGroup = findMajorityGroup(groups, trustedSubmissions)

    if (majorityGroup) {
      const newMatches =
        newSubmission.home_score === majorityGroup.homeScore &&
        newSubmission.away_score === majorityGroup.awayScore

      return {
        shouldPublish: newMatches,
        method: newMatches ? 'majority' : null,
        reason: newMatches
          ? 'Majority rule - matches winning score'
          : 'Conflict detected - does not match majority',
        conflictDetected: true,
        requiresManualReview: !newMatches,
      }
    }

    // No clear majority - requires manual review
    return {
      shouldPublish: false,
      method: null,
      reason: 'Conflict with no clear majority - manual review required',
      conflictDetected: true,
      requiresManualReview: true,
    }
  }

  // Rule 3: Single submission - check timer
  const TWO_MINUTES = 2 * 60 * 1000

  if (timeSinceFirstSubmission >= TWO_MINUTES) {
    return {
      shouldPublish: true,
      method: 'timer',
      reason: '2 minutes passed with no conflict - auto publish',
      conflictDetected: false,
      requiresManualReview: false,
    }
  }

  // Not yet verified - waiting for timer or second submission
  return {
    shouldPublish: false,
    method: null,
    reason: `Waiting for confirmation (${Math.ceil((TWO_MINUTES - timeSinceFirstSubmission) / 1000)}s remaining)`,
    conflictDetected: false,
    requiresManualReview: false,
  }
}

/**
 * Check if a score is reasonable for the sport
 * Returns false if the score seems suspicious
 */
export function isScoreReasonable(
  homeScore: number,
  awayScore: number,
  sportCode: string
): boolean {
  const maxScores: Record<string, number> = {
    football: 100,
    basketball: 120, // Updated from 150 - high school basketball rarely exceeds 100
    volleyball: 30, // per set
    baseball: 30,
    softball: 30,
    soccer: 15,
  }

  const max = maxScores[sportCode] || 100

  // Basic sanity checks
  if (homeScore < 0 || awayScore < 0) return false
  if (homeScore > max || awayScore > max) return false

  // Basketball-specific: scores should be reasonable
  if (sportCode === 'basketball') {
    if (homeScore < 10 && awayScore < 10) return false // Too low for basketball
  }

  return true
}

/**
 * Detect potential fraud patterns
 */
export interface FraudCheckResult {
  isSuspicious: boolean
  reasons: string[]
}

export function checkForFraud(
  user: User,
  recentSubmissions: Submission[],
  _newSubmission: Submission
): FraudCheckResult {
  const reasons: string[] = []

  // Check submission velocity (more than 20 in an hour is suspicious)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recentCount = recentSubmissions.filter(
    (s) => new Date(s.created_at) > oneHourAgo
  ).length

  if (recentCount >= 20) {
    reasons.push('High submission velocity detected')
  }

  // Check for always submitting one team winning (bias detection)
  // This would require more context about which team the user typically favors

  // Check for low accuracy rate
  if (user.accuracy_rate !== null && user.accuracy_rate < 70 && user.submission_count > 10) {
    reasons.push('Low historical accuracy rate')
  }

  // Check reputation
  if (user.reputation_score < 30) {
    reasons.push('Low reputation score')
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  }
}
