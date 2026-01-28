'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout'
import { Button, Input, Badge } from '@/components/ui'
import {
  Ticket, Plus, Pencil, Trash2, Search, X, Save,
  Eye, Calendar, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { RaffleWithPrize, Prize, RaffleType, RaffleStatus } from '@/types/database'

const RAFFLE_TYPES: { value: RaffleType; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'season_end', label: 'Season End' },
  { value: 'special', label: 'Special' },
]

const RAFFLE_STATUSES: { value: RaffleStatus; label: string; color: string }[] = [
  { value: 'upcoming', label: 'Upcoming', color: 'text-foreground-muted' },
  { value: 'open', label: 'Open', color: 'text-neon-green' },
  { value: 'closed', label: 'Closed', color: 'text-neon-yellow' },
  { value: 'drawing', label: 'Drawing', color: 'text-neon-pink' },
  { value: 'completed', label: 'Completed', color: 'text-neon-blue' },
  { value: 'canceled', label: 'Canceled', color: 'text-destructive' },
]

interface RaffleFormData {
  name: string
  description: string
  raffle_type: RaffleType
  prize_id: string
  entries_open_at: string
  entries_close_at: string
  drawing_at: string
  min_points_to_enter: number
  points_per_entry: number
  max_entries_per_user: number | null
  winner_count: number
  status: RaffleStatus
  season: string
  month: string
  is_active: boolean
  legal_disclaimer: string
}

const defaultFormData: RaffleFormData = {
  name: '',
  description: '',
  raffle_type: 'monthly',
  prize_id: '',
  entries_open_at: '',
  entries_close_at: '',
  drawing_at: '',
  min_points_to_enter: 50,
  points_per_entry: 25,
  max_entries_per_user: 10,
  winner_count: 1,
  status: 'upcoming',
  season: '',
  month: '',
  is_active: true,
  legal_disclaimer: '',
}

