'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Gamepad2,
  Shield,
  TicketCheck,
  Plus,
  Trophy,
  Calendar,
  Users,
  AlertCircle,
  Ticket,
  Gift,
} from 'lucide-react'
import { Button, Card, Badge } from '@/components/ui'
import { useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface DashboardCounts {
  pendingApplications: number
  liveGames: number
  gamesToday: number
  totalUsers: number
}

interface ActiveRaffle {
  id: string
  name: string
  status: string
  raffle_type: string
  entries_close_at: string | null
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [counts, setCounts] = useState<DashboardCounts>({
    pendingApplications: 0,
    liveGames: 0,
    gamesToday: 0,
    totalUsers: 0,
  })
  const [activeRaffle, setActiveRaffle] = useState<ActiveRaffle | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCounts = useCallback(async () => {
    if (!supabase) return
    setIsLoading(true)

    try {
      // Fetch counts in parallel
      const [applicationsRes, liveGamesRes, todayGamesRes, usersRes, raffleRes] = await Promise.all([
        supabase
          .from('trusted_reporter_applications')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('games')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'in_progress'),
        supabase
          .from('games')
          .select('id', { count: 'exact', head: true })
          .gte('scheduled_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
          .lt('scheduled_at', new Date(new Date().setHours(23, 59, 59, 999)).toISOString()),
        supabase
          .from('users')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('raffles')
          .select('id, name, status, raffle_type, entries_close_at')
          .in('status', ['open', 'closed'])
          .eq('is_active', true)
          .order('entries_close_at', { ascending: true })
          .limit(1),
      ])

      setCounts({
        pendingApplications: applicationsRes.count ?? 0,
        liveGames: liveGamesRes.count ?? 0,
        gamesToday: todayGamesRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
      })

      if (raffleRes.data && raffleRes.data.length > 0) {
        setActiveRaffle(raffleRes.data[0] as ActiveRaffle)
      }
    } catch (err) {
      console.error('Error fetching dashboard counts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  const summaryCards = [
    {
      label: 'Live Games',
      count: counts.liveGames,
      color: 'text-neon-pink',
      borderColor: 'border-neon-pink/30',
      bgColor: counts.liveGames > 0 ? 'bg-neon-pink/5' : '',
      icon: Gamepad2,
      href: '/admin/games',
      pulse: counts.liveGames > 0,
    },
    {
      label: 'Games Today',
      count: counts.gamesToday,
      color: 'text-neon-yellow',
      borderColor: 'border-neon-yellow/30',
      bgColor: '',
      icon: Calendar,
      href: '/admin/games',
      pulse: false,
    },
    {
      label: 'Pending Applications',
      count: counts.pendingApplications,
      color: 'text-neon-purple',
      borderColor: 'border-neon-purple/30',
      bgColor: counts.pendingApplications > 0 ? 'bg-neon-purple/5' : '',
      icon: Shield,
      href: '/admin/applications',
      pulse: counts.pendingApplications > 0,
    },
    {
      label: 'Total Users',
      count: counts.totalUsers,
      color: 'text-neon-blue',
      borderColor: 'border-neon-blue/30',
      bgColor: '',
      icon: Users,
      href: '/admin/users',
      pulse: false,
    },
  ]

  const quickActions = [
    { label: 'Create Game', icon: Plus, href: '/admin/games/create', color: 'bg-neon-green hover:bg-neon-green/80 text-background' },
    { label: 'Manage Games', icon: Gamepad2, href: '/admin/games', color: '' },
    { label: 'Tournaments', icon: Trophy, href: '/admin/tournaments', color: '' },
    { label: 'Applications', icon: Shield, href: '/admin/applications', color: '' },
    { label: 'Invite Codes', icon: TicketCheck, href: '/admin/codes', color: '' },
    { label: 'Users', icon: Users, href: '/admin/users', color: '' },
  ]

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl neon-text-yellow uppercase tracking-wider">
            Dashboard
          </h1>
          {profile?.display_name && (
            <p className="text-sm text-foreground-muted mt-1">
              Welcome back, {profile.display_name}
            </p>
          )}
        </div>
        <Button onClick={() => router.push('/admin/games/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Game
        </Button>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryCards.map((card) => {
              const Icon = card.icon
              return (
                <Card
                  key={card.label}
                  className={`border-2 ${card.borderColor} ${card.bgColor} p-4 cursor-pointer hover:bg-background-tertiary transition-colors`}
                  onClick={() => router.push(card.href)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${card.color}`} />
                    {card.pulse && (
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${card.color.replace('text-', 'bg-')} opacity-75`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${card.color.replace('text-', 'bg-')}`} />
                      </span>
                    )}
                  </div>
                  <p className={`font-display font-bold text-2xl ${card.color}`}>
                    {card.count}
                  </p>
                  <p className="text-xs text-foreground-muted font-display uppercase tracking-wider mt-1">
                    {card.label}
                  </p>
                </Card>
              )
            })}
          </div>

          {/* Active Raffle Widget */}
          {activeRaffle && (
            <Link href={`/admin/raffles/${activeRaffle.id}`}>
              <div className="mb-6 scoreboard-panel p-4 border-neon-yellow/30 hover:border-neon-yellow transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ticket className="h-5 w-5 text-neon-yellow" />
                    <div>
                      <p className="font-display font-bold text-foreground text-sm">{activeRaffle.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px]',
                            activeRaffle.status === 'open' ? 'text-neon-green' : 'text-neon-yellow'
                          )}
                        >
                          {activeRaffle.status === 'open' ? 'Open' : 'Ready for Drawing'}
                        </Badge>
                        {activeRaffle.entries_close_at && (
                          <span className="text-xs text-foreground-muted">
                            Closes: {new Date(activeRaffle.entries_close_at).toLocaleDateString('en-US', { timeZone: 'Pacific/Honolulu', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Gift className="h-5 w-5 text-neon-yellow/50" />
                </div>
              </div>
            </Link>
          )}

          {/* Quick Actions */}
          <h2 className="font-display font-bold text-sm text-foreground-muted uppercase tracking-wider mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.label}
                  variant={action.color ? 'default' : 'outline'}
                  className={`h-auto py-3 flex flex-col items-center gap-2 ${action.color}`}
                  onClick={() => router.push(action.href)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-display">{action.label}</span>
                </Button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
