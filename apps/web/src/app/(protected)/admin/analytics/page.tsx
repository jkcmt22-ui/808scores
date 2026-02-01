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
  const supabase = useMemo(() => createClient(), [])

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isSuperAdmin = profile?.is_super_admin === true
  const hasAdminAccess = profile?.is_admin === true || isSuperAdmin

  const fetchAnalytics = useCallback(async () => {
    if (!supabase) {
      setError('Database connection not available')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Single RPC call instead of 50+ queries
      const { data: analyticsData, error: rpcError } = await supabase.rpc('get_admin_analytics')

      if (rpcError) throw rpcError

      // Parse JSON response
      const analytics = analyticsData as any

      // Format daily stats with proper date formatting
      const formattedDailyStats = (analytics.daily_stats || []).map((day: any) => ({
        date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        users: day.new_users || 0,
        submissions: day.new_submissions || 0,
        games: day.new_games || 0,
        messages: day.new_messages || 0,
      }))

      setData({
        // User metrics
        totalUsers: analytics.users.total,
        newUsersLast7Days: analytics.users.last_7_days,
        newUsersLast30Days: analytics.users.last_30_days,
        trustedReporters: analytics.users.trusted,
        admins: analytics.users.admins,

        // Game metrics
        totalGames: analytics.games.total,
        gamesThisWeek: analytics.games.this_week,
        gamesToday: analytics.games.today,
        liveGames: analytics.games.live,
        completedGames: analytics.games.completed,

        // Submission metrics
        totalSubmissions: analytics.submissions.total,
        submissionsThisWeek: analytics.submissions.this_week,
        pendingSubmissions: analytics.submissions.pending,
        verifiedSubmissions: analytics.submissions.verified,

        // Chat metrics
        totalChatMessages: analytics.chat.total,
        chatMessagesThisWeek: analytics.chat.this_week,

        // Raffle metrics
        activeRaffles: analytics.raffles.active,
        totalRaffleEntries: analytics.raffles.total_entries,

        // Aggregated data
        topContributors: analytics.top_contributors || [],
        recentSubmissions: analytics.recent_submissions || [],

        // Games by status
        gamesByStatus: analytics.games.by_status,

        // Daily stats
        dailyStats: formattedDailyStats,
      })
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (hasAdminAccess) {
      fetchAnalytics()
    }
  }, [hasAdminAccess, fetchAnalytics])

  // NOTE: Basic auth checks (loading, user, profile, admin access) are handled by AdminLayout
  // Analytics is available to all admins (both admin and super admin)

  // No admin access (this is page-specific, not handled by layout)
  if (!hasAdminAccess) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
        <AlertCircle className="mb-4 h-12 w-12 text-neon-pink" />
        <h1 className="mb-2 font-display text-xl font-bold text-foreground uppercase">
          Access Denied
        </h1>
        <p className="mb-4 text-foreground-muted text-sm text-center">
          You need admin access to view the analytics dashboard.
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
