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
      'mailto:contact@hawaiisportscenter.com',
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
    type?: string
  }
}

interface PushSubscription {
  endpoint: string
  p256dh: string | null
  auth: string | null
  platform: string | null
}

// Send Expo push notifications
async function sendExpoPushNotifications(
  tokens: string[],
  payload: NotificationPayload
): Promise<{ sent: number; failed: number }> {
  if (tokens.length === 0) {
    return { sent: 0, failed: 0 }
  }

  // Expo push notification format
  const messages = tokens.map(token => ({
    to: token,
    title: payload.title,
    body: payload.body,
    data: payload.data,
    sound: 'default',
    badge: 1,
    categoryId: payload.data?.type || 'score_update',
  }))

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const result = await response.json()

    let sent = 0
    let failed = 0

    if (result.data) {
      for (const ticket of result.data) {
        if (ticket.status === 'ok') {
          sent++
        } else {
          failed++
        }
      }
    }

    return { sent, failed }
  } catch (error) {
    console.error('Error sending Expo push notifications:', error)
    return { sent: 0, failed: tokens.length }
  }
}

type NotificationType = 'score_update' | 'game_start' | 'game_final' | 'playoff_alert'

interface SendNotificationBody {
  gameId: string
  homeTeam: string
  awayTeam: string
  homeTeamId?: string
  awayTeamId?: string
  homeScore?: number
  awayScore?: number
  status?: string
  gameType?: 'regular_season' | 'playoff' | 'championship' | 'tournament'
  notificationType?: NotificationType
  sportName?: string
}

// Get game type badge for notification title
function getGameTypePrefix(gameType: string | undefined): string {
  switch (gameType) {
    case 'playoff':
      return 'PLAYOFF: '
    case 'championship':
      return 'CHAMPIONSHIP: '
    case 'tournament':
      return 'TOURNEY: '
    default:
      return ''
  }
}

