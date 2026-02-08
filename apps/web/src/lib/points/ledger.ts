/**
 * Point Events Ledger
 *
 * Functions for awarding points through the centralized ledger system.
 * All point awards should go through these functions to ensure proper audit trail.
 */

import { createClient } from '@/lib/supabase/client'
import type { PointsBreakdown } from './calculator'

export interface PointEventMetadata {
  breakdown?: string[]
  multipliers?: {
    streak?: number
    trusted?: number
    golden_game?: number
  }
  cap_applied?: boolean
  original_points?: number
  [key: string]: unknown
}

export type PointEventType =
  | 'submission'
  | 'chat_comment'
  | 'chat_like_received'
  | 'chat_mention_received'
  | 'prediction_exact_match'
  | 'prediction_top3'
  | 'prediction_top10'
  | 'raffle_deduction'
  | 'admin_adjustment'
  | 'bonus'
  | 'lucky_reporter'

export type PointSourceType =
  | 'submission'
  | 'chat_message'
  | 'game_prediction'
  | 'raffle'
  | 'admin'

/**
 * Award points to a user via the centralized ledger
 * This creates an audit trail entry and updates user totals atomically
 */
export async function awardPoints(
  userId: string,
  eventType: PointEventType,
  points: number,
  sourceType: PointSourceType,
  sourceId?: string,
  metadata?: PointEventMetadata
): Promise<{ eventId: string | null; error?: string }> {
  const supabase = createClient()
  if (!supabase) {
    return { eventId: null, error: 'Supabase client not available' }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('award_points', {
      p_user_id: userId,
      p_event_type: eventType,
      p_points: points,
      p_source_type: sourceType,
      p_source_id: sourceId || null,
      p_metadata: metadata || {},
    })

    if (error) {
      console.error('Error awarding points:', error)
      return { eventId: null, error: error.message }
    }

    return { eventId: data as string }
  } catch (err) {
    console.error('Exception awarding points:', err)
    return { eventId: null, error: 'Failed to award points' }
  }
}

/**
 * Award submission points via the ledger
 * Takes a points breakdown from the calculator and creates the ledger entry
 */
export async function awardSubmissionPoints(
  userId: string,
  submissionId: string,
  pointsBreakdown: PointsBreakdown
): Promise<{ eventId: string | null; error?: string }> {
  if (pointsBreakdown.total <= 0) {
    return { eventId: null } // No points to award
  }

  const metadata: PointEventMetadata = {
    breakdown: pointsBreakdown.breakdown,
    multipliers: {
      golden_game: pointsBreakdown.goldenGameMultiplier,
    },
    base_points: pointsBreakdown.base,
    first_to_report: pointsBreakdown.firstToReport,
  }

  return awardPoints(
    userId,
    'submission',
    pointsBreakdown.total,
    'submission',
    submissionId,
    metadata
  )
}

/**
 * Award prediction points via the ledger
 */
export async function awardPredictionPoints(
  userId: string,
  gameId: string,
  rank: number,
  points: number,
  metadata?: PointEventMetadata
): Promise<{ eventId: string | null; error?: string }> {
  let eventType: PointEventType
  if (rank === 1 && metadata?.exactMatch) {
    eventType = 'prediction_exact_match'
  } else if (rank <= 3) {
    eventType = 'prediction_top3'
  } else {
    eventType = 'prediction_top10'
  }

  return awardPoints(
    userId,
    eventType,
    points,
    'game_prediction',
    gameId,
    { ...metadata, rank }
  )
}

/**
 * Deduct points for raffle entry via the ledger
 */
export async function deductRafflePoints(
  userId: string,
  raffleId: string,
  pointsUsed: number,
  entryCount: number
): Promise<{ eventId: string | null; error?: string }> {
  return awardPoints(
    userId,
    'raffle_deduction',
    -pointsUsed, // Negative to deduct
    'raffle',
    raffleId,
    { entry_count: entryCount }
  )
}

/**
 * Award bonus points (lucky reporter, admin adjustment, etc.)
 */
export async function awardBonusPoints(
  userId: string,
  eventType: PointEventType,
  points: number,
  sourceType: PointSourceType,
  reason?: string,
  sourceId?: string
): Promise<{ eventId: string | null; error?: string }> {
  return awardPoints(
    userId,
    eventType,
    points,
    sourceType,
    sourceId,
    { reason }
  )
}

/**
 * Get user's point event history
 */
export async function getPointEventHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ events: PointEvent[]; error?: string }> {
  const supabase = createClient()
  if (!supabase) {
    return { events: [], error: 'Supabase client not available' }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('point_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching point events:', error)
      return { events: [], error: error.message }
    }

    return { events: (data || []) as PointEvent[] }
  } catch (err) {
    console.error('Exception fetching point events:', err)
    return { events: [], error: 'Failed to fetch point history' }
  }
}

/**
 * Point event record type
 */
export interface PointEvent {
  id: string
  user_id: string
  event_type: PointEventType
  points: number
  source_type: PointSourceType
  source_id: string | null
  metadata: PointEventMetadata
  created_at: string
}
