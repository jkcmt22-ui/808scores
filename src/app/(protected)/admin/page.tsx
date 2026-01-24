'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trophy,
  Clock,
  Search,
  RefreshCw,
  Shield,
  UserCheck,
  UserX,
  Calendar,
  Gift,
  ShieldAlert,
  Key,
  Copy,
  Check,
  Users,
  Image,
  Instagram,
} from 'lucide-react'
import { Button, Badge, Input, Card } from '@/components/ui'
import { useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn, formatGameTime, isGameLive, isGameFinal } from '@/lib/utils'
import type { GameWithTeams, Sport, School, GameStatus, GameType, TrustedReporterCode } from '@/types/database'

type TabType = 'games' | 'create' | 'applications' | 'codes' | 'users'

interface AdminUser {
  id: string
  display_name: string | null
  email: string | null
  phone: string | null
  is_super_admin: boolean
  is_admin: boolean
  is_trusted_reporter: boolean
  tier: string
  created_at: string
}

interface TrustedReporterApplication {
  id: string
  user_id: string
  full_name: string
  role: string
  school_affiliation: string | null
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at: string | null
  user?: {
    display_name: string | null
    email: string | null
    phone: string | null
    reputation_score: number
    submission_count: number
    verified_count: number
  }
}

interface GameFormData {
  sport_id: string
  home_team_id: string
  away_team_id: string
  scheduled_at: string
  venue: string
  status: GameStatus
  game_type: GameType
  home_score: number
  away_score: number
  current_period: string
  time_remaining: string
  is_verified: boolean
  golden_game: boolean
  photos_url: string
  instagram_url: string
}

const initialFormData: GameFormData = {
  sport_id: '',
  home_team_id: '',
  away_team_id: '',
  scheduled_at: '',
  venue: '',
  status: 'scheduled',
  game_type: 'regular_season',
  home_score: 0,
  away_score: 0,
  current_period: '',
  time_remaining: '',
  is_verified: false,
  golden_game: false,
  photos_url: '',
  instagram_url: '',
}