// Build notification message based on type
function buildNotificationPayload(body: SendNotificationBody): NotificationPayload {
  const {
    gameId,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    status,
    gameType,
    notificationType,
    sportName
  } = body

  const gamePrefix = getGameTypePrefix(gameType)
  const sportLabel = sportName ? ` (${sportName})` : ''

  let title = `${gamePrefix}${awayTeam} @ ${homeTeam}`
  let notificationBody = ''

  switch (notificationType) {
    case 'game_start':
      title = `${gamePrefix}Game Starting${sportLabel}`
      notificationBody = `${awayTeam} @ ${homeTeam} is about to begin!`
      break
    case 'game_final':
      title = `${gamePrefix}Final${sportLabel}`
      notificationBody = `${awayTeam} ${awayScore} - ${homeTeam} ${homeScore}`
      break
    case 'playoff_alert':
      title = `${gamePrefix}${awayTeam} @ ${homeTeam}${sportLabel}`
      if (status === 'final') {
        notificationBody = `Final: ${awayTeam} ${awayScore} - ${homeTeam} ${homeScore}`
      } else if (status === 'in_progress') {
        notificationBody = `LIVE: ${awayTeam} ${awayScore} - ${homeTeam} ${homeScore}`
      } else {
        notificationBody = 'Game starting soon!'
      }
      break
    case 'score_update':
    default:
      notificationBody = status === 'final'
        ? `Final: ${awayTeam} ${awayScore} - ${homeTeam} ${homeScore}`
        : `Score Update: ${awayTeam} ${awayScore} - ${homeTeam} ${homeScore}`
      break
  }

  return {
    title,
    body: notificationBody,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `game-${gameId}`,
    data: {
      gameId,
      url: `/game/${gameId}`,
      type: notificationType || 'score_update'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify the request has a valid secret (mandatory)
    const authHeader = request.headers.get('authorization')
    const webhookSecret = process.env.WEBHOOK_SECRET

    // Require WEBHOOK_SECRET in all environments
    if (!webhookSecret) {
      console.error('WEBHOOK_SECRET not configured - request denied for security')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 503 })
    }

    if (authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: SendNotificationBody = await request.json()
    const { gameId, homeTeamId, awayTeamId, gameType } = body

    if (!gameId) {
      return NextResponse.json({ error: 'gameId is required' }, { status: 400 })
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

    // Determine notification targeting
    const isRegularSeason = gameType === 'regular_season'
    const isTargetedNotification = (homeTeamId && awayTeamId)

    let subscriptions: PushSubscription[] = []

    if (isTargetedNotification) {
      // Get users who follow either team with notifications enabled
      const { data: teamFollowers, error: followError } = await supabase
        .from('team_follows')
        .select('user_id')
        .in('school_id', [homeTeamId, awayTeamId])
        .eq('notify', true)

      if (followError) {
        console.error('Error fetching team followers:', followError)
      }

      if (teamFollowers && teamFollowers.length > 0) {
        // Get unique user IDs
        let userIds = [...new Set(teamFollowers.map(f => f.user_id))]

        // Filter by user notification preferences
        // 1. Must have notifications_enabled = true (global opt-in)
        // 2. For regular season, must also have regular_season_notifications = true
        let userQuery = supabase
          .from('users')
          .select('id')
          .in('id', userIds)
          .eq('notifications_enabled', true)

        if (isRegularSeason) {
          userQuery = userQuery.eq('regular_season_notifications', true)
        }

        const { data: eligibleUsers, error: userError } = await userQuery

        if (userError) {
          console.error('Error fetching user preferences:', userError)
        }

        if (eligibleUsers && eligibleUsers.length > 0) {
          userIds = eligibleUsers.map(u => u.id)

          // Get push subscriptions for these users
          const { data: userSubs, error: subError } = await supabase
            .from('push_subscriptions')
            .select('endpoint, p256dh, auth, platform')
            .in('user_id', userIds)

          if (subError) {
            console.error('Error fetching user subscriptions:', subError)
          }

          subscriptions = (userSubs || []) as PushSubscription[]
          console.log(`${isRegularSeason ? 'Regular season' : 'Playoff'} notification: ${subscriptions.length} subscribers for teams ${homeTeamId}, ${awayTeamId}`)
        }
      }
    } else {
      // Fallback: send to all subscribers with notifications enabled
      // First get users with notifications enabled
      let userQuery = supabase
        .from('users')
        .select('id')
        .eq('notifications_enabled', true)

      if (isRegularSeason) {
        userQuery = userQuery.eq('regular_season_notifications', true)
      }

      const { data: eligibleUsers } = await userQuery

      if (eligibleUsers && eligibleUsers.length > 0) {
        const userIds = eligibleUsers.map(u => u.id)

        const { data, error } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth, platform')
          .in('user_id', userIds)

        if (error) {
          console.error('Error fetching subscriptions:', error)
          return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
        }

        subscriptions = (data || []) as PushSubscription[]
      }
    }

    if (subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: 'No subscribers', sent: 0 })
    }

    // Build notification payload
    const payload = buildNotificationPayload(body)

    // Separate web and expo subscriptions
    const webSubscriptions = subscriptions.filter(
      sub => sub.platform !== 'expo' && sub.p256dh && sub.auth
    )
    const expoSubscriptions = subscriptions.filter(sub => sub.platform === 'expo')
    const expoTokens = expoSubscriptions.map(sub => sub.endpoint)

    let webSent = 0
    let webFailed = 0
    let expoSent = 0
    let expoFailed = 0

    // Send web push notifications (only if VAPID is configured)
    if (vapidConfigured && webSubscriptions.length > 0) {
      const results = await Promise.allSettled(
        webSubscriptions.map(async (sub) => {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh!,
              auth: sub.auth!
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

      webSent = results.filter(r => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length
      webFailed = results.length - webSent
    }

    // Send Expo push notifications
    if (expoTokens.length > 0) {
      const expoResult = await sendExpoPushNotifications(expoTokens, payload)
      expoSent = expoResult.sent
      expoFailed = expoResult.failed
    }

    const totalSent = webSent + expoSent
    const totalFailed = webFailed + expoFailed

    return NextResponse.json({
      success: true,
      sent: totalSent,
      failed: totalFailed,
      total: subscriptions.length,
      targeted: isTargetedNotification,
      breakdown: {
        web: { sent: webSent, failed: webFailed, total: webSubscriptions.length },
        expo: { sent: expoSent, failed: expoFailed, total: expoSubscriptions.length }
      }
    })
  } catch (error) {
    console.error('Error sending notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}
