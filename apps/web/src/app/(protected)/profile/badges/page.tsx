'use client'

import { Header } from '@/components/layout'
import { Card } from '@/components/ui'
import { Trophy, Lock, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRequireAuth, useBadges, useUserBadges } from '@/hooks'

// Badge emoji mapping (used when no icon_url is provided)
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

export default function BadgesPage() {
  const { profile, isLoading: authLoading } = useRequireAuth()
  const { badges, isLoading: badgesLoading } = useBadges()
  const { userBadges, isLoading: userBadgesLoading, earnedBadgeCodes } = useUserBadges(profile?.id)

  const isLoading = authLoading || badgesLoading || userBadgesLoading

  // Group badges by category
  const badgesByCategory = badges.reduce((acc, badge) => {
    const category = badge.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(badge)
    return acc
  }, {} as Record<string, typeof badges>)

  // Get earned date for a badge
  const getEarnedDate = (badgeId: string) => {
    const ub = userBadges.find(b => b.badge_id === badgeId)
    return ub?.earned_at
  }

  if (isLoading) {
    return (
      <>
        <Header title="Badges" />
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
        </div>
      </>
    )
  }

  const earnedCount = userBadges.length
  const totalCount = badges.length

  return (
    <>
      <Header title="Badges" />

      <main className="px-4 pb-8">
        {/* Stats */}
        <Card className="mb-6 border-2 border-border">
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-6 w-6 text-neon-yellow" />
              <span className="text-3xl font-display font-bold text-foreground">
                {earnedCount}
                <span className="text-foreground-muted">/{totalCount}</span>
              </span>
            </div>
            <p className="text-sm text-foreground-muted">Badges Earned</p>
            {totalCount > 0 && (
              <div className="mt-3 h-2 bg-background-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-yellow to-neon-green rounded-full transition-all"
                  style={{ width: `${(earnedCount / totalCount) * 100}%` }}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Badges by category */}
        {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
          <div key={category} className="mb-6">
            <h2 className="font-display font-bold text-foreground-muted uppercase tracking-wider text-sm mb-3">
              {category}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {categoryBadges.map((badge) => {
                const isEarned = earnedBadgeCodes.has(badge.code)
                const earnedDate = getEarnedDate(badge.id)
                const icon = BADGE_ICONS[badge.code] || '🏅'

                return (
                  <Card
                    key={badge.id}
                    className={cn(
                      'border-2 transition-all',
                      isEarned
                        ? 'border-neon-yellow/50 bg-neon-yellow/5'
                        : 'border-border opacity-60'
                    )}
                  >
                    <div className="p-4 text-center">
                      <div className={cn(
                        'relative w-16 h-16 mx-auto mb-2 flex items-center justify-center text-4xl rounded-full',
                        isEarned
                          ? 'bg-neon-yellow/20'
                          : 'bg-background-tertiary'
                      )}>
                        {isEarned ? (
                          <>
                            {icon}
                            <div className="absolute -bottom-1 -right-1 bg-neon-green rounded-full p-0.5">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <Lock className="h-8 w-8 text-foreground-subtle" />
                        )}
                      </div>
                      <h3 className={cn(
                        'font-display font-bold text-sm',
                        isEarned ? 'text-foreground' : 'text-foreground-muted'
                      )}>
                        {badge.name}
                      </h3>
                      {badge.description && (
                        <p className="text-xs text-foreground-subtle mt-1 line-clamp-2">
                          {badge.description}
                        </p>
                      )}
                      {isEarned && earnedDate && (
                        <p className="text-xs text-neon-green mt-2">
                          Earned {new Date(earnedDate).toLocaleDateString('en-US', { timeZone: 'Pacific/Honolulu' })}
                        </p>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}

        {badges.length === 0 && (
          <Card className="border-2 border-border">
            <div className="p-8 text-center">
              <Trophy className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
              <h3 className="font-display font-bold text-foreground mb-2">No Badges Available</h3>
              <p className="text-sm text-foreground-muted">
                Badges will appear here once they&apos;re configured.
              </p>
            </div>
          </Card>
        )}
      </main>
    </>
  )
}
