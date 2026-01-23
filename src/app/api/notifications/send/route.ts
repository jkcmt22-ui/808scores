import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

// Configure web-push with VAPID keys (only if available)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Only configure VAPID if keys are present
let vapidConfigured = false
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      'mailto:support@808scores.com',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    )
    vapidConfigured = true
  } catch (e) {
    console.error('Failed to configure VAPID:', e)
  }
}

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: {
    gameId?: string
    url?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if VAPID is configured
    if (!vapidConfigured) {
      return NextResponse.json({
        error: 'Push notifications not configured',
        message: 'VAPID keys not set'
      }, { status: 503 })
    }

    // Verify the request has a valid secret (for webhook security)
    const authHeader = request.headers.get('authorization')
    const webhookSecret = process.env.WEBHOOK_SECRET

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { gameId, homeTeam, awayTeam, homeScore, awayScore, status } = body

    if (!gameId) {
      return NextResponse.json({ error: 'gameId is required' }, { status: 400 })
    }

    // Create notification payload
    const payload: NotificationPayload = {
      title: `${awayTeam} @ ${homeTeam}`,
      body: status === 'final'
        ? `Final: ${awayTeam} ${awayScore} - ${homeTeam} ${homeScore}`
        : `Score Update: ${awayTeam} ${awayScore} - ${homeTeam} ${homeScore}`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `game-${gameId}`,
      data: {
        gameId,
        url: `/game/${gameId}`
      }
    }

    // Get all push subscriptions from Supabase
    if (!SUPABASE_SERVICE_KEY) {
      console.log('No service role key - skipping push notifications')
      return NextResponse.json({
        success: true,
        message: 'Service role key not configured',
        sent: 0
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: 'No subscribers', sent: 0 })
    }

    // Send notifications to all subscribers
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
          )
          return { success: true, endpoint: sub.endpoint }
        } catch (err: unknown) {
          const error = err as { statusCode?: number }
          // If subscription is expired/invalid, delete it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint)
          }
          return { success: false, endpoint: sub.endpoint, error: err }
        }
      })
    )

    const sent = results.filter(r => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length
    const failed = results.length - sent

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: subscriptions.length
    })
  } catch (error) {
    console.error('Error sending notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}
