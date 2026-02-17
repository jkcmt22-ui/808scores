import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { executeRaffleDrawing, type RaffleType } from '@/lib/raffle/drawing'

interface DrawRequest {
  raffleId: string
  winnerCount: number
  prizeId?: string
  raffleType?: RaffleType
  month?: string
  prizeMap?: Record<number, string | null>
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Authenticate
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Check admin role
    const { data: permData } = await supabase.rpc('get_user_permissions', { p_user_id: user.id } as never)
    const perms = (Array.isArray(permData) ? permData[0] : permData) as {
      is_admin?: boolean
      is_super_admin?: boolean
    } | null

    if (!perms?.is_admin && !perms?.is_super_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Parse request
    const body: DrawRequest = await request.json()
    const {
      raffleId,
      winnerCount,
      prizeId,
      raffleType = 'monthly',
      month,
      prizeMap,
    } = body

    if (!raffleId || !winnerCount) {
      return NextResponse.json(
        { error: 'Missing required fields: raffleId and winnerCount' },
        { status: 400 }
      )
    }

    // 4. Execute drawing using server-side Supabase client (bypasses RLS)
    const result = await executeRaffleDrawing(
      raffleId,
      winnerCount,
      prizeId,
      raffleType,
      month,
      prizeMap,
      supabase as never
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Drawing failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      winners: result.winners,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to execute drawing', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
