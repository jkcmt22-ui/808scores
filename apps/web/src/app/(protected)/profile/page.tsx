'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout'
import { Card, Badge, Button, Avatar } from '@/components/ui'
import {
  Trophy,
  Target,
  TrendingUp,
  Star,
  Award,
  Shield,
  Settings,
  LogOut,
  ChevronRight,
  Loader2,
  History,
  ChevronDown,
} from 'lucide-react'
import { getTierColor, getTierLabel } from '@/lib/utils'
import { useRequireAuth, useUserBadges } from '@/hooks'
import { usePointEvents, getEventTypeDisplay, formatEventTime } from '@/hooks/use-point-events'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// Badge emoji mapping (fallback when no icon_url)
const BADGE_ICONS: Record<string, string> = {
  first_score: '🎯',
  verified_5: '✅',
  verified_25: '🌟',
  verified_100: '⭐',
  accuracy_90: '🎯',
  night_owl: '🦉',
  early_bird: '🐦',
  streak_7: '🔥',
  multi_sport: '🏆',
  golden_game: '👑',
  trusted: '🛡️',
  chat_active: '💬',
  liked_10: '❤️',
}

interface RecentSubmission {
  id: string
  game: {
    id: string
    home_team: { school: { short_name: string } }
    away_team: { school: { short_name: string } }
    sport: { name: string }
  }
  points_earned: number
  status: string
  created_at: string
}

