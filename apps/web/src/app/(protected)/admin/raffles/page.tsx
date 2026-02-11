'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Header } from '@/components/layout'
import { Button, Input, Badge } from '@/components/ui'
import {
  Ticket, Plus, Pencil, Trash2, Search, X, Save,
  Eye, Calendar, Loader2, Zap, CalendarDays, Trophy
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks'
import { getCurrentSeasonYear } from '@/hooks/use-team-roster'
import { cn, utcToHawaiiDatetime, hawaiiDatetimeToUTC } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import Link from 'next/link'
import type { RaffleWithPrize, Prize, RaffleType, RaffleStatus, RafflePrize } from '@/types/database'

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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface RaffleFormData {
  name: string
  description: string
  raffle_type: RaffleType
  prize_id: string
  top_contributor_prize_id: string
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

interface RafflePrizeEntry {
  position: number
  prize_id: string
}

const defaultFormData: RaffleFormData = {
  name: '',
  description: '',
  raffle_type: 'monthly',
  prize_id: '',
  top_contributor_prize_id: '',
  entries_open_at: '',
  entries_close_at: '',
  drawing_at: '',
  min_points_to_enter: 0,
  points_per_entry: 0,
  max_entries_per_user: null,
  winner_count: 1,
  status: 'upcoming',
  season: '',
  month: '',
  is_active: true,
  legal_disclaimer: '',
}

// Get Hawaii month/year info for smart defaults
function getHawaiiMonthInfo() {
  const now = new Date()
  const hawaiiMonth = parseInt(now.toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu', month: 'numeric' }))
  const hawaiiYear = parseInt(now.toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu', year: 'numeric' }))
  return { month: hawaiiMonth, year: hawaiiYear }
}

function getMonthlyDefaults(): Partial<RaffleFormData> {
  const { month, year } = getHawaiiMonthInfo()
  const monthName = MONTHS[month - 1]
  const season = getCurrentSeasonYear()

  // Month start/end in Hawaii time
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01T00:00`
  const lastDay = new Date(year, month, 0).getDate()
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${lastDay}T23:59`

  // Drawing: 1st of next month
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const drawingDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01T12:00`

  return {
    name: `${monthName} ${year} Monthly Raffle`,
    description: `Report scores throughout ${monthName} to earn entries. Every point = 1 entry!`,
    raffle_type: 'monthly',
    entries_open_at: monthStart,
    entries_close_at: monthEnd,
    drawing_at: drawingDate,
    min_points_to_enter: 0,
    points_per_entry: 0,
    max_entries_per_user: null,
    winner_count: 3,
    status: 'open',
    season,
    month: monthName,
    is_active: true,
  }
}

function getQuickRaffleDefaults(): Partial<RaffleFormData> {
  const now = new Date()
  const hawaiiNow = new Date(now.toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' }))

  // Default: this Monday to Sunday
  const dayOfWeek = hawaiiNow.getDay()
  const monday = new Date(hawaiiNow)
  monday.setDate(hawaiiNow.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const weekNum = Math.ceil(hawaiiNow.getDate() / 7)

  const formatDate = (d: Date, time: string) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${time}`
  }

  return {
    name: `Week ${weekNum} Bonus Raffle`,
    description: 'Submit scores this week for bonus entries!',
    raffle_type: 'special',
    entries_open_at: formatDate(monday, '00:00'),
    entries_close_at: formatDate(sunday, '23:59'),
    drawing_at: formatDate(new Date(sunday.getTime() + 86400000), '12:00'),
    min_points_to_enter: 0,
    points_per_entry: 0,
    max_entries_per_user: null,
    winner_count: 1,
    status: 'open',
    is_active: true,
  }
}

export default function AdminRafflesPage() {
  const { profile } = useAuth()
  const [raffles, setRaffles] = useState<RaffleWithPrize[]>([])
  const [rafflePrizesMap, setRafflePrizesMap] = useState<Record<string, RafflePrize[]>>({})
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'monthly' | 'quick' | 'edit'>('create')
  const [editingRaffle, setEditingRaffle] = useState<RaffleWithPrize | null>(null)
  const [formData, setFormData] = useState<RaffleFormData>(defaultFormData)
  const [rafflePrizes, setRafflePrizes] = useState<RafflePrizeEntry[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    action: () => Promise<void>
    title: string
    description: string
    confirmLabel?: string
  } | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const hasAdminAccess = profile?.is_admin === true || profile?.is_super_admin === true
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const [rafflesResult, prizesResult, rafflePrizesResult] = await Promise.all([
      supabase
        .from('raffles')
        .select('*, prize:prizes(*)')
        .order('created_at', { ascending: false }),
      supabase
        .from('prizes')
        .select('*')
        .eq('active', true)
        .order('name'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('raffle_prizes')
        .select('*')
        .order('position'),
    ])

    if (!rafflesResult.error) {
      setRaffles((rafflesResult.data || []) as RaffleWithPrize[])
    }
    if (!prizesResult.error) {
      setPrizes(prizesResult.data || [])
    }
    if (!rafflePrizesResult.error) {
      // Group raffle_prizes by raffle_id
      const map: Record<string, RafflePrize[]> = {}
      for (const rp of (rafflePrizesResult.data || []) as RafflePrize[]) {
        if (!map[rp.raffle_id]) map[rp.raffle_id] = []
        map[rp.raffle_id].push(rp)
      }
      setRafflePrizesMap(map)
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
    return utcToHawaiiDatetime(isoDate)
  }

  const handleEdit = (raffle: RaffleWithPrize) => {
    setEditingRaffle(raffle)
    setFormMode('edit')
    setFormData({
      name: raffle.name,
      description: raffle.description || '',
      raffle_type: raffle.raffle_type,
      prize_id: raffle.prize_id || '',
      top_contributor_prize_id: raffle.top_contributor_prize_id || '',
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
    // Load existing raffle_prizes
    const existingPrizes = rafflePrizesMap[raffle.id] || []
    setRafflePrizes(existingPrizes.map(rp => ({ position: rp.position, prize_id: rp.prize_id || '' })))
    setShowForm(true)
  }

  const handleCreateMonthly = () => {
    setEditingRaffle(null)
    setFormMode('monthly')
    const defaults = getMonthlyDefaults()
    setFormData({ ...defaultFormData, ...defaults })
    setRafflePrizes([
      { position: 1, prize_id: '' },
      { position: 2, prize_id: '' },
      { position: 3, prize_id: '' },
    ])
    setShowForm(true)
  }

  const handleCreateQuick = () => {
    setEditingRaffle(null)
    setFormMode('quick')
    const defaults = getQuickRaffleDefaults()
    setFormData({ ...defaultFormData, ...defaults })
    setRafflePrizes([{ position: 1, prize_id: '' }])
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingRaffle(null)
    setFormMode('create')
    setFormData(defaultFormData)
    setRafflePrizes([])
    setShowForm(true)
  }

  const addRafflePrize = () => {
    const nextPosition = rafflePrizes.length > 0
      ? Math.max(...rafflePrizes.map(p => p.position)) + 1
      : 1
    setRafflePrizes([...rafflePrizes, { position: nextPosition, prize_id: '' }])
  }

  const removeRafflePrize = (index: number) => {
    setRafflePrizes(rafflePrizes.filter((_, i) => i !== index))
  }

  const updateRafflePrize = (index: number, prizeId: string) => {
    const updated = [...rafflePrizes]
    updated[index] = { ...updated[index], prize_id: prizeId }
    setRafflePrizes(updated)
  }

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast({ type: 'error', text: 'Raffle name is required' })
      return
    }

    // Validate date order
    if (formData.entries_open_at && formData.entries_close_at) {
      const openDate = new Date(formData.entries_open_at)
      const closeDate = new Date(formData.entries_close_at)
      if (closeDate <= openDate) {
        toast({ type: 'error', text: 'Entries close date must be after open date' })
        return
      }
    }

    if (formData.entries_close_at && formData.drawing_at) {
      const closeDate = new Date(formData.entries_close_at)
      const drawDate = new Date(formData.drawing_at)
      if (drawDate < closeDate) {
        toast({ type: 'error', text: 'Drawing date must be on or after entries close date' })
        return
      }
    }

    setIsSaving(true)

    // Set winner_count from raffle prizes if multi-prize
    const winnerCount = rafflePrizes.length > 0
      ? rafflePrizes.filter(rp => rp.prize_id).length
      : formData.winner_count

    const dataToSave = {
      name: formData.name,
      description: formData.description || null,
      raffle_type: formData.raffle_type,
      prize_id: formData.prize_id || (rafflePrizes.length > 0 ? rafflePrizes[0]?.prize_id || null : null),
      top_contributor_prize_id: formData.top_contributor_prize_id || null,
      entries_open_at: formData.entries_open_at ? hawaiiDatetimeToUTC(formData.entries_open_at) : null,
      entries_close_at: formData.entries_close_at ? hawaiiDatetimeToUTC(formData.entries_close_at) : null,
      drawing_at: formData.drawing_at ? hawaiiDatetimeToUTC(formData.drawing_at) : null,
      min_points_to_enter: formData.min_points_to_enter,
      points_per_entry: formData.points_per_entry,
      max_entries_per_user: formData.max_entries_per_user,
      winner_count: winnerCount,
      status: formData.status,
      season: formData.season || null,
      month: formData.month || null,
      is_active: formData.is_active,
      legal_disclaimer: formData.legal_disclaimer || null,
    }

    try {
      let raffleId: string

      if (editingRaffle) {
        raffleId = editingRaffle.id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
          .from('raffles')
          .update(dataToSave)
          .eq('id', editingRaffle.id)

        if (updateError) throw updateError
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: insertData, error: insertError } = await (supabase as any)
          .from('raffles')
          .insert(dataToSave)
          .select('id')
          .single()

        if (insertError) throw insertError
        raffleId = (insertData as { id: string }).id
      }

      // Save raffle_prizes (junction table)
      if (rafflePrizes.length > 0) {
        // Delete existing raffle_prizes for this raffle
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: deleteError } = await (supabase as any)
          .from('raffle_prizes')
          .delete()
          .eq('raffle_id', raffleId)

        if (deleteError) {
          console.error('Error deleting old raffle prizes:', deleteError)
          toast({ type: 'error', text: 'Failed to update prize assignments' })
          return
        }

        // Insert new ones
        const prizesToInsert = rafflePrizes
          .filter(rp => rp.prize_id)
          .map(rp => ({
            raffle_id: raffleId,
            prize_id: rp.prize_id,
            position: rp.position,
          }))

        if (prizesToInsert.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: prizeError } = await (supabase as any)
            .from('raffle_prizes')
            .insert(prizesToInsert)

          if (prizeError) {
            console.error('Error saving raffle prizes:', prizeError)
            toast({ type: 'error', text: 'Raffle saved but prize assignments failed' })
          }
        }
      }

      setShowForm(false)
      toast({ type: 'success', text: editingRaffle ? 'Raffle updated' : 'Raffle created' })
      fetchData()
    } catch (err) {
      console.error('Error saving raffle:', err)
      toast({ type: 'error', text: 'Failed to save raffle' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (raffle: RaffleWithPrize) => {
    setConfirmAction({
      action: async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('raffles')
          .delete()
          .eq('id', raffle.id)

        if (error) {
          console.error('Error deleting raffle:', error)
          toast({ type: 'error', text: 'Failed to delete raffle' })
        } else {
          toast({ type: 'success', text: 'Raffle deleted' })
          fetchData()
        }
      },
      title: 'Delete Raffle',
      description: `Delete "${raffle.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
    })
  }

  const getPrizeById = (id: string) => prizes.find(p => p.id === id)

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
        </div>

        {/* Create Buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={handleCreateMonthly} className="gap-2">
            <CalendarDays className="h-4 w-4" />
            New Monthly Raffle
          </Button>
          <Button onClick={handleCreateQuick} variant="outline" className="gap-2">
            <Zap className="h-4 w-4" />
            Quick Raffle
          </Button>
          <Button onClick={handleCreate} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Custom
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80" onClick={() => setShowForm(false)} />
            <div className="relative w-full max-w-lg mx-4 bg-background border-2 border-border rounded-lg shadow-xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b-2 border-border">
                <h2 className="font-display text-lg font-bold uppercase tracking-wider">
                  {formMode === 'monthly' ? 'New Monthly Raffle' :
                   formMode === 'quick' ? 'Quick Raffle' :
                   editingRaffle ? 'Edit Raffle' : 'New Raffle'}
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
                    placeholder="e.g. February 2026 Monthly Raffle"
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

                {formMode !== 'quick' && (
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
                )}

                {/* Multi-Prize Section */}
                <div className="scoreboard-panel p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-neon-yellow" />
                      Raffle Prizes
                    </label>
                    <button
                      onClick={addRafflePrize}
                      className="text-xs text-neon-blue hover:text-neon-blue/80 font-display uppercase tracking-wider"
                    >
                      + Add Prize
                    </button>
                  </div>
                  {rafflePrizes.length === 0 ? (
                    <p className="text-xs text-foreground-muted">No prizes added yet. Click &quot;+ Add Prize&quot; to assign prizes by position.</p>
                  ) : (
                    <div className="space-y-2">
                      {rafflePrizes.map((rp, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className={cn(
                            'font-display font-bold text-sm w-8 text-center',
                            rp.position === 1 && 'text-neon-yellow',
                            rp.position === 2 && 'text-foreground-muted',
                            rp.position === 3 && 'text-neon-pink',
                          )}>
                            {rp.position === 1 ? '1st' : rp.position === 2 ? '2nd' : rp.position === 3 ? '3rd' : `${rp.position}th`}
                          </span>
                          <select
                            value={rp.prize_id}
                            onChange={(e) => updateRafflePrize(index, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-background-secondary border-2 border-border rounded-md text-sm"
                          >
                            <option value="">Select prize...</option>
                            {prizes.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (${(p.value_cents / 100).toFixed(0)})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeRafflePrize(index)}
                            className="p-1 hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Contributor Prize */}
                {(formMode === 'monthly' || formMode === 'edit') && (
                  <div className="scoreboard-panel p-3">
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-neon-green" />
                      Top Contributor Prize (Guaranteed)
                    </label>
                    <p className="text-xs text-foreground-muted mb-2">
                      Awarded to the #1 contributor — not drawn, earned by contribution count.
                    </p>
                    <select
                      value={formData.top_contributor_prize_id}
                      onChange={(e) => setFormData({ ...formData, top_contributor_prize_id: e.target.value })}
                      className="w-full px-3 py-2 bg-background-secondary border-2 border-border rounded-md text-sm"
                    >
                      <option value="">None</option>
                      {prizes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${(p.value_cents / 100).toFixed(0)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Legacy single prize (for custom/backward compat) */}
                {formMode === 'create' && rafflePrizes.length === 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Prize (single)</label>
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
                )}

                {formMode !== 'quick' && (
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
                        placeholder="e.g. February"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Entries Open (Hawaii Time)</label>
                  <Input
                    type="datetime-local"
                    value={formData.entries_open_at}
                    onChange={(e) => setFormData({ ...formData, entries_open_at: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Entries Close (Hawaii Time)</label>
                  <Input
                    type="datetime-local"
                    value={formData.entries_close_at}
                    onChange={(e) => setFormData({ ...formData, entries_close_at: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Drawing Date (Hawaii Time)</label>
                  <Input
                    type="datetime-local"
                    value={formData.drawing_at}
                    onChange={(e) => setFormData({ ...formData, drawing_at: e.target.value })}
                  />
                </div>

                {formMode !== 'quick' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Min Points to Enter</label>
                        <Input
                          type="number"
                          value={formData.min_points_to_enter}
                          onChange={(e) => setFormData({ ...formData, min_points_to_enter: parseInt(e.target.value) || 0 })}
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
                  </>
                )}
              </div>

              <div className="flex gap-3 p-4 border-t-2 border-border">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} loading={isSaving} className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  {formMode === 'monthly' ? 'Publish Monthly Raffle' :
                   formMode === 'quick' ? 'Publish Quick Raffle' :
                   'Save'}
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
              const prizeCount = (rafflePrizesMap[raffle.id] || []).length

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
                        {prizeCount > 0 && <span>{prizeCount} prize{prizeCount !== 1 ? 's' : ''}</span>}
                        {raffle.top_contributor_prize_id && (
                          <span className="text-neon-green">+ Top Contributor</span>
                        )}
                        {raffle.entries_close_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Closes: {new Date(raffle.entries_close_at).toLocaleDateString('en-US', { timeZone: 'Pacific/Honolulu' })}
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

      <ConfirmModal
        isOpen={!!confirmAction}
        onConfirm={async () => { await confirmAction?.action(); setConfirmAction(null) }}
        onCancel={() => setConfirmAction(null)}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmLabel={confirmAction?.confirmLabel || 'Delete'}
        variant="destructive"
      />
    </>
  )
}
