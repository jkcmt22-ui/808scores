'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  AlertCircle,
  Users,
  Calendar,
  MessageSquare,
  Trophy,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
} from 'lucide-react'
import { Button, Card, Badge } from '@/components/ui'
import { useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  // Users
  totalUsers: number
  newUsersLast7Days: number
  newUsersLast30Days: number
  trustedReporters: number
  admins: number

  // Games
  totalGames: number
  gamesThisWeek: number
  gamesToday: number
  liveGames: number
  completedGames: number

  // Submissions
  totalSubmissions: number
  submissionsThisWeek: number
  pendingSubmissions: number
  verifiedSubmissions: number

  // Chat
  totalChatMessages: number
  chatMessagesThisWeek: number

  // Raffles
  activeRaffles: number
  totalRaffleEntries: number

  // Top contributors
  topContributors: Array<{
    id: string
    display_name: string | null
    submission_count: number
    verified_count: number
    reputation_score: number
  }>

  // Recent activity
  recentSubmissions: Array<{
    id: string
    created_at: string
    submission_type: string
    status: string
    user: { display_name: string | null }
    game: {
      home_team: { short_name: string }
      away_team: { short_name: string }
    }
  }>

  // Games by status
  gamesByStatus: {
    scheduled: number
    in_progress: number
    final: number
    postponed: number
    canceled: number
  }

  // Daily stats (last 7 days)
  dailyStats: Array<{
    date: string
    users: number
    submissions: number
    games: number
    messages: number
  }>
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient()!, [])

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isSuperAdmin = profile?.is_super_admin === true

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Fetch all data in parallel
      const [
        usersRes,
        newUsersWeekRes,
        newUsersMonthRes,
        trustedRes,
        adminsRes,
        gamesRes,
        gamesWeekRes,
        gamesTodayRes,
        liveGamesRes,
        completedGamesRes,
        submissionsRes,
        submissionsWeekRes,
        pendingRes,
        verifiedRes,
        chatRes,
        chatWeekRes,
        rafflesRes,
        entriesRes,
        topContributorsRes,
        recentSubmissionsRes,
        scheduledGamesRes,
        postponedGamesRes,
        canceledGamesRes,
      ] = await Promise.all([
        // Users
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
        supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', monthAgo.toISOString()),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_trusted_reporter', true),
        supabase.from('users').select('id', { count: 'exact', head: true }).or('is_admin.eq.true,is_super_admin.eq.true'),

        // Games
        supabase.from('games').select('id', { count: 'exact', head: true }),
        supabase.from('games').select('id', { count: 'exact', head: true }).gte('scheduled_at', weekAgo.toISOString()),
        supabase.from('games').select('id', { count: 'exact', head: true }).gte('scheduled_at', today.toISOString()).lt('scheduled_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('games').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('games').select('id', { count: 'exact', head: true }).eq('status', 'final'),

        // Submissions
        supabase.from('submissions').select('id', { count: 'exact', head: true }),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'published'),

        // Chat
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),

        // Raffles
        supabase.from('raffles').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('raffle_entries').select('id', { count: 'exact', head: true }),

        // Top contributors
        supabase.from('users')
          .select('id, display_name, submission_count, verified_count, reputation_score')
          .order('submission_count', { ascending: false })
          .limit(10),

        // Recent submissions
        supabase.from('submissions')
          .select(`
            id, created_at, submission_type, status,
            user:users(display_name),
            game:games(
              home_team:schools!games_home_team_id_fkey(short_name),
              away_team:schools!games_away_team_id_fkey(short_name)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10),

        // Games by status
        supabase.from('games').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
        supabase.from('games').select('id', { count: 'exact', head: true }).eq('status', 'postponed'),
        supabase.from('games').select('id', { count: 'exact', head: true }).eq('status', 'canceled'),
      ])

      // Build daily stats for last 7 days
      const dailyStats: AnalyticsData['dailyStats'] = []
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

        const [dayUsers, daySubmissions, dayGames, dayMessages] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true })
            .gte('created_at', dayStart.toISOString())
            .lt('created_at', dayEnd.toISOString()),
          supabase.from('submissions').select('id', { count: 'exact', head: true })
            .gte('created_at', dayStart.toISOString())
            .lt('created_at', dayEnd.toISOString()),
          supabase.from('games').select('id', { count: 'exact', head: true })
            .gte('scheduled_at', dayStart.toISOString())
            .lt('scheduled_at', dayEnd.toISOString()),
          supabase.from('chat_messages').select('id', { count: 'exact', head: true })
            .gte('created_at', dayStart.toISOString())
            .lt('created_at', dayEnd.toISOString()),
        ])

        dailyStats.push({
          date: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          users: dayUsers.count || 0,
          submissions: daySubmissions.count || 0,
          games: dayGames.count || 0,
          messages: dayMessages.count || 0,
        })
      }

      setData({
        totalUsers: usersRes.count || 0,
        newUsersLast7Days: newUsersWeekRes.count || 0,
        newUsersLast30Days: newUsersMonthRes.count || 0,
        trustedReporters: trustedRes.count || 0,
        admins: adminsRes.count || 0,

        totalGames: gamesRes.count || 0,
        gamesThisWeek: gamesWeekRes.count || 0,
        gamesToday: gamesTodayRes.count || 0,
        liveGames: liveGamesRes.count || 0,
        completedGames: completedGamesRes.count || 0,

        totalSubmissions: submissionsRes.count || 0,
        submissionsThisWeek: submissionsWeekRes.count || 0,
        pendingSubmissions: pendingRes.count || 0,
        verifiedSubmissions: verifiedRes.count || 0,

        totalChatMessages: chatRes.count || 0,
        chatMessagesThisWeek: chatWeekRes.count || 0,

        activeRaffles: rafflesRes.count || 0,
        totalRaffleEntries: entriesRes.count || 0,

        topContributors: (topContributorsRes.data || []) as AnalyticsData['topContributors'],
        recentSubmissions: (recentSubmissionsRes.data || []) as AnalyticsData['recentSubmissions'],

        gamesByStatus: {
          scheduled: scheduledGamesRes.count || 0,
          in_progress: liveGamesRes.count || 0,
          final: completedGamesRes.count || 0,
          postponed: postponedGamesRes.count || 0,
          canceled: canceledGamesRes.count || 0,
        },

        dailyStats,
      })
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAnalytics()
    }
  }, [isSuperAdmin, fetchAnalytics])

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
        <span className="mt-4 font-display text-sm text-foreground-muted uppercase tracking-wider">
          Loading...
        </span>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    router.push('/login?redirect=/admin/analytics')
    return null
  }

  // No super admin access
  if (!isSuperAdmin) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
        <AlertCircle className="mb-4 h-12 w-12 text-neon-pink" />
        <h1 className="mb-2 font-display text-xl font-bold text-foreground uppercase">
          Access Denied
        </h1>
        <p className="mb-4 text-foreground-muted text-sm text-center">
          Only super admins can view the analytics dashboard.
        </p>
        <Button onClick={() => router.push('/admin')}>Go to Admin</Button>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold neon-text-yellow uppercase tracking-wider">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Platform metrics and insights
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchAnalytics}
          disabled={isLoading}
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-3 text-sm border-2 bg-neon-pink/10 border-neon-pink/30 text-neon-pink">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={data.totalUsers}
              subValue={`+${data.newUsersLast7Days} this week`}
              icon={Users}
              trend={data.newUsersLast7Days > 0 ? 'up' : 'neutral'}
              color="blue"
            />
            <StatCard
              title="Total Games"
              value={data.totalGames}
              subValue={`${data.gamesToday} today`}
              icon={Calendar}
              color="pink"
            />
            <StatCard
              title="Submissions"
              value={data.totalSubmissions}
              subValue={`+${data.submissionsThisWeek} this week`}
              icon={FileText}
              trend={data.submissionsThisWeek > 0 ? 'up' : 'neutral'}
              color="green"
            />
            <StatCard
              title="Chat Messages"
              value={data.totalChatMessages}
              subValue={`+${data.chatMessagesThisWeek} this week`}
              icon={MessageSquare}
              trend={data.chatMessagesThisWeek > 0 ? 'up' : 'neutral'}
              color="yellow"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <MiniStatCard
              title="Live Games"
              value={data.liveGames}
              icon={Activity}
              highlight={data.liveGames > 0}
            />
            <MiniStatCard
              title="Pending Submissions"
              value={data.pendingSubmissions}
              icon={Clock}
              highlight={data.pendingSubmissions > 0}
            />
            <MiniStatCard
              title="Trusted Reporters"
              value={data.trustedReporters}
              icon={CheckCircle}
            />
            <MiniStatCard
              title="Active Raffles"
              value={data.activeRaffles}
              icon={Trophy}
            />
            <MiniStatCard
              title="Raffle Entries"
              value={data.totalRaffleEntries}
              icon={Eye}
            />
          </div>

          {/* Daily Activity Chart */}
          <Card className="p-4 border-2">
            <h2 className="font-display font-bold text-lg text-foreground uppercase tracking-wider mb-4">
              Daily Activity (Last 7 Days)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-2 px-3 font-display uppercase text-foreground-muted">Date</th>
                    <th className="text-right py-2 px-3 font-display uppercase text-neon-blue">Users</th>
                    <th className="text-right py-2 px-3 font-display uppercase text-neon-green">Submissions</th>
                    <th className="text-right py-2 px-3 font-display uppercase text-neon-pink">Games</th>
                    <th className="text-right py-2 px-3 font-display uppercase text-neon-yellow">Messages</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyStats.map((day, i) => (
                    <tr key={day.date} className={cn('border-b border-border', i === data.dailyStats.length - 1 && 'border-b-0')}>
                      <td className="py-2 px-3 font-mono text-foreground">{day.date}</td>
                      <td className="py-2 px-3 text-right font-mono text-neon-blue">{day.users}</td>
                      <td className="py-2 px-3 text-right font-mono text-neon-green">{day.submissions}</td>
                      <td className="py-2 px-3 text-right font-mono text-neon-pink">{day.games}</td>
                      <td className="py-2 px-3 text-right font-mono text-neon-yellow">{day.messages}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Games by Status */}
            <Card className="p-4 border-2">
              <h2 className="font-display font-bold text-lg text-foreground uppercase tracking-wider mb-4">
                Games by Status
              </h2>
              <div className="space-y-3">
                <StatusBar label="Scheduled" value={data.gamesByStatus.scheduled} total={data.totalGames} color="blue" />
                <StatusBar label="In Progress" value={data.gamesByStatus.in_progress} total={data.totalGames} color="pink" />
                <StatusBar label="Final" value={data.gamesByStatus.final} total={data.totalGames} color="green" />
                <StatusBar label="Postponed" value={data.gamesByStatus.postponed} total={data.totalGames} color="yellow" />
                <StatusBar label="Canceled" value={data.gamesByStatus.canceled} total={data.totalGames} color="gray" />
              </div>
            </Card>

            {/* Top Contributors */}
            <Card className="p-4 border-2">
              <h2 className="font-display font-bold text-lg text-foreground uppercase tracking-wider mb-4">
                Top Contributors
              </h2>
              <div className="space-y-2">
                {data.topContributors.slice(0, 5).map((user, i) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-2 px-3 bg-background-secondary rounded"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold',
                        i === 0 && 'bg-neon-yellow/20 text-neon-yellow',
                        i === 1 && 'bg-foreground/20 text-foreground',
                        i === 2 && 'bg-neon-pink/20 text-neon-pink',
                        i > 2 && 'bg-background-tertiary text-foreground-muted'
                      )}>
                        {i + 1}
                      </span>
                      <span className="font-display text-foreground">
                        {user.display_name || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-foreground-muted">
                        <span className="text-neon-green font-bold">{user.verified_count}</span>
                        /{user.submission_count}
                      </span>
                      <span className="text-neon-blue font-mono font-bold">
                        {user.reputation_score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Submissions */}
          <Card className="p-4 border-2">
            <h2 className="font-display font-bold text-lg text-foreground uppercase tracking-wider mb-4">
              Recent Submissions
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-2 px-3 font-display uppercase text-foreground-muted">Time</th>
                    <th className="text-left py-2 px-3 font-display uppercase text-foreground-muted">User</th>
                    <th className="text-left py-2 px-3 font-display uppercase text-foreground-muted">Game</th>
                    <th className="text-left py-2 px-3 font-display uppercase text-foreground-muted">Type</th>
                    <th className="text-left py-2 px-3 font-display uppercase text-foreground-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSubmissions.map((sub) => (
                    <tr key={sub.id} className="border-b border-border last:border-b-0">
                      <td className="py-2 px-3 font-mono text-xs text-foreground-muted">
                        {new Date(sub.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3 text-foreground">
                        {sub.user?.display_name || 'Anonymous'}
                      </td>
                      <td className="py-2 px-3 text-foreground font-display">
                        {sub.game?.away_team?.short_name} @ {sub.game?.home_team?.short_name}
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="secondary" className="text-[10px]">
                          {sub.submission_type.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Badge
                          variant={
                            sub.status === 'published' ? 'success' :
                            sub.status === 'pending' ? 'warning' :
                            sub.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                          className="text-[10px]"
                        >
                          {sub.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  color = 'blue',
}: {
  title: string
  value: number
  subValue?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  color?: 'blue' | 'pink' | 'green' | 'yellow'
}) {
  const colorClasses = {
    blue: 'border-neon-blue/30 text-neon-blue',
    pink: 'border-neon-pink/30 text-neon-pink',
    green: 'border-neon-green/30 text-neon-green',
    yellow: 'border-neon-yellow/30 text-neon-yellow',
  }

  return (
    <Card className={cn('p-4 border-2', colorClasses[color].split(' ')[0])}>
      <div className="flex items-start justify-between mb-2">
        <Icon className={cn('h-5 w-5', colorClasses[color].split(' ')[1])} aria-hidden="true" />
        {trend === 'up' && <TrendingUp className="h-4 w-4 text-neon-green" aria-hidden="true" />}
        {trend === 'down' && <TrendingDown className="h-4 w-4 text-neon-pink" aria-hidden="true" />}
      </div>
      <p className="font-display text-xs text-foreground-muted uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className={cn('font-mono text-3xl font-bold', colorClasses[color].split(' ')[1])}>
        {value.toLocaleString()}
      </p>
      {subValue && (
        <p className="text-xs text-foreground-subtle mt-1">{subValue}</p>
      )}
    </Card>
  )
}

// Mini Stat Card
function MiniStatCard({
  title,
  value,
  icon: Icon,
  highlight,
}: {
  title: string
  value: number
  icon: React.ElementType
  highlight?: boolean
}) {
  return (
    <Card className={cn(
      'p-3 border-2',
      highlight ? 'border-neon-pink/50 bg-neon-pink/5' : 'border-border'
    )}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('h-4 w-4', highlight ? 'text-neon-pink' : 'text-foreground-muted')} aria-hidden="true" />
        <span className="text-xs text-foreground-muted uppercase tracking-wider">{title}</span>
      </div>
      <p className={cn(
        'font-mono text-xl font-bold',
        highlight ? 'text-neon-pink' : 'text-foreground'
      )}>
        {value.toLocaleString()}
      </p>
    </Card>
  )
}

// Status Bar Component
function StatusBar({
  label,
  value,
  total,
  color = 'blue',
}: {
  label: string
  value: number
  total: number
  color?: 'blue' | 'pink' | 'green' | 'yellow' | 'gray'
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  const colorClasses = {
    blue: 'bg-neon-blue',
    pink: 'bg-neon-pink',
    green: 'bg-neon-green',
    yellow: 'bg-neon-yellow',
    gray: 'bg-foreground-muted',
  }

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-foreground-muted">{label}</span>
        <span className="font-mono text-foreground">{value}</span>
      </div>
      <div className="h-2 bg-background-tertiary rounded overflow-hidden">
        <div
          className={cn('h-full transition-all', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
