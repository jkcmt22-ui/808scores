'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Header } from '@/components/layout'
import { Button, Input, Badge } from '@/components/ui'
import {
  Gift, Plus, Pencil, Trash2, Search, X, Save,
  CreditCard, ShoppingBag, DollarSign, Sparkles, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import type { Prize, PrizeType } from '@/types/database'

const PRIZE_TYPES: { value: PrizeType; label: string; icon: typeof Gift }[] = [
  { value: 'gift_card', label: 'Gift Card', icon: CreditCard },
  { value: 'merchandise', label: 'Merchandise', icon: ShoppingBag },
  { value: 'cash', label: 'Cash', icon: DollarSign },
  { value: 'experience', label: 'Experience', icon: Sparkles },
]

interface PrizeFormData {
  name: string
  description: string
  value_cents: number
  prize_type: PrizeType
  sponsor: string
  image_url: string
  quantity: number
  active: boolean
}

const defaultFormData: PrizeFormData = {
  name: '',
  description: '',
  value_cents: 0,
  prize_type: 'gift_card',
  sponsor: '',
  image_url: '',
  quantity: 1,
  active: true,
}

export default function AdminPrizesPage() {
  const { profile } = useAuth()
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null)
  const [formData, setFormData] = useState<PrizeFormData>(defaultFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    action: () => Promise<void>
    title: string
    description: string
    confirmLabel?: string
  } | null>(null)

  const supabase = createClient()
  const hasAdminAccess = profile?.is_admin === true || profile?.is_super_admin === true
  const { toast } = useToast()

  const fetchPrizes = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching prizes:', error)
    } else {
      setPrizes(data || [])
    }
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchPrizes()
  }, [fetchPrizes])

  const filteredPrizes = prizes.filter((prize) =>
    prize.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prize.sponsor?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (prize: Prize) => {
    setEditingPrize(prize)
    setFormData({
      name: prize.name,
      description: prize.description || '',
      value_cents: prize.value_cents,
      prize_type: prize.prize_type,
      sponsor: prize.sponsor || '',
      image_url: prize.image_url || '',
      quantity: prize.quantity,
      active: prize.active,
    })
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingPrize(null)
    setFormData(defaultFormData)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!supabase) {
      toast({ type: 'error', text: 'Database connection not available' })
      return
    }

    if (!formData.name.trim()) {
      toast({ type: 'error', text: 'Prize name is required' })
      return
    }

    setIsSaving(true)

    try {
      if (editingPrize) {
        // Update existing prize
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
          .from('prizes')
          .update({
            name: formData.name,
            description: formData.description || null,
            value_cents: formData.value_cents,
            prize_type: formData.prize_type,
            sponsor: formData.sponsor || null,
            image_url: formData.image_url || null,
            quantity: formData.quantity,
            active: formData.active,
          })
          .eq('id', editingPrize.id)

        if (updateError) throw updateError
      } else {
        // Create new prize
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any)
          .from('prizes')
          .insert({
            name: formData.name,
            description: formData.description || null,
            value_cents: formData.value_cents,
            prize_type: formData.prize_type,
            sponsor: formData.sponsor || null,
            image_url: formData.image_url || null,
            quantity: formData.quantity,
            active: formData.active,
          })

        if (insertError) throw insertError
      }

      setShowForm(false)
      toast({ type: 'success', text: editingPrize ? 'Prize updated' : 'Prize created' })
      fetchPrizes()
    } catch (err) {
      console.error('Error saving prize:', err)
      toast({ type: 'error', text: 'Failed to save prize' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (prize: Prize) => {
    if (!supabase) return
    setConfirmAction({
      action: async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('prizes')
          .delete()
          .eq('id', prize.id)

        if (error) {
          console.error('Error deleting prize:', error)
          toast({ type: 'error', text: 'Failed to delete prize' })
        } else {
          toast({ type: 'success', text: 'Prize deleted' })
          fetchPrizes()
        }
      },
      title: 'Delete Prize',
      description: `Delete "${prize.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
    })
  }

  if (!hasAdminAccess) {
    return (
      <>
        <Header title="Prizes" showBack />
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
      <Header title="Prizes" showBack />

      <main className="px-4 pb-24 grid-bg">
        {/* Controls */}
        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prizes..."
              className="pl-9"
            />
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Prize
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80" onClick={() => setShowForm(false)} />
            <div className="relative w-full max-w-lg mx-4 bg-background border-2 border-border rounded-lg shadow-xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b-2 border-border">
                <h2 className="font-display text-lg font-bold uppercase tracking-wider">
                  {editingPrize ? 'Edit Prize' : 'New Prize'}
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
                    placeholder="e.g. $25 Amazon Gift Card"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Prize description..."
                    rows={3}
                    className="w-full px-3 py-2 bg-background-secondary border-2 border-border rounded-md text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Value (cents)</label>
                    <Input
                      type="number"
                      value={formData.value_cents}
                      onChange={(e) => setFormData({ ...formData, value_cents: parseInt(e.target.value) || 0 })}
                      placeholder="2500 = $25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <Input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      min={1}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prize Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRIZE_TYPES.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setFormData({ ...formData, prize_type: value })}
                        className={cn(
                          'flex items-center gap-2 p-3 border-2 rounded-md transition-colors',
                          formData.prize_type === value
                            ? 'border-neon-blue bg-neon-blue/10 text-neon-blue'
                            : 'border-border hover:border-foreground-muted'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sponsor</label>
                  <Input
                    value={formData.sponsor}
                    onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
                    placeholder="e.g. Local Business Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 rounded accent-neon-blue"
                  />
                  <span className="text-sm">Active (available for raffles)</span>
                </label>
              </div>

              <div className="flex gap-3 p-4 border-t-2 border-border">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} loading={isSaving} className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  Save Prize
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Prize List */}
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-neon-blue" />
            </div>
          ) : filteredPrizes.length === 0 ? (
            <div className="scoreboard-panel p-8 text-center">
              <Gift className="h-8 w-8 text-foreground-muted mx-auto mb-3" />
              <p className="text-foreground-muted">No prizes found</p>
            </div>
          ) : (
            filteredPrizes.map((prize) => {
              const typeConfig = PRIZE_TYPES.find((t) => t.value === prize.prize_type)
              const Icon = typeConfig?.icon || Gift
              const valueDisplay = prize.value_cents >= 100
                ? `$${(prize.value_cents / 100).toFixed(0)}`
                : `${prize.value_cents}c`

              return (
                <div key={prize.id} className="scoreboard-panel p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-md bg-background-tertiary flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {prize.image_url ? (
                        <Image
                          src={prize.image_url}
                          alt={prize.name}
                          width={48}
                          height={48}
                          className="h-full w-full rounded-md object-cover"
                          unoptimized={!prize.image_url.includes('supabase')}
                        />
                      ) : (
                        <Icon className="h-6 w-6 text-foreground-muted" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-foreground truncate">{prize.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">{typeConfig?.label}</Badge>
                        {!prize.active && <Badge variant="secondary" className="text-[10px] bg-destructive/20 text-destructive">Inactive</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-foreground-muted">
                        <span>{valueDisplay}</span>
                        <span>Qty: {prize.quantity}</span>
                        {prize.sponsor && <span>by {prize.sponsor}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(prize)}
                        className="p-2 hover:bg-background-tertiary rounded-md"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prize)}
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
