'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  School as SchoolIcon,
  Search,
  Save,
  X,
  MapPin,
  Users,
  Trophy,
} from 'lucide-react'
import { Button, Badge, Input, Card } from '@/components/ui'
import { useAuth, getCurrentSeasonYear } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { adminCache } from '@/lib/admin-cache'
import type { School, Sport, TeamWithSchool } from '@/types/database'

interface SchoolFormData {
  name: string
  short_name: string
  mascot: string
  island: string
  league: string
  division: string
  colors: { primary: string; secondary: string } | null
  logo: File | null
  currentLogoUrl: string | null
}

const ISLANDS = ['Oahu', 'Maui', 'Hawaii', 'Kauai', 'Molokai', 'Lanai']
const LEAGUES = ['OIA', 'ILH', 'BIIF', 'MIL', 'KIF']
const DIVISIONS = ['Division I', 'Division II', 'Open']
const TEAM_DIVISIONS = ['Division I', 'Division II', 'Open'] as const

const initialFormData: SchoolFormData = {
  name: '',
  short_name: '',
  mascot: '',
  island: 'Oahu',
  league: '',
  division: '',
  colors: null,
  logo: null,
  currentLogoUrl: null,
}

export default function SchoolsAdminPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const supabaseClient = useMemo(() => createClient(), [])

  const [schools, setSchools] = useState<School[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [islandFilter, setIslandFilter] = useState<string>('all')

  const [showForm, setShowForm] = useState(false)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)
  const [formData, setFormData] = useState<SchoolFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)

  // Team management
  const [managingTeamsFor, setManagingTeamsFor] = useState<School | null>(null)
  const [schoolTeams, setSchoolTeams] = useState<TeamWithSchool[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const loadingTeamsForSchoolIdRef = useRef<string | null>(null)

  const hasAdminAccess = profile?.is_admin === true || profile?.is_super_admin === true
  const supabase = supabaseClient
  const { toast } = useToast()

  // Fetch schools and sports
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

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

      // Fetch sports
      const { data: sportsData, error: sportsError } = await supabase
        .from('sports')
        .select('*')
        .eq('active', true)
        .order('sort_order')

      if (sportsError) {
        console.error('Error fetching sports:', sportsError)
      } else if (sportsData) {
        setSports(sportsData as Sport[])
      }

      setIsLoading(false)
    }

    if (hasAdminAccess) {
      fetchData()
    } else {
      // User doesn't have admin access, stop loading
      setIsLoading(false)
    }
  }, [supabase, hasAdminAccess])

  // Filter schools
  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      const matchesSearch =
        searchTerm === '' ||
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.mascot?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesIsland =
        islandFilter === 'all' || school.island === islandFilter

      return matchesSearch && matchesIsland
    })
  }, [schools, searchTerm, islandFilter])

  // Handle form changes
  const handleFormChange = (field: keyof SchoolFormData, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Create school
  const handleCreateSchool = async () => {
    if (!formData.name || !formData.short_name) {
      toast({ type: 'error', text: 'Name and short name are required' })
      return
    }

    setIsSaving(true)

    try {
      // Build FormData
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('short_name', formData.short_name)
      if (formData.mascot) formDataToSend.append('mascot', formData.mascot)
      formDataToSend.append('island', formData.island)
      if (formData.league) formDataToSend.append('league', formData.league)
      if (formData.division) formDataToSend.append('division', formData.division)
      if (formData.colors) formDataToSend.append('colors', JSON.stringify(formData.colors))
      if (formData.logo) formDataToSend.append('logo', formData.logo)

      // Call API
      const response = await fetch('/api/admin/schools', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        let errorMessage = 'Failed to create school'
        try {
          const error = await response.json()
          errorMessage = error.message || errorMessage
        } catch {
          // Response is not JSON, use default message
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()

      // Show detailed success message with team creation info
      if (result.teamsError) {
        toast({
          type: 'error',
          text: `School created but teams failed. Click "Manage Teams" on the school to create them.`
        })
      } else {
        toast({
          type: 'success',
          text: `School created with ${result.teamsCreated || 0} teams. Ready to add games!`
        })
      }

      setFormData(initialFormData)
      setShowForm(false)

      // Invalidate cache and refresh schools list
      adminCache.clearSchools()
      if (!supabase) return
      const { data } = await supabase.from('schools').select('*').order('name')
      if (data) setSchools(data as School[])
    } catch (err) {
      console.error('Error creating school:', err)
      toast({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to create school'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Update school
  const handleUpdateSchool = async () => {
    if (!editingSchool) return

    setIsSaving(true)

    try {
      // Build FormData
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('short_name', formData.short_name)
      if (formData.mascot) formDataToSend.append('mascot', formData.mascot)
      formDataToSend.append('island', formData.island)
      if (formData.league) formDataToSend.append('league', formData.league)
      if (formData.division) formDataToSend.append('division', formData.division)
      if (formData.colors) formDataToSend.append('colors', JSON.stringify(formData.colors))
      if (formData.logo) formDataToSend.append('logo', formData.logo)

      // Call API
      const response = await fetch(`/api/admin/schools/${editingSchool.id}`, {
        method: 'PATCH',
        body: formDataToSend,
      })

      if (!response.ok) {
        let errorMessage = 'Failed to update school'
        try {
          const error = await response.json()
          errorMessage = error.message || errorMessage
        } catch {
          // Response is not JSON, use default message
        }
        throw new Error(errorMessage)
      }

      toast({ type: 'success', text: 'School updated successfully' })
      setEditingSchool(null)
      setShowForm(false)

      // Invalidate cache and refresh schools
      adminCache.clearSchools()
      if (!supabase) return
      const { data } = await supabase.from('schools').select('*').order('name')
      if (data) setSchools(data as School[])
    } catch (err) {
      console.error('Error updating school:', err)
      toast({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update school'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Start editing
  const startEditing = (school: School) => {
    setEditingSchool(school)
    const colors = school.colors as { primary: string; secondary: string } | null
    setFormData({
      name: school.name,
      short_name: school.short_name,
      mascot: school.mascot || '',
      island: school.island,
      league: school.league || '',
      division: school.division || '',
      colors: colors,
      logo: null,
      currentLogoUrl: school.logo_url || null,
    })
    setShowForm(true)
  }

  // Open team management for a school
  const openTeamManagement = async (school: School) => {
    if (!supabase) return

    // Track which school we're loading for (prevents race condition)
    const requestId = school.id
    loadingTeamsForSchoolIdRef.current = requestId

    setManagingTeamsFor(school)
    setSchoolTeams([]) // Clear old data immediately
    setIsLoadingTeams(true)

    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*, school:schools(*)')
        .eq('school_id', school.id)
        .eq('season_year', getCurrentSeasonYear())
        .order('sport_id')

      // Only update state if this is still the active request (prevents stale data)
      if (loadingTeamsForSchoolIdRef.current !== requestId) {
        return
      }

      if (error) {
        console.error('Error fetching teams:', error)
        toast({ type: 'error', text: 'Failed to load teams' })
      } else {
        setSchoolTeams(data as TeamWithSchool[])
      }
    } finally {
      // Only clear loading state if this is still the active request
      if (loadingTeamsForSchoolIdRef.current === requestId) {
        setIsLoadingTeams(false)
      }
    }
  }

  // Create a team for this school
  const createTeam = async (sportId: string, gender: string, division?: string) => {
    if (!supabase || !managingTeamsFor) return

    setIsSaving(true)

    // Default to school's division or 'Division I'
    const teamDivision = division || managingTeamsFor.division || 'Division I'

    const { data, error } = await supabase.from('teams').insert({
      school_id: managingTeamsFor.id,
      sport_id: sportId,
      gender,
      division: teamDivision,
      league: managingTeamsFor.league || null,
      season_year: getCurrentSeasonYear(),
      is_active: true,
    } as never).select()

    if (error) {
      console.error('Error creating team:', error)
      toast({ type: 'error', text: `Failed to create team: ${error.message}` })
    } else {
      toast({ type: 'success', text: 'Team created' })
      // Refresh teams
      openTeamManagement(managingTeamsFor)
    }

    setIsSaving(false)
  }

  // Update team division
  const updateTeamDivision = async (teamId: string, division: string) => {
    if (!supabase || !managingTeamsFor) return

    const { error } = await supabase
      .from('teams')
      .update({ division } as never)
      .eq('id', teamId)

    if (error) {
      console.error('Error updating team division:', error)
      toast({ type: 'error', text: `Failed to update division: ${error.message}` })
    } else {
      toast({ type: 'success', text: 'Division updated' })
      // Refresh teams
      openTeamManagement(managingTeamsFor)
    }
  }

  // Toggle team active status
  const toggleTeamActive = async (teamId: string, currentActive: boolean) => {
    if (!supabase || !managingTeamsFor) return

    const { error } = await supabase
      .from('teams')
      .update({ is_active: !currentActive } as never)
      .eq('id', teamId)

    if (error) {
      console.error('Error updating team:', error)
      toast({ type: 'error', text: 'Failed to update team' })
    } else {
      toast({ type: 'success', text: currentActive ? 'Team deactivated' : 'Team activated' })
      // Refresh teams
      openTeamManagement(managingTeamsFor)
    }
  }

  // Create all missing teams for a school
  const createAllTeams = async () => {
    if (!supabase || !managingTeamsFor) return

    setIsSaving(true)

    // Find which sports don't have teams yet
    const existingTeamKeys = new Set(
      schoolTeams.map((t) => `${t.sport_id}-${t.gender}`)
    )

    // Default to school's division or 'Division I'
    const defaultDivision = managingTeamsFor.division || 'Division I'

    const teamsToCreate = sports
      .filter((sport) => !existingTeamKeys.has(`${sport.id}-${sport.gender}`))
      .map((sport) => ({
        school_id: managingTeamsFor.id,
        sport_id: sport.id,
        gender: sport.gender,
        division: defaultDivision,
        league: managingTeamsFor.league || null,
        season_year: getCurrentSeasonYear(),
        is_active: true,
      }))

    if (teamsToCreate.length === 0) {
      toast({ type: 'success', text: 'All teams already exist' })
      setIsSaving(false)
      return
    }

    const { data, error } = await supabase.from('teams').insert(teamsToCreate as never).select()

    if (error) {
      console.error('Error creating teams:', error)
      toast({ type: 'error', text: `Failed to create teams: ${error.message}` })
    } else {
      toast({ type: 'success', text: `Created ${data?.length || teamsToCreate.length} teams` })
      openTeamManagement(managingTeamsFor)
    }

    setIsSaving(false)
  }

  // Cleanup blob URLs for logo preview
  useEffect(() => {
    if (formData.logo) {
      const blobUrl = URL.createObjectURL(formData.logo)
      setLogoPreviewUrl(blobUrl)
      return () => {
        URL.revokeObjectURL(blobUrl)
        setLogoPreviewUrl(null)
      }
    } else {
      setLogoPreviewUrl(null)
    }
  }, [formData.logo])

  // NOTE: Auth checks (loading, user, profile, admin access) are handled by AdminLayout
  // Do not duplicate them here - the layout ensures these are valid before rendering children

  // Check Supabase client availability (this is different - it's about DB connection)
  if (!supabaseClient) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <AlertCircle className="mb-4 h-12 w-12 text-neon-pink" />
        <h1 className="mb-2 font-display text-xl font-bold text-foreground uppercase">Connection Error</h1>
        <p className="mb-4 text-foreground-muted text-sm text-center">
          Unable to connect to the database. Please check your environment variables.
        </p>
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
            <h1 className="font-display font-bold text-lg neon-text-yellow uppercase tracking-wider">
              Schools / Teams
            </h1>
          </div>
          <Button
            onClick={() => {
              setEditingSchool(null)
              setFormData(initialFormData)
              setShowForm(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add School
          </Button>
        </div>
      </header>

      <main className="p-4 pb-24">
        {/* Form Modal */}
        {showForm && (
          <Card className="mb-6 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg neon-text-blue">
                {editingSchool ? 'Edit School' : 'Add School'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowForm(false)
                  setEditingSchool(null)
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                  <Input
                    placeholder="e.g., Kahuku High School"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Short Name *</label>
                  <Input
                    placeholder="e.g., Kahuku"
                    value={formData.short_name}
                    onChange={(e) => handleFormChange('short_name', e.target.value)}
                  />
                </div>
              </div>

              {/* Mascot */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Mascot</label>
                <Input
                  placeholder="e.g., Red Raiders"
                  value={formData.mascot}
                  onChange={(e) => handleFormChange('mascot', e.target.value)}
                />
              </div>

              {/* Island, League, Division */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Island</label>
                  <select
                    value={formData.island}
                    onChange={(e) => handleFormChange('island', e.target.value)}
                    className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                  >
                    {ISLANDS.map((island) => (
                      <option key={island} value={island}>{island}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">League</label>
                  <select
                    value={formData.league}
                    onChange={(e) => handleFormChange('league', e.target.value)}
                    className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                  >
                    <option value="">Select...</option>
                    {LEAGUES.map((league) => (
                      <option key={league} value={league}>{league}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Division</label>
                  <select
                    value={formData.division}
                    onChange={(e) => handleFormChange('division', e.target.value)}
                    className="w-full h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
                  >
                    <option value="">Select...</option>
                    {DIVISIONS.map((div) => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">School Colors</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-foreground-muted mb-1">Primary</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.colors?.primary || '#000000'}
                        onChange={(e) => setFormData((prev) => ({
                          ...prev,
                          colors: {
                            primary: e.target.value,
                            secondary: prev.colors?.secondary || '#ffffff',
                          },
                        }))}
                        className="h-10 w-16 border-2 border-border cursor-pointer"
                      />
                      <Input
                        value={formData.colors?.primary || ''}
                        onChange={(e) => setFormData((prev) => ({
                          ...prev,
                          colors: {
                            primary: e.target.value,
                            secondary: prev.colors?.secondary || '#ffffff',
                          },
                        }))}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-foreground-muted mb-1">Secondary</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.colors?.secondary || '#ffffff'}
                        onChange={(e) => setFormData((prev) => ({
                          ...prev,
                          colors: {
                            primary: prev.colors?.primary || '#000000',
                            secondary: e.target.value,
                          },
                        }))}
                        className="h-10 w-16 border-2 border-border cursor-pointer"
                      />
                      <Input
                        value={formData.colors?.secondary || ''}
                        onChange={(e) => setFormData((prev) => ({
                          ...prev,
                          colors: {
                            primary: prev.colors?.primary || '#000000',
                            secondary: e.target.value,
                          },
                        }))}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  School Logo
                </label>
                <div className="space-y-2">
                  {/* Show current logo if editing */}
                  {editingSchool?.logo_url && !formData.logo && (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editingSchool.logo_url}
                        alt="Current logo"
                        className="h-12 w-12 object-contain border-2 border-border rounded"
                      />
                      <span className="text-xs text-foreground-muted">Current logo</span>
                    </div>
                  )}

                  {/* Show preview if new file selected */}
                  {formData.logo && logoPreviewUrl && (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoPreviewUrl}
                        alt="Preview"
                        className="h-12 w-12 object-contain border-2 border-border rounded"
                      />
                      <span className="text-xs text-neon-green">New logo selected</span>
                    </div>
                  )}

                  {/* File input */}
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // Validate file size (5MB max)
                        if (file.size > 5 * 1024 * 1024) {
                          toast({
                            type: 'error',
                            text: 'Logo must be smaller than 5MB'
                          })
                          e.target.value = ''
                          return
                        }
                        setFormData(prev => ({ ...prev, logo: file }))
                      }
                    }}
                  />
                  <p className="text-xs text-foreground-muted">
                    PNG, JPG, SVG up to 5MB. Transparent backgrounds recommended.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingSchool(null)
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingSchool ? handleUpdateSchool : handleCreateSchool}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingSchool ? 'Save Changes' : 'Create School'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Team Management Modal */}
        {managingTeamsFor && (
          <Card className="mb-6 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg neon-text-green">
                Teams: {managingTeamsFor.short_name}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createAllTeams}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Create All Missing Teams
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setManagingTeamsFor(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {isLoadingTeams ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-neon-green" />
              </div>
            ) : (
              <div className="space-y-4">
                {sports.map((sport) => {
                  // Get ALL teams for this sport/gender (not just one)
                  const teamsForSport = schoolTeams.filter(
                    (t) => t.sport_id === sport.id && t.gender === sport.gender
                  )
                  // Find which divisions already have teams
                  const existingDivisions = new Set(teamsForSport.map((t) => t.division))
                  // Available divisions for "Add Team" button
                  const availableDivisions = TEAM_DIVISIONS.filter(
                    (div) => !existingDivisions.has(div)
                  )

                  return (
                    <div
                      key={`${sport.id}-${sport.gender}`}
                      className="border-2 border-border"
                    >
                      {/* Sport header */}
                      <div className="flex items-center gap-3 p-3 bg-background-secondary border-b border-border">
                        <Badge
                          variant={sport.gender === 'boys' ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {sport.gender === 'boys' ? 'B' : sport.gender === 'girls' ? 'G' : 'Co'}
                        </Badge>
                        <span className="font-display font-bold text-foreground">
                          {sport.display_name || sport.name}
                        </span>
                        <span className="text-xs text-foreground-muted">
                          ({teamsForSport.length} team{teamsForSport.length !== 1 ? 's' : ''})
                        </span>
                      </div>

                      {/* Teams list */}
                      <div className="divide-y divide-border">
                        {teamsForSport.length > 0 ? (
                          teamsForSport.map((team) => (
                            <div
                              key={team.id}
                              className={cn(
                                'flex items-center justify-between p-3',
                                team.is_active
                                  ? 'bg-neon-green/5'
                                  : 'bg-background-secondary opacity-50'
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-display text-sm text-foreground">
                                  {team.division || 'Division I'}
                                </span>
                                <span className="text-xs text-foreground-muted">
                                  {team.is_active ? '(Active)' : '(Inactive)'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Division dropdown for existing teams */}
                                <select
                                  value={team.division || 'Division I'}
                                  onChange={(e) => updateTeamDivision(team.id, e.target.value)}
                                  className="h-8 px-2 text-xs border-2 border-border bg-background text-foreground font-display"
                                >
                                  {TEAM_DIVISIONS.map((div) => (
                                    <option key={div} value={div}>
                                      {div}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  variant={team.is_active ? 'destructive' : 'default'}
                                  size="sm"
                                  onClick={() => toggleTeamActive(team.id, team.is_active)}
                                >
                                  {team.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-foreground-muted text-sm">
                            No teams yet
                          </div>
                        )}

                        {/* Add Team button - show available divisions */}
                        {availableDivisions.length > 0 && (
                          <div className="p-3 bg-background-tertiary">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-foreground-muted">Add team:</span>
                              {availableDivisions.map((div) => (
                                <Button
                                  key={div}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => createTeam(sport.id, sport.gender, div)}
                                  disabled={isSaving}
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  {div}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {sports.length === 0 && (
                  <p className="text-center text-foreground-muted py-4">
                    No sports configured. Add sports first.
                  </p>
                )}
              </div>
            )}

            <div className="mt-4 p-3 bg-background-secondary border-2 border-border">
              <p className="text-xs text-foreground-muted">
                <strong>Note:</strong> Schools can have multiple teams per sport (e.g., Division I and Division II).
                Each team can be scheduled for games separately in the 2025-2026 season.
              </p>
            </div>
          </Card>
        )}

        {/* Filters */}
        {!showForm && !managingTeamsFor && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={islandFilter}
              onChange={(e) => setIslandFilter(e.target.value)}
              className="h-10 px-3 border-2 border-border bg-background text-foreground font-display text-sm"
            >
              <option value="all">All Islands</option>
              {ISLANDS.map((island) => (
                <option key={island} value={island}>{island}</option>
              ))}
            </select>
          </div>
        )}

        {/* Stats */}
        {!showForm && !managingTeamsFor && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {LEAGUES.slice(0, 4).map((league) => (
              <Card key={league} className="p-3 text-center">
                <div className="text-2xl font-display font-bold text-neon-blue">
                  {schools.filter((s) => s.league === league).length}
                </div>
                <div className="text-xs text-foreground-muted">{league}</div>
              </Card>
            ))}
          </div>
        )}

        {/* Schools List */}
        {!showForm && !managingTeamsFor && (
          <>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
              </div>
            ) : filteredSchools.length === 0 ? (
              <Card className="p-8 text-center">
                <SchoolIcon className="mx-auto mb-4 h-12 w-12 text-foreground-muted" />
                <p className="text-foreground-muted font-display">No schools found</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredSchools.map((school) => (
                  <SchoolRow
                    key={school.id}
                    school={school}
                    onEdit={() => startEditing(school)}
                    onView={() => router.push(`/school/${school.id}`)}
                    onManageTeams={() => openTeamManagement(school)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

// School Row Component
function SchoolRow({
  school,
  onEdit,
  onView,
  onManageTeams,
}: {
  school: School
  onEdit: () => void
  onView: () => void
  onManageTeams: () => void
}) {
  const colors = school.colors as { primary: string; secondary: string } | null

  return (
    <div className="border-2 border-border bg-background-secondary p-4 hover:border-neon-blue/50 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Logo or Color Badge */}
          {school.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={school.logo_url}
              alt={`${school.name} logo`}
              className="w-10 h-10 object-contain rounded border-2 border-border flex-shrink-0"
            />
          ) : colors ? (
            <div
              className="w-10 h-10 rounded-full border-2 border-border flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 50%, ${colors.secondary} 50%)`,
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-border flex-shrink-0 bg-background-secondary" />
          )}

          <div className="flex-1 min-w-0">
            {/* Name & Mascot */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-display font-bold text-foreground">{school.name}</h3>
              {school.mascot && (
                <span className="text-sm text-foreground-muted">({school.mascot})</span>
              )}
            </div>

            {/* Details */}
            <div className="flex items-center gap-4 text-xs text-foreground-muted flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {school.island}
              </span>
              {school.league && (
                <Badge variant="outline" className="text-[10px]">{school.league}</Badge>
              )}
              {school.division && (
                <Badge variant="secondary" className="text-[10px]">{school.division}</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onManageTeams} title="Manage Teams">
            <Trophy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onView} title="View School">
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit} title="Edit School">
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