export default function AdminPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient()!, [])

  const [activeTab, setActiveTab] = useState<TabType>('games')
  const [games, setGames] = useState<GameWithTeams[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editingGame, setEditingGame] = useState<GameWithTeams | null>(null)
  const [formData, setFormData] = useState<GameFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [applications, setApplications] = useState<TrustedReporterApplication[]>([])
  const [applicationFilter, setApplicationFilter] = useState<'pending' | 'all'>('pending')
  const [codes, setCodes] = useState<TrustedReporterCode[]>([])
  const [newCodeNote, setNewCodeNote] = useState('')
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState('')

  // Check if user has admin access (must be an admin or super admin)
  const isSuperAdmin = profile?.is_super_admin === true
  const hasAdminAccess = profile?.is_admin === true || isSuperAdmin

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      // Fetch games
      const { data: gamesData } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:schools!games_home_team_id_fkey(*),
          away_team:schools!games_away_team_id_fkey(*)
        `)
        .order('scheduled_at', { ascending: false })
        .limit(100)

      if (gamesData) setGames(gamesData as GameWithTeams[])

      // Fetch sports
      const { data: sportsData } = await supabase
        .from('sports')
        .select('*')
        .eq('active', true)
        .order('sort_order')

      if (sportsData) setSports(sportsData as Sport[])

      // Fetch schools
      const { data: schoolsData } = await supabase
        .from('schools')
        .select('*')
        .order('name')

      if (schoolsData) setSchools(schoolsData as School[])

      // Fetch trusted reporter applications
      const { data: applicationsData } = await supabase
        .from('trusted_reporter_applications')
        .select(`
          *,
          user:users(display_name, email, phone, reputation_score, submission_count, verified_count)
        `)
        .order('created_at', { ascending: false })

      if (applicationsData) setApplications(applicationsData as TrustedReporterApplication[])

      // Fetch trusted reporter codes
      const { data: codesData } = await supabase
        .from('trusted_reporter_codes')
        .select('*')
        .order('created_at', { ascending: false })

      if (codesData) setCodes(codesData as TrustedReporterCode[])

      // Fetch admin users (for super admin only)
      const { data: usersData } = await supabase
        .from('users')
        .select('id, display_name, email, phone, is_super_admin, is_admin, is_trusted_reporter, tier, created_at')
        .or('is_admin.eq.true,is_super_admin.eq.true,is_trusted_reporter.eq.true')
        .order('created_at', { ascending: false })

      if (usersData) setAdminUsers(usersData as AdminUser[])

      setIsLoading(false)
    }

    if (hasAdminAccess) {
      fetchData()
    }
  }, [supabase, hasAdminAccess])

  // Filter games
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch =
        searchTerm === '' ||
        game.home_team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.away_team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.sport.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || game.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [games, searchTerm, statusFilter])

  // Handle form changes
  const handleFormChange = (field: keyof GameFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Create game
  const handleCreateGame = async () => {
    if (!formData.sport_id || !formData.home_team_id || !formData.away_team_id || !formData.scheduled_at) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const gameData = {
        sport_id: formData.sport_id,
        home_team_id: formData.home_team_id,
        away_team_id: formData.away_team_id,
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
        venue: formData.venue || null,
        status: formData.status,
        game_type: formData.game_type,
        home_score: formData.home_score,
        away_score: formData.away_score,
        current_period: formData.current_period || null,
        time_remaining: formData.time_remaining || null,
        is_verified: formData.is_verified,
        golden_game: formData.golden_game,
        photos_url: formData.photos_url || null,
        instagram_url: formData.instagram_url || null,
      }

      const { error } = await supabase
        .from('games')
        .insert(gameData as never)

      if (error) throw error

      setMessage({ type: 'success', text: 'Game created successfully' })
      setFormData(initialFormData)
      setActiveTab('games')

      // Refresh games list
      const { data: gamesData } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:schools!games_home_team_id_fkey(*),
          away_team:schools!games_away_team_id_fkey(*)
        `)
        .order('scheduled_at', { ascending: false })
        .limit(100)

      if (gamesData) setGames(gamesData as GameWithTeams[])
    } catch (err) {
      console.error('Error creating game:', err)
      setMessage({ type: 'error', text: 'Failed to create game' })
    } finally {
      setIsSaving(false)
    }
  }

  // Update game
  const handleUpdateGame = async () => {
    if (!editingGame) return

    setIsSaving(true)
    setMessage(null)

    try {
      const updateData = {
        status: formData.status,
        game_type: formData.game_type,
        home_score: formData.home_score,
        away_score: formData.away_score,
        current_period: formData.current_period || null,
        time_remaining: formData.time_remaining || null,
        is_verified: formData.is_verified,
        golden_game: formData.golden_game,
        venue: formData.venue || null,
        photos_url: formData.photos_url || null,
        instagram_url: formData.instagram_url || null,
      }

      const { error } = await supabase
        .from('games')
        .update(updateData as never)
        .eq('id', editingGame.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Game updated successfully' })
      setEditingGame(null)

      // Refresh games list
      const { data: gamesData } = await supabase
        .from('games')
        .select(`
          *,
          sport:sports(*),
          home_team:schools!games_home_team_id_fkey(*),
          away_team:schools!games_away_team_id_fkey(*)
        `)
        .order('scheduled_at', { ascending: false })
        .limit(100)

      if (gamesData) setGames(gamesData as GameWithTeams[])
    } catch (err) {
      console.error('Error updating game:', err)
      setMessage({ type: 'error', text: 'Failed to update game' })
    } finally {
      setIsSaving(false)
    }
  }

  // Delete game
  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game? This cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId)

      if (error) throw error

      setGames((prev) => prev.filter((g) => g.id !== gameId))
      setMessage({ type: 'success', text: 'Game deleted successfully' })
    } catch (err) {
      console.error('Error deleting game:', err)
      setMessage({ type: 'error', text: 'Failed to delete game' })
    }
  }

  // Approve application
  const handleApproveApplication = async (application: TrustedReporterApplication) => {
    if (!confirm(`Approve ${application.full_name} as a Trusted Reporter?`)) return

    try {
      // Update application status
      const { error: appError } = await supabase
        .from('trusted_reporter_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile?.id,
        } as never)
        .eq('id', application.id)

      if (appError) throw appError

      // Update user's trusted reporter status
      const { error: userError } = await supabase
        .from('users')
        .update({
          is_trusted_reporter: true,
          trusted_reporter_approved_at: new Date().toISOString(),
          tier: 'trusted',
        } as never)
        .eq('id', application.user_id)

      if (userError) throw userError

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === application.id
            ? { ...app, status: 'approved', reviewed_at: new Date().toISOString() }
            : app
        )
      )

      setMessage({ type: 'success', text: `${application.full_name} is now a Trusted Reporter!` })
    } catch (err) {
      console.error('Error approving application:', err)
      setMessage({ type: 'error', text: 'Failed to approve application' })
    }
  }

  // Reject application
  const handleRejectApplication = async (application: TrustedReporterApplication) => {
    if (!confirm(`Reject ${application.full_name}'s application?`)) return

    try {
      const { error } = await supabase
        .from('trusted_reporter_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile?.id,
        } as never)
        .eq('id', application.id)

      if (error) throw error

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === application.id
            ? { ...app, status: 'rejected', reviewed_at: new Date().toISOString() }
            : app
        )
      )

      setMessage({ type: 'success', text: 'Application rejected' })
    } catch (err) {
      console.error('Error rejecting application:', err)
      setMessage({ type: 'error', text: 'Failed to reject application' })
    }
  }

  // Filter applications
  const filteredApplications = useMemo(() => {
    if (applicationFilter === 'pending') {
      return applications.filter((app) => app.status === 'pending')
    }
    return applications
  }, [applications, applicationFilter])

  // Generate a random code
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Avoid confusing chars like O/0, I/1
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  // Create a new trusted reporter code
  const handleGenerateCode = async () => {
    setIsGeneratingCode(true)
    try {
      const code = generateRandomCode()
      const { data, error } = await supabase
        .from('trusted_reporter_codes')
        .insert({
          code,
          created_by: user?.id,
          note: newCodeNote || null,
          max_uses: 1,
        } as never)
        .select()
        .single()

      if (error) throw error

      setCodes((prev) => [data as TrustedReporterCode, ...prev])
      setNewCodeNote('')
      setMessage({ type: 'success', text: `Code ${code} created!` })
    } catch (err) {
      console.error('Error generating code:', err)
      setMessage({ type: 'error', text: 'Failed to generate code' })
    } finally {
      setIsGeneratingCode(false)
    }
  }

  // Deactivate a code
  const handleDeactivateCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('trusted_reporter_codes')
        .update({ active: false } as never)
        .eq('id', codeId)

      if (error) throw error

      setCodes((prev) =>
        prev.map((c) => (c.id === codeId ? { ...c, active: false } : c))
      )
      setMessage({ type: 'success', text: 'Code deactivated' })
    } catch (err) {
      console.error('Error deactivating code:', err)
      setMessage({ type: 'error', text: 'Failed to deactivate code' })
    }
  }

  // Copy code to clipboard
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Start editing a game
  const startEditing = (game: GameWithTeams) => {
    setEditingGame(game)
    // Cast to access the media fields
    const gameWithMedia = game as GameWithTeams & { photos_url?: string | null; instagram_url?: string | null }
    setFormData({
      sport_id: game.sport_id,
      home_team_id: game.home_team_id,
      away_team_id: game.away_team_id,
      scheduled_at: new Date(game.scheduled_at).toISOString().slice(0, 16),
      venue: game.venue || '',
      status: game.status,
      game_type: game.game_type,
      home_score: game.home_score,
      away_score: game.away_score,
      current_period: game.current_period || '',
      time_remaining: game.time_remaining || '',
      is_verified: game.is_verified,
      golden_game: game.golden_game,
      photos_url: gameWithMedia.photos_url || '',
      instagram_url: gameWithMedia.instagram_url || '',
    })
  }

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
        <span className="mt-4 font-display text-sm text-foreground-muted uppercase tracking-wider">Loading...</span>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    router.push('/login?redirect=/admin')
    return null
  }

  // No admin access
  if (!hasAdminAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <AlertCircle className="mb-4 h-12 w-12 text-neon-pink" />
        <h1 className="mb-2 font-display text-xl font-bold text-foreground uppercase">Access Denied</h1>
        <p className="mb-4 text-foreground-muted text-sm text-center">
          You need admin privileges to access this area.
        </p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="font-display font-bold text-lg neon-text-yellow uppercase tracking-wider">Admin Panel</h1>
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </header>

      <main className="p-4 pb-24">
        {/* Message */}
        {message && (
          <div className={cn(
            'mb-4 flex items-center gap-2 p-3 text-sm border-2',
            message.type === 'success'
              ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
              : 'bg-neon-pink/10 border-neon-pink/30 text-neon-pink'
          )}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/tournaments')}>
            <Trophy className="mr-2 h-4 w-4" />
            Tournaments
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/schools')}>
            <Users className="mr-2 h-4 w-4" />
            Schools
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/rosters')}>
            <Users className="mr-2 h-4 w-4" />
            Rosters
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/moderation')}>
            <ShieldAlert className="mr-2 h-4 w-4" />
            Moderation
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/schedule')}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/raffles')}>
            <Gift className="mr-2 h-4 w-4" />
            Raffles
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/prizes')}>
            <Gift className="mr-2 h-4 w-4" />
            Prizes
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'games' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('games')
              setEditingGame(null)
            }}
          >
            Manage Games
          </Button>
          <Button
            variant={activeTab === 'create' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('create')
              setEditingGame(null)
              setFormData(initialFormData)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Game
          </Button>
          <Button
            variant={activeTab === 'applications' ? 'default' : 'outline'}
            onClick={() => setActiveTab('applications')}
            className="relative"
          >
            <Shield className="mr-2 h-4 w-4" />
            Applications
            {applications.filter((a) => a.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-neon-pink text-[10px] font-bold flex items-center justify-center">
                {applications.filter((a) => a.status === 'pending').length}
              </span>
            )}
          </Button>
          <Button
            variant={activeTab === 'codes' ? 'default' : 'outline'}
            onClick={() => setActiveTab('codes')}
          >
            <Key className="mr-2 h-4 w-4" />
            Invite Codes
          </Button>
          {isSuperAdmin && (
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
            >
              <Shield className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          )}
        </div>

        {/* Edit Game Modal */}
        {editingGame && (
          <Card className="mb-6 p-4">
            <h2 className="font-display font-bold text-lg mb-4 neon-text-blue">
              Edit: {editingGame.away_team.short_name} @ {editingGame.home_team.short_name}
            </h2>
            <GameForm
              formData={formData}
              onChange={handleFormChange}
              sports={sports}
              schools={schools}
              isEdit={true}
            />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setEditingGame(null)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleUpdateGame} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && !editingGame && (
          <div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="final">Final</option>
                <option value="postponed">Postponed</option>
                <option value="canceled">Canceled</option>
              </select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Games List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground-muted font-display">No games found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGames.map((game) => (
                  <GameRow
                    key={game.id}
                    game={game}
                    onEdit={() => startEditing(game)}
                    onDelete={() => handleDeleteGame(game.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <Card className="p-4">
            <h2 className="font-display font-bold text-lg mb-4 neon-text-green">Create New Game</h2>
            <GameForm
              formData={formData}
              onChange={handleFormChange}
              sports={sports}
              schools={schools}
              isEdit={false}
            />
            <Button onClick={handleCreateGame} disabled={isSaving} className="mt-4 w-full">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Game'
              )}
            </Button>
          </Card>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg neon-text-purple">
                Trusted Reporter Applications
              </h2>
              <select
                value={applicationFilter}
                onChange={(e) => setApplicationFilter(e.target.value as 'pending' | 'all')}
                className="h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
              >
                <option value="pending">Pending Only</option>
                <option value="all">All Applications</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-neon-purple" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <Card className="p-8 text-center">
                <Shield className="mx-auto mb-4 h-12 w-12 text-foreground-muted" />
                <p className="text-foreground-muted font-display">
                  {applicationFilter === 'pending'
                    ? 'No pending applications'
                    : 'No applications found'}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onApprove={() => handleApproveApplication(application)}
                    onReject={() => handleRejectApplication(application)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Codes Tab */}
        {activeTab === 'codes' && (
          <div>
            <div className="mb-6">
              <h2 className="font-display font-bold text-lg neon-text-green mb-4">
                Generate Trusted Reporter Code
              </h2>
              <Card className="p-4">
                <p className="text-sm text-foreground-muted mb-4">
                  Generate a one-time code that can be given to someone you trust.
                  When they enter this code, they&apos;ll automatically become a Trusted Reporter.
                </p>
                <div className="flex gap-3">
                  <Input
                    placeholder="Note (optional, e.g., 'For Coach Smith')"
                    value={newCodeNote}
                    onChange={(e) => setNewCodeNote(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleGenerateCode}
                    disabled={isGeneratingCode}
                  >
                    {isGeneratingCode ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Key className="mr-2 h-4 w-4" />
                    )}
                    Generate Code
                  </Button>
                </div>
              </Card>
            </div>

            <h3 className="font-display font-bold text-foreground mb-3">
              Existing Codes ({codes.length})
            </h3>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-neon-green" />
              </div>
            ) : codes.length === 0 ? (
              <Card className="p-8 text-center">
                <Key className="mx-auto mb-4 h-12 w-12 text-foreground-muted" />
                <p className="text-foreground-muted font-display">
                  No codes generated yet
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {codes.map((code) => (
                  <Card
                    key={code.id}
                    className={cn(
                      'border-2 p-4',
                      code.active ? 'border-neon-green/30' : 'border-border opacity-50'
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="font-mono text-lg font-bold text-neon-green">
                            {code.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(code.code)}
                            className="h-8 px-2"
                          >
                            {copiedCode === code.code ? (
                              <Check className="h-4 w-4 text-neon-green" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          {!code.active && (
                            <Badge variant="secondary" className="text-[10px]">
                              Inactive
                            </Badge>
                          )}
                          {code.use_count >= code.max_uses && (
                            <Badge variant="default" className="text-[10px]">
                              Used
                            </Badge>
                          )}
                        </div>
                        {code.note && (
                          <p className="text-sm text-foreground-muted mb-1">
                            {code.note}
                          </p>
                        )}
                        <p className="text-xs text-foreground-subtle">
                          Created: {new Date(code.created_at).toLocaleDateString()}
                          {code.redeemed_at && (
                            <> &middot; Redeemed: {new Date(code.redeemed_at).toLocaleDateString()}</>
                          )}
                          <> &middot; Uses: {code.use_count}/{code.max_uses}</>
                        </p>
                      </div>
                      {code.active && code.use_count < code.max_uses && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeactivateCode(code.id)}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab (Super Admin Only) */}
        {activeTab === 'users' && isSuperAdmin && (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  placeholder="Search users by name, email, or phone..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="mb-4 p-4 bg-background-secondary border-2 border-border">
              <h3 className="font-display font-bold text-sm mb-2 text-foreground">Role Hierarchy</h3>
              <div className="space-y-1 text-sm text-foreground-muted">
                <p><span className="text-neon-pink font-bold">Super Admin:</span> Full access, can manage all users and admins</p>
                <p><span className="text-neon-blue font-bold">Admin:</span> Backend access to manage content (games, schools, etc.)</p>
                <p><span className="text-neon-green font-bold">Trusted Reporter:</span> Auto-verified scores, badge on comments</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
              </div>
            ) : (
              <div className="space-y-2">
                {adminUsers
                  .filter((u) => {
                    if (!userSearchTerm) return true
                    const term = userSearchTerm.toLowerCase()
                    return (
                      u.display_name?.toLowerCase().includes(term) ||
                      u.email?.toLowerCase().includes(term) ||
                      u.phone?.includes(term)
                    )
                  })
                  .map((adminUser) => (
                    <UserRow
                      key={adminUser.id}
                      adminUser={adminUser}
                      onToggleAdmin={async () => {
                        const newValue = !adminUser.is_admin
                        const { error } = await supabase
                          .from('users')
                          .update({ is_admin: newValue } as never)
                          .eq('id', adminUser.id)
                        if (!error) {
                          setAdminUsers((prev) =>
                            prev.map((u) =>
                              u.id === adminUser.id ? { ...u, is_admin: newValue } : u
                            )
                          )
                          setMessage({
                            type: 'success',
                            text: `User ${newValue ? 'promoted to' : 'removed from'} admin`,
                          })
                        }
                      }}
                      onToggleTrusted={async () => {
                        const newValue = !adminUser.is_trusted_reporter
                        const { error } = await supabase
                          .from('users')
                          .update({
                            is_trusted_reporter: newValue,
                            tier: newValue ? 'trusted' : 'basic',
                          } as never)
                          .eq('id', adminUser.id)
                        if (!error) {
                          setAdminUsers((prev) =>
                            prev.map((u) =>
                              u.id === adminUser.id
                                ? { ...u, is_trusted_reporter: newValue, tier: newValue ? 'trusted' : 'basic' }
                                : u
                            )
                          )
                          setMessage({
                            type: 'success',
                            text: `User ${newValue ? 'made' : 'removed as'} trusted reporter`,
                          })
                        }
                      }}
                      currentUserId={user?.id || ''}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// User Row Component for Super Admin
function UserRow({
  adminUser,
  onToggleAdmin,
  onToggleTrusted,
  currentUserId,
}: {
  adminUser: AdminUser
  onToggleAdmin: () => void
  onToggleTrusted: () => void
  currentUserId: string
}) {
  const isSelf = adminUser.id === currentUserId

  return (
    <Card className="border-2 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-display font-bold text-foreground">
              {adminUser.display_name || 'No name'}
            </span>
            {adminUser.is_super_admin && (
              <Badge variant="destructive" className="text-[10px]">Super Admin</Badge>
            )}
            {adminUser.is_admin && !adminUser.is_super_admin && (
              <Badge variant="default" className="text-[10px]">Admin</Badge>
            )}
            {adminUser.is_trusted_reporter && (
              <Badge variant="success" className="text-[10px]">Trusted</Badge>
            )}
          </div>
          <div className="text-xs text-foreground-muted space-x-3">
            {adminUser.email && <span>{adminUser.email}</span>}
            {adminUser.phone && <span>{adminUser.phone}</span>}
          </div>
        </div>

        {!adminUser.is_super_admin && !isSelf && (
          <div className="flex gap-2">
            <Button
              variant={adminUser.is_admin ? 'destructive' : 'outline'}
              size="sm"
              onClick={onToggleAdmin}
            >
              {adminUser.is_admin ? 'Remove Admin' : 'Make Admin'}
            </Button>
            <Button
              variant={adminUser.is_trusted_reporter ? 'secondary' : 'outline'}
              size="sm"
              onClick={onToggleTrusted}
            >
              {adminUser.is_trusted_reporter ? 'Remove Trusted' : 'Make Trusted'}
            </Button>
          </div>
        )}

        {isSelf && (
          <Badge variant="secondary" className="text-[10px]">You</Badge>
        )}
      </div>
    </Card>
  )
}

// Game Row Component
function GameRow({
  game,
  onEdit,
  onDelete,
}: {
  game: GameWithTeams
  onEdit: () => void
  onDelete: () => void
}) {
  const isLive = isGameLive(game.status)
  const isFinal = isGameFinal(game.status)

  return (
    <div className={cn(
      'border-2 border-border bg-background-secondary p-4',
      isLive && 'border-neon-pink/50'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Status & Sport */}
          <div className="flex items-center gap-2 mb-2">
            {isLive && (
              <Badge variant="destructive" className="text-[10px]">Live</Badge>
            )}
            {isFinal && (
              <Badge variant="secondary" className="text-[10px]">Final</Badge>
            )}
            {game.status === 'scheduled' && (
              <Badge variant="default" className="text-[10px]">Scheduled</Badge>
            )}
            <span className="text-[10px] text-neon-blue font-display font-bold uppercase">
              {game.sport.display_name || game.sport.name}
            </span>
            {game.game_type !== 'regular_season' && (
              <Badge variant="warning" className="text-[10px] gap-1">
                <Trophy className="h-2.5 w-2.5" />
                {game.game_type.replace('_', ' ')}
              </Badge>
            )}
          </div>

          {/* Teams & Score */}
          <div className="font-display">
            <span className="text-foreground font-bold">{game.away_team.short_name}</span>
            <span className="text-neon-blue font-bold mx-2">{game.away_score}</span>
            <span className="text-foreground-muted">@</span>
            <span className="text-foreground font-bold mx-2">{game.home_team.short_name}</span>
            <span className="text-neon-pink font-bold">{game.home_score}</span>
          </div>

          {/* Time & Venue */}
          <div className="flex items-center gap-3 mt-1 text-xs text-foreground-subtle">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatGameTime(game.scheduled_at)}
            </span>
            {game.venue && <span>{game.venue}</span>}
          </div>

          {/* Period info if live */}
          {isLive && game.current_period && (
            <p className="text-xs text-neon-pink mt-1">
              {game.current_period}
              {game.time_remaining && ` - ${game.time_remaining}`}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Application Card Component
function ApplicationCard({
  application,
  onApprove,
  onReject,
}: {
  application: TrustedReporterApplication
  onApprove: () => void
  onReject: () => void
}) {
  const isPending = application.status === 'pending'
  const isApproved = application.status === 'approved'
  const isRejected = application.status === 'rejected'

  const roleLabels: Record<string, string> = {
    coach: 'Coach',
    athletic_director: 'Athletic Director',
    school_staff: 'School Staff',
    parent: 'Parent/Guardian',
    student: 'Student',
    media: 'Media/Press',
    official: 'Game Official',
    fan: 'Dedicated Fan',
    other: 'Other',
  }

  return (
    <Card className={cn(
      'border-2 p-4',
      isPending && 'border-neon-yellow/30',
      isApproved && 'border-neon-green/30 bg-neon-green/5',
      isRejected && 'border-neon-pink/30 bg-neon-pink/5'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-display font-bold text-foreground">{application.full_name}</h3>
            {isPending && (
              <Badge variant="warning" className="text-[10px]">
                <Clock className="mr-1 h-3 w-3" />
                Pending
              </Badge>
            )}
            {isApproved && (
              <Badge variant="success" className="text-[10px]">
                <CheckCircle className="mr-1 h-3 w-3" />
                Approved
              </Badge>
            )}
            {isRejected && (
              <Badge variant="destructive" className="text-[10px]">
                <AlertCircle className="mr-1 h-3 w-3" />
                Rejected
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-1 text-sm">
            <p className="text-foreground-muted">
              <span className="text-foreground-subtle">Role:</span>{' '}
              {roleLabels[application.role] || application.role}
            </p>
            {application.school_affiliation && (
              <p className="text-foreground-muted">
                <span className="text-foreground-subtle">School:</span>{' '}
                {application.school_affiliation}
              </p>
            )}
            {application.reason && (
              <p className="text-foreground-muted">
                <span className="text-foreground-subtle">Reason:</span>{' '}
                {application.reason}
              </p>
            )}
          </div>

          {/* User stats */}
          {application.user && (
            <div className="flex items-center gap-4 mt-3 text-xs text-foreground-subtle">
              <span>
                Rep: <span className="text-neon-blue font-bold">{application.user.reputation_score}</span>
              </span>
              <span>
                Submissions: <span className="text-foreground">{application.user.submission_count}</span>
              </span>
              <span>
                Verified: <span className="text-neon-green">{application.user.verified_count}</span>
              </span>
            </div>
          )}

          {/* Timestamps */}
          <p className="text-xs text-foreground-subtle mt-2">
            Applied: {new Date(application.created_at).toLocaleDateString()}
            {application.reviewed_at && (
              <> &middot; Reviewed: {new Date(application.reviewed_at).toLocaleDateString()}</>
            )}
          </p>
        </div>

        {/* Actions */}
        {isPending && (
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              onClick={onApprove}
              className="bg-neon-green hover:bg-neon-green/80 text-background"
            >
              <UserCheck className="mr-1 h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onReject}
            >
              <UserX className="mr-1 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

// Game Form Component
function GameForm({
  formData,
  onChange,
  sports,
  schools,
  isEdit,
}: {
  formData: GameFormData
  onChange: (field: keyof GameFormData, value: string | number | boolean) => void
  sports: Sport[]
  schools: School[]
  isEdit: boolean
}) {
  return (
    <div className="space-y-4">
      {!isEdit && (
        <>
          {/* Sport */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Sport *</label>
            <select
              value={formData.sport_id}
              onChange={(e) => onChange('sport_id', e.target.value)}
              className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
            >
              <option value="">Select sport...</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.display_name || sport.name}
                </option>
              ))}
            </select>
          </div>

          {/* Teams */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Away Team *</label>
              <select
                value={formData.away_team_id}
                onChange={(e) => onChange('away_team_id', e.target.value)}
                className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
              >
                <option value="">Select team...</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Home Team *</label>
              <select
                value={formData.home_team_id}
                onChange={(e) => onChange('home_team_id', e.target.value)}
                className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
              >
                <option value="">Select team...</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date/Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Scheduled Date/Time *</label>
            <Input
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => onChange('scheduled_at', e.target.value)}
            />
          </div>
        </>
      )}

      {/* Venue */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Venue</label>
        <Input
          placeholder="e.g., Aloha Stadium"
          value={formData.venue}
          onChange={(e) => onChange('venue', e.target.value)}
        />
      </div>

      {/* Status & Game Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => onChange('status', e.target.value as GameStatus)}
            className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
          >
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="final">Final</option>
            <option value="postponed">Postponed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Game Type</label>
          <select
            value={formData.game_type}
            onChange={(e) => onChange('game_type', e.target.value as GameType)}
            className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
          >
            <option value="regular_season">Regular Season</option>
            <option value="playoff">Playoff</option>
            <option value="championship">Championship</option>
            <option value="tournament">Tournament</option>
            <option value="exhibition">Exhibition</option>
            <option value="scrimmage">Scrimmage</option>
          </select>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Away Score</label>
          <Input
            type="number"
            min="0"
            value={formData.away_score}
            onChange={(e) => onChange('away_score', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Home Score</label>
          <Input
            type="number"
            min="0"
            value={formData.home_score}
            onChange={(e) => onChange('home_score', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Period & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Current Period</label>
          <Input
            placeholder="e.g., Q3, Set 2"
            value={formData.current_period}
            onChange={(e) => onChange('current_period', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Time Remaining</label>
          <Input
            placeholder="e.g., 5:42"
            value={formData.time_remaining}
            onChange={(e) => onChange('time_remaining', e.target.value)}
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_verified}
            onChange={(e) => onChange('is_verified', e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-foreground">Verified</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.golden_game}
            onChange={(e) => onChange('golden_game', e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-foreground">Golden Game (3x pts)</span>
        </label>
      </div>

      {/* Media Links */}
      <div className="border-t border-border pt-4 mt-4">
        <h4 className="font-display font-bold text-sm mb-3 text-foreground-muted uppercase tracking-wider flex items-center gap-2">
          <Image className="h-4 w-4" />
          Game Media
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Photos URL</label>
            <Input
              placeholder="Link to game photos (e.g., Google Drive, Flickr)"
              value={formData.photos_url}
              onChange={(e) => onChange('photos_url', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Instagram Post URL</label>
            <Input
              placeholder="https://instagram.com/p/..."
              value={formData.instagram_url}
              onChange={(e) => onChange('instagram_url', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