export default function AdminRafflesPage() {
  const { profile } = useAuth()
  const [raffles, setRaffles] = useState<RaffleWithPrize[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRaffle, setEditingRaffle] = useState<RaffleWithPrize | null>(null)
  const [formData, setFormData] = useState<RaffleFormData>(defaultFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const hasAdminAccess = profile?.is_admin === true || profile?.is_super_admin === true

  const fetchData = useCallback(async () => {
    setIsLoading(true)

    const [rafflesResult, prizesResult] = await Promise.all([
      supabase
        .from('raffles')
        .select('*, prize:prizes(*)')
        .order('created_at', { ascending: false }),
      supabase
        .from('prizes')
        .select('*')
        .eq('active', true)
        .order('name'),
    ])

    if (!rafflesResult.error) {
      setRaffles((rafflesResult.data || []) as RaffleWithPrize[])
    }
    if (!prizesResult.error) {
      setPrizes(prizesResult.data || [])
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredRaffles = raffles.filter((raffle) =>
    raffle.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDateForInput = (isoDate: string) => {
    if (!isoDate) return ''
    return new Date(isoDate).toISOString().slice(0, 16)
  }

  const handleEdit = (raffle: RaffleWithPrize) => {
    setEditingRaffle(raffle)
    setFormData({
      name: raffle.name,
      description: raffle.description || '',
      raffle_type: raffle.raffle_type,
      prize_id: raffle.prize_id || '',
      entries_open_at: formatDateForInput(raffle.entries_open_at),
      entries_close_at: formatDateForInput(raffle.entries_close_at),
      drawing_at: formatDateForInput(raffle.drawing_at),
      min_points_to_enter: raffle.min_points_to_enter,
      points_per_entry: raffle.points_per_entry,
      max_entries_per_user: raffle.max_entries_per_user,
      winner_count: raffle.winner_count,
      status: raffle.status,
      season: raffle.season || '',
      month: raffle.month || '',
      is_active: raffle.is_active,
      legal_disclaimer: raffle.legal_disclaimer || '',
    })
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingRaffle(null)
    setFormData(defaultFormData)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Raffle name is required')
      return
    }

    setIsSaving(true)
    setError(null)

    const dataToSave = {
      name: formData.name,
      description: formData.description || null,
      raffle_type: formData.raffle_type,
      prize_id: formData.prize_id || null,
      entries_open_at: formData.entries_open_at ? new Date(formData.entries_open_at).toISOString() : null,
      entries_close_at: formData.entries_close_at ? new Date(formData.entries_close_at).toISOString() : null,
      drawing_at: formData.drawing_at ? new Date(formData.drawing_at).toISOString() : null,
      min_points_to_enter: formData.min_points_to_enter,
      points_per_entry: formData.points_per_entry,
      max_entries_per_user: formData.max_entries_per_user,
      winner_count: formData.winner_count,
      status: formData.status,
      season: formData.season || null,
      month: formData.month || null,
      is_active: formData.is_active,
      legal_disclaimer: formData.legal_disclaimer || null,
    }

    try {
      if (editingRaffle) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
          .from('raffles')
          .update(dataToSave)
          .eq('id', editingRaffle.id)

        if (updateError) throw updateError
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any)
          .from('raffles')
          .insert(dataToSave)

        if (insertError) throw insertError
      }

      setShowForm(false)
      fetchData()
    } catch (err) {
      console.error('Error saving raffle:', err)
      setError('Failed to save raffle')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (raffle: RaffleWithPrize) => {
    if (!confirm(`Delete "${raffle.name}"? This cannot be undone.`)) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('raffles')
      .delete()
      .eq('id', raffle.id)

    if (error) {
      console.error('Error deleting raffle:', error)
      alert('Failed to delete raffle')
    } else {
      fetchData()
    }
  }

  if (!hasAdminAccess) {
    return (
      <>
        <Header title="Raffles" showBack />
        <main className="p-4">
          <div className="scoreboard-panel p-8 text-center">
            <p className="text-foreground-muted">You don&apos;t have permission to access this page.</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header title="Raffles" showBack />

      <main className="px-4 pb-24 grid-bg">
        {/* Controls */}
        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search raffles..."
              className="pl-9"
            />
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Raffle
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80" onClick={() => setShowForm(false)} />
            <div className="relative w-full max-w-lg mx-4 bg-background border-2 border-border rounded-lg shadow-xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b-2 border-border">
                <h2 className="font-display text-lg font-bold uppercase tracking-wider">
                  {editingRaffle ? 'Edit Raffle' : 'New Raffle'}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-1 hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. January Monthly Raffle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Raffle description..."
                    rows={2}
                    className="w-full px-3 py-2 bg-background-secondary border-2 border-border rounded-md text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={formData.raffle_type}
                      onChange={(e) => setFormData({ ...formData, raffle_type: e.target.value as RaffleType })}
                      className="w-full px-3 py-2 bg-background-secondary border-2 border-border rounded-md text-sm"
                    >
                      {RAFFLE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as RaffleStatus })}
                      className="w-full px-3 py-2 bg-background-secondary border-2 border-border rounded-md text-sm"
                    >
                      {RAFFLE_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Prize</label>
                  <select
                    value={formData.prize_id}
                    onChange={(e) => setFormData({ ...formData, prize_id: e.target.value })}
                    className="w-full px-3 py-2 bg-background-secondary border-2 border-border rounded-md text-sm"
                  >
                    <option value="">Select a prize...</option>
                    {prizes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${(p.value_cents / 100).toFixed(0)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Season</label>
                    <Input
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      placeholder="e.g. 2025-26"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Month</label>
                    <Input
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      placeholder="e.g. January"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Entries Open</label>
                  <Input
                    type="datetime-local"
                    value={formData.entries_open_at}
                    onChange={(e) => setFormData({ ...formData, entries_open_at: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Entries Close</label>
                  <Input
                    type="datetime-local"
                    value={formData.entries_close_at}
                    onChange={(e) => setFormData({ ...formData, entries_close_at: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Drawing Date</label>
                  <Input
                    type="datetime-local"
                    value={formData.drawing_at}
                    onChange={(e) => setFormData({ ...formData, drawing_at: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Points</label>
                    <Input
                      type="number"
                      value={formData.min_points_to_enter}
                      onChange={(e) => setFormData({ ...formData, min_points_to_enter: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Points/Entry</label>
                    <Input
                      type="number"
                      value={formData.points_per_entry}
                      onChange={(e) => setFormData({ ...formData, points_per_entry: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Entries</label>
                    <Input
                      type="number"
                      value={formData.max_entries_per_user || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        max_entries_per_user: e.target.value ? parseInt(e.target.value) : null
                      })}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Winner Count</label>
                    <Input
                      type="number"
                      value={formData.winner_count}
                      onChange={(e) => setFormData({ ...formData, winner_count: parseInt(e.target.value) || 1 })}
                      min={1}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 rounded accent-neon-blue"
                  />
                  <span className="text-sm">Active</span>
                </label>

                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3 p-4 border-t-2 border-border">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} loading={isSaving} className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Raffle List */}
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-neon-blue" />
            </div>
          ) : filteredRaffles.length === 0 ? (
            <div className="scoreboard-panel p-8 text-center">
              <Ticket className="h-8 w-8 text-foreground-muted mx-auto mb-3" />
              <p className="text-foreground-muted">No raffles found</p>
            </div>
          ) : (
            filteredRaffles.map((raffle) => {
              const statusConfig = RAFFLE_STATUSES.find((s) => s.value === raffle.status)
              const typeConfig = RAFFLE_TYPES.find((t) => t.value === raffle.raffle_type)

              return (
                <div key={raffle.id} className="scoreboard-panel p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-md bg-background-tertiary flex items-center justify-center flex-shrink-0">
                      <Ticket className="h-6 w-6 text-neon-yellow" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-display font-bold text-foreground">{raffle.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">{typeConfig?.label}</Badge>
                        <Badge
                          variant="secondary"
                          className={cn('text-[10px]', statusConfig?.color)}
                        >
                          {statusConfig?.label}
                        </Badge>
                        {!raffle.is_active && (
                          <Badge variant="secondary" className="text-[10px] bg-destructive/20 text-destructive">
                            Inactive
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-foreground-muted flex-wrap">
                        {raffle.prize && <span>Prize: {raffle.prize.name}</span>}
                        <span>{raffle.points_per_entry} pts/entry</span>
                        {raffle.entries_close_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Closes: {new Date(raffle.entries_close_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/admin/raffles/${raffle.id}`}>
                        <button
                          className="p-2 hover:bg-background-tertiary rounded-md"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleEdit(raffle)}
                        className="p-2 hover:bg-background-tertiary rounded-md"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(raffle)}
                        className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-md"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </>
  )
}
