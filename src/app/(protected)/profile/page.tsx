'use client'

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
} from 'lucide-react'
import { getTierColor, getTierLabel } from '@/lib/utils'
import { useRequireAuth } from '@/hooks'

// Mock data for badges and submissions (will come from API later)
const mockBadges = [
  { code: 'first_score', name: 'First Score', icon: '🎯' },
  { code: 'night_owl', name: 'Night Owl', icon: '🦉' },
  { code: 'reliable', name: 'Reliable (90%+)', icon: '✅' },
]

const mockRecentSubmissions = [
  { game: 'Kahuku vs Mililani', sport: 'Football', points: 15, status: 'verified' },
  { game: 'Punahou vs St Louis', sport: 'Basketball', points: 10, status: 'verified' },
  { game: 'Kapolei vs Campbell', sport: 'Volleyball', points: 5, status: 'pending' },
]

export default function ProfilePage() {
  const { profile, isLoading, signOut } = useRequireAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!profile) {
    return null // Will redirect to login
  }

  const nextTier = profile.tier === 'verified' ? 'elite' : profile.tier === 'standard' ? 'verified' : 'standard'
  const tierThresholds: Record<string, number> = {
    standard: 31,
    verified: 61,
    elite: 91,
  }
  const pointsToNextTier = tierThresholds[nextTier]
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
                  Member since {new Date(profile.created_at).toLocaleDateString()}
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
                {profile.accuracy_rate ? `${profile.accuracy_rate}%` : '-'}
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
                ? `${pointsToNextTier} more reputation points to reach ${getTierLabel(nextTier)}`
                : 'Max tier reached!'}
            </p>
          </div>
        </Card>

        {/* Badges */}
        <Card className="mb-6 border-2 border-border">
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Badges</h3>
              <span className="text-sm text-foreground-muted">{mockBadges.length} earned</span>
            </div>
            {mockBadges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {mockBadges.map((badge) => (
                  <div
                    key={badge.code}
                    className="flex items-center gap-2 rounded-full bg-background-tertiary border border-border px-3 py-1.5"
                  >
                    <span>{badge.icon}</span>
                    <span className="text-sm font-medium text-foreground">{badge.name}</span>
                  </div>
                ))}
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
            {mockRecentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {mockRecentSubmissions.map((sub, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{sub.game}</p>
                      <p className="text-xs text-foreground-muted">{sub.sport}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neon-blue">+{sub.points} pts</p>
                      <Badge
                        variant={sub.status === 'verified' ? 'success' : 'secondary'}
                        className="text-xs"
                      >
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">No recent activity. Start reporting scores!</p>
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
            <button className="flex w-full items-center justify-between p-4 hover:bg-background-secondary transition-colors">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-foreground-muted" />
                <span>All Badges</span>
              </div>
              <ChevronRight className="h-5 w-5 text-foreground-muted" />
            </button>
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
