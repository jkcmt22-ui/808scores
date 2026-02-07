/**
 * Chat engagement points logic
 * Points awarded for chat interactions with daily caps
 */

import { createClient } from '@/lib/supabase/client'

export interface ChatPointConfig {
  action: 'comment' | 'like_received' | 'mention_received'
  points: number
  dailyCap: number
}

export const CHAT_POINT_CONFIG: Record<string, ChatPointConfig> = {
  comment: {
    action: 'comment',
    points: 1,
    dailyCap: 10,
  },
  like_received: {
    action: 'like_received',
    points: 2,
    dailyCap: 20,
  },
  mention_received: {
    action: 'mention_received',
    points: 1,
    dailyCap: 5,
  },
}

/**
 * Award points for a chat action (client-side trigger)
 * The actual point awarding happens in the database via triggers/functions
 */
export async function awardChatPoints(
  userId: string,
  action: 'comment' | 'like_received' | 'mention_received',
  sourceId?: string
): Promise<{ pointsAwarded: number; error?: string }> {
  const supabase = createClient()
  if (!supabase) {
    return { pointsAwarded: 0, error: 'Supabase client not available' }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('award_chat_points', {
      p_user_id: userId,
      p_action_type: action,
      p_source_id: sourceId || null,
    })

    if (error) {
      console.error('Error awarding chat points:', error)
      return { pointsAwarded: 0, error: error.message }
    }

    return { pointsAwarded: data as number }
  } catch (err) {
    console.error('Exception awarding chat points:', err)
    return { pointsAwarded: 0, error: 'Failed to award points' }
  }
}

/**
 * Get user's daily chat point totals
 */
export async function getDailyChatPoints(
  userId: string
): Promise<Record<string, number>> {
  const supabase = createClient()
  if (!supabase) {
    return {}
  }

  // Get midnight Hawaii time (HST is always UTC-10, no DST)
  const now = new Date()
  const hawaiiDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu' })
  const today = new Date(hawaiiDateStr + 'T00:00:00-10:00')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('chat_point_logs')
    .select('action_type, points_earned')
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())

  if (error) {
    console.error('Error fetching daily chat points:', error)
    return {}
  }

  const totals: Record<string, number> = {}
  const logs = (data || []) as { action_type: string; points_earned: number }[]
  for (const log of logs) {
    const action = log.action_type
    totals[action] = (totals[action] || 0) + log.points_earned
  }

  return totals
}

/**
 * Check if user has hit their daily cap for an action
 */
export async function hasHitDailyCap(
  userId: string,
  action: 'comment' | 'like_received' | 'mention_received'
): Promise<boolean> {
  const dailyTotals = await getDailyChatPoints(userId)
  const config = CHAT_POINT_CONFIG[action]

  if (!config) return false

  const currentTotal = dailyTotals[action] || 0
  return currentTotal >= config.dailyCap
}

/**
 * Get remaining points available for an action today
 */
export async function getRemainingDailyPoints(
  userId: string,
  action: 'comment' | 'like_received' | 'mention_received'
): Promise<number> {
  const dailyTotals = await getDailyChatPoints(userId)
  const config = CHAT_POINT_CONFIG[action]

  if (!config) return 0

  const currentTotal = dailyTotals[action] || 0
  return Math.max(0, config.dailyCap - currentTotal)
}