export default function ProfilePage() {
  const { profile, isLoading, isProfileLoading, signOut } = useRequireAuth()
  const { userBadges, isLoading: badgesLoading } = useUserBadges(profile?.id)
  const { events: pointEvents, isLoading: pointEventsLoading, hasMore, loadMore } = usePointEvents(profile?.id)
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(true)

  useEffect(() => {
    async function fetchRecentSubmissions() {
      if (!profile?.id) return

      const supabase = createClient()
      if (!supabase) return

      try {
        // After migration 072, games reference teams instead of schools
        const { data: submissions } = await supabase
          .from('submissions')
          .select(`
            id,
            points_earned,
            status,
            created_at,
            game:games(
              id,
              home_team:teams!games_home_team_id_fkey(school:schools(short_name)),
              away_team:teams!games_away_team_id_fkey(school:schools(short_name)),
              sport:sports(name)
            )
          `)
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (submissions) {
          setRecentSubmissions(submissions as unknown as RecentSubmission[])
        }
      } catch (error) {
        console.error('Error fetching submissions:', error)
      } finally {
        setLoadingSubmissions(false)
      }
    }

    fetchRecentSubmissions()
  }, [profile?.id])

  // Wait for both auth AND profile to finish loading
  if (isLoading || isProfileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
      </div>
    )
  }

  // Show loading state instead of blank screen during redirect
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
        <span className="ml-3 font-display text-sm text-foreground-muted uppercase tracking-wider">
          Redirecting to login...
        </span>
      </div>
    )
  }

  const nextTier = profile.tier === 'elite' ? null : profile.tier === 'verified' ? 'elite' : profile.tier === 'standard' ? 'verified' : 'standard'
  const tierThresholds: Record<string, number> = {
    standard: 31,
    verified: 61,
    elite: 91,
  }
  const pointsToNextTier = nextTier && tierThresholds[nextTier]
    ? tierThresholds[nextTier] - profile.reputation_score
    : 0

  // Format phone for display
  const formatPhone = (phone: string | null) => {
    if (!phone) return 'Not set'
    const digits = phone.replace(/\D/g, '').slice(-10)
    return `(${digits.slice(0, 3)}) ***-**${digits.slice(-2)}`
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      <Header title="Profile" />

      <main className="px-4 pb-8">
        {/* User card */}
        <Card className="mb-6 border-2 border-border">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <Avatar
                src={profile.avatar_url}
                alt={profile.display_name || 'Profile'}
                fallback={profile.display_name?.slice(0, 2) || 'U'}
                className="h-16 w-16 rounded-full border-2 border-border text-lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{profile.display_name || 'User'}</h2>
                  <Badge className={getTierColor(profile.tier)}>{getTierLabel(profile.tier)}</Badge>
                </div>
                <p className="text-sm text-foreground-muted">{profile.email || formatPhone(profile.phone)}</p>
                <p className="text-xs text-foreground-subtle">
                  Member since {new Date(profile.created_at).toLocaleDateString('en-US', { timeZone: 'Pacific/Honolulu' })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats grid */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Card className="border-2 border-border">
            <div className="p-4 text-center">
              <Trophy className="mx-auto mb-2 h-6 w-6 text-neon-yellow" />
              <p className="text-2xl font-bold text-neon-blue">{profile.total_points}</p>
              <p className="text-xs text-foreground-muted">Total Points</p>
            </div>
          </Card>
          <Card className="border-2 border-border">
            <div className="p-4 text-center">
              <Target className="mx-auto mb-2 h-6 w-6 text-neon-green" />
              <p className="text-2xl font-bold text-neon-green">
                {profile.accuracy_rate != null ? `${profile.accuracy_rate}%` : '-'}
              </p>
              <p className="text-xs text-foreground-muted">Accuracy</p>
            </div>
          </Card>
          <Card className="border-2 border-border">
            <div className="p-4 text-center">
              <TrendingUp className="mx-auto mb-2 h-6 w-6 text-neon-purple" />
              <p className="text-2xl font-bold text-foreground">{profile.submission_count}</p>
              <p className="text-xs text-foreground-muted">Submissions</p>
            </div>
          </Card>
          <Card className="border-2 border-border">
            <div className="p-4 text-center">
              <Star className="mx-auto mb-2 h-6 w-6 text-neon-yellow" />
              <p className="text-2xl font-bold text-foreground">{profile.verified_count}</p>
              <p className="text-xs text-foreground-muted">Verified</p>
            </div>
          </Card>
        </div>

        {/* Reputation progress */}
        <Card className="mb-6 border-2 border-border">
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Reputation Progress</h3>
              <span className="text-sm text-foreground-muted">{profile.reputation_score}/100</span>
            </div>
            <div className="mb-2 h-3 overflow-hidden rounded-full bg-background-tertiary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple"
                style={{ width: `${profile.reputation_score}%` }}
              />
            </div>
            <p className="text-xs text-foreground-muted">
              {pointsToNextTier > 0
                ? `${pointsToNextTier} more reputation points to reach ${getTierLabel(nextTier!)}`
                : 'Max tier reached!'}
            </p>
          </div>
        </Card>

        {/* Badges */}
        <Card className="mb-6 border-2 border-border">
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Badges</h3>
              <Link href="/profile/badges" className="text-sm text-neon-blue hover:underline">
                {userBadges.length} earned &rarr;
              </Link>
            </div>
            {badgesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
              </div>
            ) : userBadges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {userBadges.slice(0, 6).map((ub) => {
                  const icon = BADGE_ICONS[ub.badge.code] || '🏅'
                  return (
                    <div
                      key={ub.badge_id}
                      className="flex items-center gap-2 rounded-full bg-neon-yellow/10 border border-neon-yellow/30 px-3 py-1.5"
                    >
                      <span>{icon}</span>
                      <span className="text-sm font-medium text-foreground">{ub.badge.name}</span>
                    </div>
                  )
                })}
                {userBadges.length > 6 && (
                  <Link
                    href="/profile/badges"
                    className="flex items-center rounded-full bg-background-tertiary border border-border px-3 py-1.5 text-sm text-foreground-muted hover:text-neon-blue transition-colors"
                  >
                    +{userBadges.length - 6} more
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">No badges earned yet. Start reporting scores!</p>
            )}
          </div>
        </Card>

        {/* Recent activity */}
        <Card className="mb-6 border-2 border-border">
          <div className="p-4">
            <h3 className="mb-4 font-semibold text-foreground">Recent Activity</h3>
            {loadingSubmissions ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
              </div>
            ) : recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {recentSubmissions.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/game/${sub.game.id}`}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 hover:bg-background-secondary -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {sub.game.away_team?.school?.short_name || 'TBD'} @ {sub.game.home_team?.school?.short_name || 'TBD'}
                      </p>
                      <p className="text-xs text-foreground-muted">{sub.game.sport.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neon-blue">+{sub.points_earned} pts</p>
                      <Badge
                        variant={sub.status === 'verified' ? 'success' : sub.status === 'rejected' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {sub.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">No recent activity. Start reporting scores!</p>
            )}
          </div>
        </Card>

        {/* Point History */}
        <Card className="mb-6 border-2 border-border">
          <div className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-neon-yellow" />
              <h3 className="font-semibold text-foreground">Point History</h3>
            </div>
            {pointEventsLoading && pointEvents.length === 0 ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
              </div>
            ) : pointEvents.length > 0 ? (
              <div className="space-y-2">
                {pointEvents.map((event) => {
                  const display = getEventTypeDisplay(event.event_type)
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{display.icon}</span>
                        <div>
                          <p className={cn('font-medium text-sm', display.color)}>
                            {display.label}
                          </p>
                          <p className="text-xs text-foreground-muted">
                            {formatEventTime(event.created_at)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'font-bold font-display',
                          event.points >= 0 ? 'text-neon-green' : 'text-neon-pink'
                        )}
                      >
                        {event.points >= 0 ? '+' : ''}{event.points} pts
                      </span>
                    </div>
                  )
                })}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={pointEventsLoading}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-neon-blue hover:text-neon-blue/80 transition-colors disabled:opacity-50"
                  >
                    {pointEventsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Load More
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">No point history yet. Earn points by reporting scores!</p>
            )}
          </div>
        </Card>

        {/* Trusted reporter CTA */}
        {!profile.is_trusted_reporter && (
          <Card className="mb-6 border-2 border-neon-purple/30 bg-neon-purple/5">
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-neon-purple" />
                <h3 className="font-semibold text-neon-purple">
                  Become a Trusted Reporter
                </h3>
              </div>
              <p className="mb-4 text-sm text-foreground-muted">
                Get instant score publishing, 2x points multiplier, and exclusive badge.
              </p>
              <Link href="/apply-trusted-reporter">
                <Button className="w-full bg-neon-purple hover:bg-neon-purple/80">Apply Now</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Settings menu */}
        <Card className="border-2 border-border">
          <div className="divide-y divide-border">
            <Link
              href="/profile/settings"
              className="flex w-full items-center justify-between p-4 hover:bg-background-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-foreground-muted" />
                <span>Profile Settings</span>
              </div>
              <ChevronRight className="h-5 w-5 text-foreground-muted" />
            </Link>
            <Link
              href="/profile/badges"
              className="flex w-full items-center justify-between p-4 hover:bg-background-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-foreground-muted" />
                <span>All Badges</span>
              </div>
              <ChevronRight className="h-5 w-5 text-foreground-muted" />
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center justify-between p-4 text-neon-pink hover:bg-neon-pink/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </div>
            </button>
          </div>
        </Card>
      </main>
    </>
  )
}
