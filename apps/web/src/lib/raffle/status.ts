/**
 * Auto-transition raffle status based on current dates (Hawaii timezone).
 * Called on fetch to keep statuses current without a cron job.
 *
 * Transitions:
 * - upcoming → open    when now >= entries_open_at
 * - open → closed      when now >= entries_close_at
 */

import { createClient } from '@/lib/supabase/client'

export async function autoTransitionRaffleStatuses(): Promise<number> {
  const supabase = createClient()
  if (!supabase) return 0

  const now = new Date().toISOString()
  let transitioned = 0

  // upcoming → open (entries have opened)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: toOpen } = await (supabase as any)
    .from('raffles')
    .update({ status: 'open' })
    .eq('status', 'upcoming')
    .eq('is_active', true)
    .lte('entries_open_at', now)
    .select('id')

  if (toOpen) transitioned += toOpen.length

  // open → closed (entries have closed)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: toClosed } = await (supabase as any)
    .from('raffles')
    .update({ status: 'closed' })
    .eq('status', 'open')
    .eq('is_active', true)
    .lte('entries_close_at', now)
    .select('id')

  if (toClosed) transitioned += toClosed.length

  return transitioned
}
