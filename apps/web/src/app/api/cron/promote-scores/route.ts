import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use service role for cron jobs
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sends this header)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Always verify the cron secret - deny by default if not configured
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create service role client (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Call the promotion function
    const { data, error } = await supabase.rpc('promote_pending_scores')

    if (error) {
      console.error('Promotion error:', error)
      return NextResponse.json(
        { error: 'Failed to promote scores', message: error.message },
        { status: 500 }
      )
    }

    const result = Array.isArray(data) ? data[0] : data

    console.log('Score promotion completed:', result)

    return NextResponse.json({
      success: true,
      promoted_count: result?.promoted_count ?? 0,
      conflict_count: result?.conflict_count ?? 0,
      games_processed: result?.games_processed ?? 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}
