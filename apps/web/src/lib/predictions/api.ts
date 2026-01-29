/**
 * Predictions API
 *
 * Functions for interacting with the game predictions system.
 */

import { createClient } from '@/lib/supabase/client'
import type {
  GamePrediction,
  AudienceExpectation,
  PredictionResult,
  PredictionResultEntry,
} from '@/types/database'

/**
 * Get the current user's prediction for a game
 */
export async function getUserPrediction(
  gameId: string,
  userId: string
): Promise<{ prediction: GamePrediction | null; error?: string }> {
  const supabase = createClient()
  if (!supabase) {
    return { prediction: null, error: 'Supabase client not available' }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('game_predictions')
      .select('*')
      .eq('game_id', gameId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected when user hasn't predicted
      console.error('Error fetching prediction:', error)
      return { prediction: null, error: error.message }
    }

    return { prediction: data as GamePrediction | null }
  } catch (err) {
    console.error('Exception fetching prediction:', err)
    return { prediction: null, error: 'Failed to fetch prediction' }
  }
}

/**
 * Submit or update a prediction
 */
export async function submitPrediction(
  gameId: string,
  userId: string,
  homeScore: number,
  awayScore: number
): Promise<{ prediction: GamePrediction | null; error?: string }> {
  const supabase = createClient()
  if (!supabase) {
    return { prediction: null, error: 'Supabase client not available' }
  }

  // Validate scores
  if (homeScore < 0 || awayScore < 0) {
    return { prediction: null, error: 'Scores must be non-negative' }
  }

  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
    return { prediction: null, error: 'Scores must be whole numbers' }
  }

  try {
    // Check if prediction exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('game_predictions')
      .select('id')
      .eq('game_id', gameId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Update existing prediction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('game_predictions')
        .update({
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating prediction:', error)
        return { prediction: null, error: error.message }
      }

      return { prediction: data as GamePrediction }
    } else {
      // Create new prediction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('game_predictions')
        .insert({
          game_id: gameId,
          user_id: userId,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating prediction:', error)
        // Check for lock time violation
        if (error.message.includes('violates row-level security policy')) {
          return { prediction: null, error: 'Predictions are locked for this game' }
        }
        return { prediction: null, error: error.message }
      }

      return { prediction: data as GamePrediction }
    }
  } catch (err) {
    console.error('Exception submitting prediction:', err)
    return { prediction: null, error: 'Failed to submit prediction' }
  }
}

/**
 * Delete a prediction (only before game starts)
 */
export async function deletePrediction(
  gameId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  if (!supabase) {
    return { success: false, error: 'Supabase client not available' }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('game_predictions')
      .delete()
      .eq('game_id', gameId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting prediction:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Exception deleting prediction:', err)
    return { success: false, error: 'Failed to delete prediction' }
  }
}

/**
 * Get audience expectation (aggregated predictions) for a game
 */
export async function getAudienceExpectation(
  gameId: string
): Promise<{ expectation: AudienceExpectation | null; error?: string }> {
  const supabase = createClient()
  if (!supabase) {
    return { expectation: null, error: 'Supabase client not available' }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('get_audience_expectation', {
      p_game_id: gameId,
    })

    if (error) {
      console.error('Error fetching audience expectation:', error)
      return { expectation: null, error: error.message }
    }

    return { expectation: data as AudienceExpectation }
  } catch (err) {
    console.error('Exception fetching audience expectation:', err)
    return { expectation: null, error: 'Failed to fetch audience expectation' }
  }
}

/**
 * Get prediction results for a finalized game
 */
export async function getPredictionResults(
  gameId: string
): Promise<{ results: PredictionResult | null; entries: PredictionResultEntry[]; error?: string }> {
  const supabase = createClient()
  if (!supabase) {
    return { results: null, entries: [], error: 'Supabase client not available' }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('prediction_results')
      .select('*')
      .eq('game_id', gameId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching prediction results:', error)
      return { results: null, entries: [], error: error.message }
    }

    if (!data) {
      return { results: null, entries: [] }
    }

    const results = data as PredictionResult
    const entries = (results.results_json || []) as unknown as PredictionResultEntry[]

    return { results, entries }
  } catch (err) {
    console.error('Exception fetching prediction results:', err)
    return { results: null, entries: [], error: 'Failed to fetch prediction results' }
  }
}

/**
 * Get all predictions for a game (only available after game is final)
 */
export async function getGamePredictions(
  gameId: string
): Promise<{ predictions: GamePrediction[]; error?: string }> {
  const supabase = createClient()
  if (!supabase) {
    return { predictions: [], error: 'Supabase client not available' }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('game_predictions')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching game predictions:', error)
      return { predictions: [], error: error.message }
    }

    return { predictions: (data || []) as GamePrediction[] }
  } catch (err) {
    console.error('Exception fetching game predictions:', err)
    return { predictions: [], error: 'Failed to fetch game predictions' }
  }
}

/**
 * Check if predictions are still open for a game
 */
export async function arePredictionsOpen(
  gameId: string
): Promise<{ open: boolean; reason?: string }> {
  const supabase = createClient()
  if (!supabase) {
    return { open: false, reason: 'Supabase client not available' }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('games')
      .select('predictions_enabled, scheduled_at, status')
      .eq('id', gameId)
      .single()

    if (error) {
      return { open: false, reason: 'Game not found' }
    }

    if (!data.predictions_enabled) {
      return { open: false, reason: 'Predictions not enabled for this game' }
    }

    if (data.status !== 'scheduled') {
      return { open: false, reason: 'Game has already started or finished' }
    }

    const scheduledAt = new Date(data.scheduled_at)
    if (scheduledAt <= new Date()) {
      return { open: false, reason: 'Game has started' }
    }

    return { open: true }
  } catch (err) {
    return { open: false, reason: 'Error checking prediction status' }
  }
}
