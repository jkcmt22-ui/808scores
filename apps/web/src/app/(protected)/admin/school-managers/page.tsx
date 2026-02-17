'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Loader2,
  AlertCircle,
  ChevronLeft,
  Search,
  Save,
  X,
  Users,
  Shield,
  Trash2,
  School as SchoolIcon,
  UserPlus,
} from 'lucide-react'
import { Button, Badge, Input, Card, Avatar } from '@/components/ui'
import { useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import type { School, SchoolManagerWithUser, SchoolManagerRole } from '@/types/database'

interface SearchUser {
  id: string
  display_name: string | null
  email: string | null
  avatar_url: string | null
}

interface ManagerFormData {
  user_id: string
  school_id: string
  role: SchoolManagerRole
  can_edit_info: boolean
  can_manage_roster: boolean
  can_manage_schedule: boolean
  can_post_updates: boolean
}

const initialFormData: ManagerFormData = {
  user_id: '',
  school_id: '',
  role: 'manager',
  can_edit_info: true,
  can_manage_roster: true,
  can_manage_schedule: false,
  can_post_updates: true,
}

const ROLE_DESCRIPTIONS: Record<SchoolManagerRole, string> = {
  owner: 'Full control, can add other managers',
  manager: 'Can edit school info and rosters',
  assistant: 'Can only post team updates/news',
}

const ROLE_COLORS: Record<SchoolManagerRole, string> = {
  owner: 'bg-neon-pink/20 text-neon-pink border-neon-pink/30',
  manager: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30',
  assistant: 'bg-neon-green/20 text-neon-green border-neon-green/30',
}

export default function SchoolManagersAdminPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [managers, setManagers] = useState<SchoolManagerWithUser[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [schoolFilter, setSchoolFilter] = useState<string>('all')

  const [showForm, setShowForm] = useState(false)
  const [editingManager, setEditingManager] = useState<SchoolManagerWithUser | null>(null)
  const [formData, setFormData] = useState<ManagerFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)

  const [confirmAction, setConfirmAction] = useState<{
    action: () => Promise<void>
    title: string
    description: string
    confirmLabel?: string
  } | null>(null)

  // User search for adding managers
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [userSearchResults, setUserSearchResults] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null)

  const isSuperAdmin = profile?.is_super_admin === true
  const hasAdminAccess = profile?.is_admin === true || isSuperAdmin
  const { toast } = useToast()

  // Fetch managers and schools
  const fetchData = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Fetch school managers with user and school details
    const { data: managersData, error: managersError } = await supabase
      .from('school_managers')
      .select(`
        *,
        user:users!school_managers_user_id_fkey(id, display_name, email, avatar_url),
        school:schools(id, name, short_name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (managersError) {
      console.error('Error fetching managers:', managersError)
    } else if (managersData) {
      setManagers(managersData as SchoolManagerWithUser[])
    }

    // Fetch schools
    const { data: schoolsData, error: schoolsError } = await supabase
      .from('schools')
      .select('*')
      .order('name')

    if (schoolsError) {
      console.error('Error fetching schools:', schoolsError)
    } else if (schoolsData) {
      setSchools(schoolsData as School[])
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    if (hasAdminAccess) {
      fetchData()
    }
  }, [hasAdminAccess, fetchData])

  // Search users
  const searchUsers = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setUserSearchResults([])
      return
    }

    if (!supabase) {
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    const { data, error } = await supabase
      .from('users')
      .select('id, display_name, email, avatar_url')
      .or(`display_name.ilike.%${term.replace(/[,()%_\\]/g, '')}%,email.ilike.%${term.replace(/[,()%_\\]/g, '')}%`)
      .limit(10)

    if (error) {
      console.error('Error searching users:', error)
    } else if (data) {
      setUserSearchResults(data as SearchUser[])
    }

    setIsSearching(false)
  }, [supabase])

  // Debounced user search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(userSearchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [userSearchTerm, searchUsers])

  // Filter managers
  const filteredManagers = useMemo(() => {
    return managers.filter((manager) => {
      const matchesSearch =
        searchTerm === '' ||
        manager.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.school?.name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSchool =
        schoolFilter === 'all' || manager.school_id === schoolFilter

      return matchesSearch && matchesSchool
    })
  }, [managers, searchTerm, schoolFilter])

  // Group managers by school
  const managersBySchool = useMemo(() => {
    const grouped: Record<string, { school: School; managers: SchoolManagerWithUser[] }> = {}

    for (const manager of filteredManagers) {
      if (!manager.school) continue

      if (!grouped[manager.school_id]) {
        const school = schools.find((s) => s.id === manager.school_id)
        if (school) {
          grouped[manager.school_id] = { school, managers: [] }
        }
      }

      if (grouped[manager.school_id]) {
        grouped[manager.school_id].managers.push(manager)
      }
    }

    return Object.values(grouped).sort((a, b) => a.school.name.localeCompare(b.school.name))
  }, [filteredManagers, schools])

  // Handle form changes
  const handleFormChange = (field: keyof ManagerFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Set default permissions based on role
  const handleRoleChange = (role: SchoolManagerRole) => {
    setFormData((prev) => ({
      ...prev,
      role,
      can_edit_info: role === 'owner' || role === 'manager',
      can_manage_roster: role === 'owner' || role === 'manager',
      can_manage_schedule: role === 'owner',
      can_post_updates: true,
    }))
  }

  // Create manager
  const handleCreateManager = async () => {
    if (!selectedUser || !formData.school_id) {
      toast({ type: 'error', text: 'Please select a user and school' })
      return
    }

    // Check if manager already exists for this school
    const existingManager = managers.find(
      (m) => m.user_id === selectedUser.id && m.school_id === formData.school_id
    )
    if (existingManager) {
      toast({ type: 'error', text: 'This user is already a manager for this school' })
      return
    }

    if (!supabase) {
      toast({ type: 'error', text: 'Database connection not available' })
      return
    }

    setIsSaving(true)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('school_managers')
        .insert({
          user_id: selectedUser.id,
          school_id: formData.school_id,
          role: formData.role,
          can_edit_info: formData.can_edit_info,
          can_manage_roster: formData.can_manage_roster,
          can_manage_schedule: formData.can_manage_schedule,
          can_post_updates: formData.can_post_updates,
          granted_by: user?.id,
        })

      if (error) throw error

      // Also update the user's is_school_manager flag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: userUpdateError } = await (supabase as any)
        .from('users')
        .update({ is_school_manager: true })
        .eq('id', selectedUser.id)

      if (userUpdateError) {
        console.error('Error updating user flag:', userUpdateError)
        // Rollback the manager record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('school_managers')
          .delete()
          .eq('user_id', selectedUser.id)
          .eq('school_id', formData.school_id)
        throw new Error('Failed to update user permissions — manager record rolled back')
      }

      toast({ type: 'success', text: `${selectedUser.display_name || 'User'} added as ${formData.role}` })
      setFormData(initialFormData)
      setSelectedUser(null)
      setUserSearchTerm('')
      setShowForm(false)

      // Refresh data
      fetchData()
    } catch (err) {
      console.error('Error creating manager:', err)
      toast({ type: 'error', text: 'Failed to add manager' })
    } finally {
      setIsSaving(false)
    }
  }

  // Update manager
  const handleUpdateManager = async () => {
    if (!editingManager) return

    if (!supabase) {
      toast({ type: 'error', text: 'Database connection not available' })
      return
    }

    setIsSaving(true)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('school_managers')
        .update({
          role: formData.role,
          can_edit_info: formData.can_edit_info,
          can_manage_roster: formData.can_manage_roster,
          can_manage_schedule: formData.can_manage_schedule,
          can_post_updates: formData.can_post_updates,
        })
        .eq('id', editingManager.id)

      if (error) throw error

      toast({ type: 'success', text: 'Manager updated successfully' })
      setEditingManager(null)
      setShowForm(false)

      // Refresh data
      fetchData()
    } catch (err) {
      console.error('Error updating manager:', err)
      toast({ type: 'error', text: 'Failed to update manager' })
    } finally {
      setIsSaving(false)
    }
  }

  // Remove manager (deactivate)
  const handleRemoveManager = (manager: SchoolManagerWithUser) => {
    setConfirmAction({
      action: async () => {
        if (!supabase) return

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any)
            .from('school_managers')
            .update({ is_active: false })
            .eq('id', manager.id)

          if (error) throw error

          // Check if user has other active manager roles
          const { data: otherRoles } = await supabase
            .from('school_managers')
            .select('id')
            .eq('user_id', manager.user_id)
            .eq('is_active', true)
            .neq('id', manager.id)

          // If no other roles, remove is_school_manager flag
          if (!otherRoles || otherRoles.length === 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('users')
              .update({ is_school_manager: false })
              .eq('id', manager.user_id)
          }

          toast({ type: 'success', text: 'Manager removed successfully' })
          setManagers((prev) => prev.filter((m) => m.id !== manager.id))
        } catch (err) {
          console.error('Error removing manager:', err)
          toast({ type: 'error', text: 'Failed to remove manager' })
        }
      },
      title: 'Remove Manager',
      description: `Remove ${manager.user?.display_name || 'this user'} as manager of ${manager.school?.name}?`,
      confirmLabel: 'Remove',
    })
  }

  // Start editing
  const startEditing = (manager: SchoolManagerWithUser) => {
    setEditingManager(manager)
    setFormData({
      user_id: manager.user_id,
      school_id: manager.school_id,
      role: manager.role,
      can_edit_info: manager.can_edit_info,
      can_manage_roster: manager.can_manage_roster,
      can_manage_schedule: manager.can_manage_schedule,
      can_post_updates: manager.can_post_updates,
    })
    setShowForm(true)
  }

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    router.push('/login?redirect=/admin/school-managers')
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display font-bold text-lg neon-text-green uppercase tracking-wider">
              School Managers
            </h1>
          </div>
          <Button
            onClick={() => {
              setEditingManager(null)
              setFormData(initialFormData)
              setSelectedUser(null)
              setUserSearchTerm('')
              setShowForm(true)
            }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Manager
          </Button>
        </div>
      </header>

      <main className="p-4 pb-24">
        {/* Role Legend */}
        <div className="mb-4 p-4 bg-background-secondary border-2 border-border">
          <h3 className="font-display font-bold text-sm mb-2 text-foreground">Role Descriptions</h3>
          <div className="space-y-1 text-sm text-foreground-muted">
            <p><span className="text-neon-pink font-bold">Owner:</span> {ROLE_DESCRIPTIONS.owner}</p>
            <p><span className="text-neon-blue font-bold">Manager:</span> {ROLE_DESCRIPTIONS.manager}</p>
            <p><span className="text-neon-green font-bold">Assistant:</span> {ROLE_DESCRIPTIONS.assistant}</p>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <Card className="mb-6 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg neon-text-blue">
                {editingManager ? 'Edit Manager' : 'Add School Manager'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowForm(false)
                  setEditingManager(null)
                  setSelectedUser(null)
                  setUserSearchTerm('')
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* User Search (only for new managers) */}
              {!editingManager && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Search User *
                  </label>

                  {selectedUser ? (
                    <div className="flex items-center gap-3 p-3 bg-background-tertiary border-2 border-neon-green/30">
                      <Avatar
                        fallback={selectedUser.display_name || 'U'}
                        src={selectedUser.avatar_url}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="font-display font-bold text-foreground">
                          {selectedUser.display_name || 'No name'}
                        </p>
                        <p className="text-xs text-foreground-muted">{selectedUser.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(null)
                          setUserSearchTerm('')
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                      <Input
                        placeholder="Search by name or email..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-foreground-muted" />
                      )}

                      {/* Search Results Dropdown */}
                      {userSearchResults.length > 0 && !selectedUser && (
                        <div className="absolute z-10 w-full mt-1 bg-background border-2 border-border max-h-48 overflow-y-auto">
                          {userSearchResults.map((searchUser) => (
                            <button
                              key={searchUser.id}
                              className="w-full flex items-center gap-3 p-3 hover:bg-background-secondary text-left transition-colors"
                              onClick={() => {
                                setSelectedUser(searchUser)
                                setUserSearchResults([])
                              }}
                            >
                              <Avatar
                                fallback={searchUser.display_name || 'U'}
                                src={searchUser.avatar_url}
                                size="sm"
                              />
                              <div>
                                <p className="font-display text-sm text-foreground">
                                  {searchUser.display_name || 'No name'}
                                </p>
                                <p className="text-xs text-foreground-muted">{searchUser.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Editing user info (read-only) */}
              {editingManager && (
                <div className="flex items-center gap-3 p-3 bg-background-tertiary border-2 border-border">
                  <Avatar
                    fallback={editingManager.user?.display_name || 'U'}
                    src={editingManager.user?.avatar_url}
                    size="sm"
                  />
                  <div className="flex-1">
                    <p className="font-display font-bold text-foreground">
                      {editingManager.user?.display_name || 'No name'}
                    </p>
                    <p className="text-xs text-foreground-muted">{editingManager.user?.email}</p>
                  </div>
                  <Badge variant="outline">{editingManager.school?.name}</Badge>
                </div>
              )}

              {/* School Select (only for new managers) */}
              {!editingManager && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    School *
                  </label>
                  <select
                    value={formData.school_id}
                    onChange={(e) => handleFormChange('school_id', e.target.value)}
                    className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                  >
                    <option value="">Select school...</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Role Select */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['owner', 'manager', 'assistant'] as SchoolManagerRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={cn(
                        'p-3 border-2 text-left transition-colors',
                        formData.role === role
                          ? ROLE_COLORS[role]
                          : 'border-border hover:border-foreground-muted'
                      )}
                    >
                      <p className="font-display font-bold text-sm capitalize">{role}</p>
                      <p className="text-xs text-foreground-muted mt-1">
                        {ROLE_DESCRIPTIONS[role]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 bg-background-secondary border border-border cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.can_edit_info}
                      onChange={(e) => handleFormChange('can_edit_info', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Edit Info</p>
                      <p className="text-xs text-foreground-muted">Logo, colors, description</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-background-secondary border border-border cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.can_manage_roster}
                      onChange={(e) => handleFormChange('can_manage_roster', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Manage Roster</p>
                      <p className="text-xs text-foreground-muted">Players, seasons</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-background-secondary border border-border cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.can_manage_schedule}
                      onChange={(e) => handleFormChange('can_manage_schedule', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Manage Schedule</p>
                      <p className="text-xs text-foreground-muted">Add/edit games</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-background-secondary border border-border cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.can_post_updates}
                      onChange={(e) => handleFormChange('can_post_updates', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Post Updates</p>
                      <p className="text-xs text-foreground-muted">Team news/announcements</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingManager(null)
                    setSelectedUser(null)
                    setUserSearchTerm('')
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingManager ? handleUpdateManager : handleCreateManager}
                  disabled={isSaving || (!editingManager && (!selectedUser || !formData.school_id))}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingManager ? 'Save Changes' : 'Add Manager'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        {!showForm && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Search managers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
            >
              <option value="all">All Schools</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>{school.short_name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Stats */}
        {!showForm && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Card className="p-3 text-center">
              <div className="text-2xl font-display font-bold text-neon-green">
                {managers.length}
              </div>
              <div className="text-xs text-foreground-muted">Total Managers</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl font-display font-bold text-neon-pink">
                {managers.filter((m) => m.role === 'owner').length}
              </div>
              <div className="text-xs text-foreground-muted">Owners</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl font-display font-bold text-neon-blue">
                {new Set(managers.map((m) => m.school_id)).size}
              </div>
              <div className="text-xs text-foreground-muted">Schools with Managers</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl font-display font-bold text-foreground-muted">
                {schools.length - new Set(managers.map((m) => m.school_id)).size}
              </div>
              <div className="text-xs text-foreground-muted">Schools without Managers</div>
            </Card>
          </div>
        )}

        {/* Managers List */}
        {!showForm && (
          <>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-neon-green" />
              </div>
            ) : managersBySchool.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-foreground-muted" />
                <p className="text-foreground-muted font-display">
                  {searchTerm || schoolFilter !== 'all'
                    ? 'No managers found matching your filters'
                    : 'No school managers yet'}
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setEditingManager(null)
                    setFormData(initialFormData)
                    setShowForm(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Manager
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {managersBySchool.map(({ school, managers: schoolManagers }) => (
                  <div key={school.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <SchoolIcon className="h-5 w-5 text-neon-blue" />
                      <h3 className="font-display font-bold text-foreground">{school.name}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {schoolManagers.length} {schoolManagers.length === 1 ? 'manager' : 'managers'}
                      </Badge>
                    </div>
                    <div className="space-y-2 ml-7">
                      {schoolManagers.map((manager) => (
                        <ManagerRow
                          key={manager.id}
                          manager={manager}
                          onEdit={() => startEditing(manager)}
                          onRemove={() => handleRemoveManager(manager)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <ConfirmModal
        isOpen={!!confirmAction}
        onConfirm={async () => { await confirmAction?.action(); setConfirmAction(null) }}
        onCancel={() => setConfirmAction(null)}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmLabel={confirmAction?.confirmLabel || 'Remove'}
        variant="destructive"
      />
    </div>
  )
}

// Manager Row Component
function ManagerRow({
  manager,
  onEdit,
  onRemove,
}: {
  manager: SchoolManagerWithUser
  onEdit: () => void
  onRemove: () => void
}) {
  return (
    <div className="border-2 border-border bg-background-secondary p-4 hover:border-neon-green/50 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Avatar
            fallback={manager.user?.display_name || 'U'}
            src={manager.user?.avatar_url}
            size="sm"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-display font-bold text-foreground">
                {manager.user?.display_name || 'No name'}
              </h4>
              <Badge className={cn('text-[10px]', ROLE_COLORS[manager.role])}>
                {manager.role}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-foreground-muted flex-wrap">
              {manager.user?.email && <span>{manager.user.email}</span>}
            </div>

            {/* Permissions badges */}
            <div className="flex gap-1 mt-2 flex-wrap">
              {manager.can_edit_info && (
                <Badge variant="secondary" className="text-[10px]">Edit Info</Badge>
              )}
              {manager.can_manage_roster && (
                <Badge variant="secondary" className="text-[10px]">Roster</Badge>
              )}
              {manager.can_manage_schedule && (
                <Badge variant="secondary" className="text-[10px]">Schedule</Badge>
              )}
              {manager.can_post_updates && (
                <Badge variant="secondary" className="text-[10px]">Updates</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Shield className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
