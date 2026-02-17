/**
 * Fair raffle drawing algorithm
 * Weighted random selection based on points earned
 *
 * Raffle Entry Rules:
 * - Monthly raffles: entries = points earned that month
 * - Season-end raffles: entries = total season points
 * - 1 point = 1 entry (automatic, no manual entry needed)
 */

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

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

export type RaffleType = 'monthly' | 'season_end' | 'special'

export interface DrawingEntry {
  userId: string
  displayName: string
  entryCount: number
  avatarUrl: string | null
}

export interface DrawingResult {
  position: number
  userId: string
  displayName: string
  avatarUrl: string | null
  winningEntryNumber: number
}

/**
 * Perform a fair weighted random drawing
 * Each entry gives the user one "ticket" in the drawing
 */
export function performDrawing(
  entries: DrawingEntry[],
  winnerCount: number
): DrawingResult[] {
  if (entries.length === 0) {
    return []
  }

  // Build the ticket pool (each entry = one ticket)
  const ticketPool: { userId: string; displayName: string; avatarUrl: string | null; ticketNumber: number }[] = []
  let ticketNumber = 1

  for (const entry of entries) {
    for (let i = 0; i < entry.entryCount; i++) {
      ticketPool.push({
        userId: entry.userId,
        displayName: entry.displayName,
        avatarUrl: entry.avatarUrl,
        ticketNumber: ticketNumber++,
      })
    }
  }

  // Shuffle using Fisher-Yates algorithm with crypto-random
  const shuffled = [...ticketPool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = unbiasedRandomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // Select winners (no duplicates - same user can't win twice)
  const winners: DrawingResult[] = []
  const selectedUserIds = new Set<string>()
  let position = 1

  for (const ticket of shuffled) {
    if (selectedUserIds.has(ticket.userId)) {
      continue // Skip if user already won
    }

    winners.push({
      position,
      userId: ticket.userId,
      displayName: ticket.displayName,
      avatarUrl: ticket.avatarUrl,
      winningEntryNumber: ticket.ticketNumber,
    })

    selectedUserIds.add(ticket.userId)
    position++

    if (winners.length >= winnerCount) {
      break
    }
  }

  return winners
}

/**
 * Get automatic entries for a raffle based on user points
 * - Monthly raffles: points earned in the raffle's month
 * - Season-end raffles: total season points
 */
export async function getRaffleEntries(
  raffleId: string,
  raffleType: RaffleType = 'monthly',
  month?: string, // Format: '2024-01' for monthly raffles
  client?: SupabaseClient
): Promise<DrawingEntry[]> {
  const supabase = client || createClient()
  if (!supabase) {
    return []
  }

  if (raffleType === 'season_end' || raffleType === 'special') {
    // For season-end/special raffles, use total season points
    return getSeasonPointEntries(supabase)
  } else {
    // For monthly raffles, use points earned that month
    return getMonthlyPointEntries(month, supabase)
  }
}

/**
 * Get entries based on total season points (for season-end raffles)
 */
async function getSeasonPointEntries(client?: SupabaseClient): Promise<DrawingEntry[]> {
  const supabase = client || createClient()
  if (!supabase) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('users')
    .select('id, display_name, avatar_url, season_points')
    .gt('season_points', 0)
    .order('season_points', { ascending: false })

  if (error) {
    console.error('Error fetching season point entries:', error)
    return []
  }

  interface RawUser {
    id: string
    display_name: string | null
    avatar_url: string | null
    season_points: number
  }

  return ((data || []) as RawUser[]).map((user) => ({
    userId: user.id,
    displayName: user.display_name || 'User',
    entryCount: user.season_points,
    avatarUrl: user.avatar_url,
  }))
}

/**
 * Get entries based on points earned in a specific month
 * Points come from: predictions + chat engagement
 */
async function getMonthlyPointEntries(month?: string, client?: SupabaseClient): Promise<DrawingEntry[]> {
  const supabase = client || createClient()
  if (!supabase) return []

  // Determine the month range
  let startDate: Date
  let endDate: Date

  // Use Hawaii timezone for all month boundary calculations
  const now = new Date()
  const hawaiiMonth = parseInt(now.toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu', month: 'numeric' }))
  const hawaiiYear = parseInt(now.toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu', year: 'numeric' }))

  if (month) {
    // Support both 'YYYY-MM' format and month names like 'January'
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december']
    const monthIndex = monthNames.indexOf(month.toLowerCase())

    if (monthIndex !== -1) {
      // Month name format (e.g. "January") — use current year (Hawaii TZ),
      // or previous year if the month is in the future
      const year = monthIndex >= hawaiiMonth ? hawaiiYear - 1 : hawaiiYear
      // Use HST offset (-10:00) for consistent Hawaii midnight boundaries
      startDate = new Date(`${year}-${String(monthIndex + 1).padStart(2, '0')}-01T00:00:00-10:00`)
      endDate = new Date(`${monthIndex === 11 ? year + 1 : year}-${String(monthIndex === 11 ? 1 : monthIndex + 2).padStart(2, '0')}-01T00:00:00-10:00`)
    } else {
      // Parse 'YYYY-MM' format — use Hawaii midnight boundaries
      const [year, monthNum] = month.split('-').map(Number)
      startDate = new Date(`${year}-${String(monthNum).padStart(2, '0')}-01T00:00:00-10:00`)
      endDate = new Date(`${monthNum === 12 ? year + 1 : year}-${String(monthNum === 12 ? 1 : monthNum + 1).padStart(2, '0')}-01T00:00:00-10:00`)
    }
  } else {
    // Default to current month in Hawaii timezone
    startDate = new Date(`${hawaiiYear}-${String(hawaiiMonth).padStart(2, '0')}-01T00:00:00-10:00`)
    const nextMonth = hawaiiMonth === 12 ? 1 : hawaiiMonth + 1
    const nextYear = hawaiiMonth === 12 ? hawaiiYear + 1 : hawaiiYear
    endDate = new Date(`${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00-10:00`)
  }

  // Use server-side RPC to aggregate points (avoids 1000-row default limit)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_raffle_eligible_users', {
    p_start: startDate.toISOString(),
    p_end: endDate.toISOString(),
  })

  if (error) {
    // Fall back to season points if RPC fails
    return getSeasonPointEntries(supabase)
  }

  interface RpcRow {
    user_id: string
    display_name: string | null
    avatar_url: string | null
    total_points: number
  }

  return ((data || []) as RpcRow[]).map((row) => ({
    userId: row.user_id,
    displayName: row.display_name || 'User',
    entryCount: row.total_points,
    avatarUrl: row.avatar_url,
  }))
}

/**
 * Get a specific user's entry count for display
 */
export async function getUserEntryCount(
  userId: string,
  raffleType: RaffleType = 'monthly',
  month?: string
): Promise<number> {
  const entries = await getRaffleEntries('', raffleType, month)
  const userEntry = entries.find(e => e.userId === userId)
  return userEntry?.entryCount || 0
}

/**
 * Execute a raffle drawing and save winners to the database
 */
export async function executeRaffleDrawing(
  raffleId: string,
  winnerCount: number,
  prizeId?: string,
  raffleType: RaffleType = 'monthly',
  month?: string,
  prizeMap?: Record<number, string | null>,
  client?: SupabaseClient
): Promise<{ success: boolean; winners?: DrawingResult[]; error?: string }> {
  const supabase = client || createClient()
  if (!supabase) {
    return { success: false, error: 'Supabase client not available' }
  }

  // Get automatic entries based on points
  const entries = await getRaffleEntries(raffleId, raffleType, month, supabase)
  if (entries.length === 0) {
    return { success: false, error: 'No eligible users found (no one has earned points)' }
  }

  // Perform drawing
  const winners = performDrawing(entries, winnerCount)
  if (winners.length === 0) {
    return { success: false, error: 'Drawing failed to select winners' }
  }

  // Save winners to database
  const winnersToInsert = winners.map((winner) => ({
    raffle_id: raffleId,
    user_id: winner.userId,
    prize_id: (prizeMap && prizeMap[winner.position] !== undefined)
      ? prizeMap[winner.position]
      : prizeId || null,
    position: winner.position,
    winning_entry_number: winner.winningEntryNumber,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertError } = await (supabase as any)
    .from('raffle_winners')
    .insert(winnersToInsert)

  if (insertError) {
    console.error('Error saving winners:', insertError)
    return { success: false, error: 'Failed to save winners' }
  }

  // Update raffle status to completed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('raffles')
    .update({ status: 'completed' })
    .eq('id', raffleId)

  if (updateError) {
    console.error('Error updating raffle status:', updateError)
  }

  return { success: true, winners }
}

/**
 * Calculate the total number of tickets/entries for a raffle
 */
export function getTotalTicketCount(entries: DrawingEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.entryCount, 0)
}

/**
 * Calculate win probability for a user
 */
export function calculateWinProbability(
  userEntryCount: number,
  totalTickets: number,
  winnerCount: number = 1
): number {
  if (totalTickets === 0 || userEntryCount === 0) {
    return 0
  }

  // Simple approximation: probability of winning at least one position
  // For small winner counts this is approximately: (userEntries * winnerCount) / totalTickets
  const probability = (userEntryCount * winnerCount) / totalTickets
  return Math.min(probability, 1) // Cap at 100%
}
