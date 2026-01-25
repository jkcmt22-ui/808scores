'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit2,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  School as SchoolIcon,
  Search,
  Save,
  X,
  MapPin,
  Users,
} from 'lucide-react'
import { Button, Badge, Input, Card } from '@/components/ui'
import { useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { School } from '@/types/database'

interface SchoolFormData {
  name: string
  short_name: string
  mascot: string
  island: string
  league: string
  division: string
  colors: { primary: string; secondary: string } | null
}

const ISLANDS = ['Oahu', 'Maui', 'Hawaii', 'Kauai', 'Molokai', 'Lanai']
const LEAGUES = ['OIA', 'ILH', 'BIIF', 'MIL', 'KIF']
const DIVISIONS = ['Division I', 'Division II', 'Open']

const initialFormData: SchoolFormData = {
  name: '',
  short_name: '',
  mascot: '',
  island: 'Oahu',
  league: '',
  division: '',
  colors: null,
}

export default function SchoolsAdminPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient()!, [])

  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [islandFilter, setIslandFilter] = useState<string>('all')

  const [showForm, setShowForm] = useState(false)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)
  const [formData, setFormData] = useState<SchoolFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const hasAdminAccess = profile?.is_admin === true || profile?.is_super_admin === true

  // Fetch schools
  useEffect(() => {
    const fetchSchools = async () => {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching schools:', error)
      } else if (data) {
        setSchools(data as School[])
      }

      setIsLoading(false)
    }

    if (hasAdminAccess) {
      fetchSchools()
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
      setMessage({ type: 'error', text: 'Name and short name are required' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('schools')
        .insert({
          name: formData.name,
          short_name: formData.short_name,
          mascot: formData.mascot || null,
          island: formData.island,
          league: formData.league || null,
          division: formData.division || null,
          colors: formData.colors,
        } as never)

      if (error) throw error

      setMessage({ type: 'success', text: 'School created successfully' })
      setFormData(initialFormData)
      setShowForm(false)

      // Refresh schools
      const { data } = await supabase.from('schools').select('*').order('name')
      if (data) setSchools(data as School[])
    } catch (err) {
      console.error('Error creating school:', err)
      setMessage({ type: 'error', text: 'Failed to create school' })
    } finally {
      setIsSaving(false)
    }
  }

  // Update school
  const handleUpdateSchool = async () => {
    if (!editingSchool) return

    setIsSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: formData.name,
          short_name: formData.short_name,
          mascot: formData.mascot || null,
          island: formData.island,
          league: formData.league || null,
          division: formData.division || null,
          colors: formData.colors,
        } as never)
        .eq('id', editingSchool.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'School updated successfully' })
      setEditingSchool(null)
      setShowForm(false)

      // Refresh schools
      const { data } = await supabase.from('schools').select('*').order('name')
      if (data) setSchools(data as School[])
    } catch (err) {
      console.error('Error updating school:', err)
      setMessage({ type: 'error', text: 'Failed to update school' })
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
    })
    setShowForm(true)
  }

  // Clear message after delay
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

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
    router.push('/login?redirect=/admin/schools')
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
        {/* Message Toast */}
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

        {/* Filters */}
        {!showForm && (
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
        {!showForm && (
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
        {!showForm && (
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
}: {
  school: School
  onEdit: () => void
  onView: () => void
}) {
  const colors = school.colors as { primary: string; secondary: string } | null

  return (
    <div className="border-2 border-border bg-background-secondary p-4 hover:border-neon-blue/50 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Color Badge */}
          {colors && (
            <div
              className="w-10 h-10 rounded-full border-2 border-border flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 50%, ${colors.secondary} 50%)`,
              }}
            />
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
          <Button variant="outline" size="sm" onClick={onView}>
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
