'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Copy, Check, Trash2, Loader2, Key, Users, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { ConfirmModal } from '@/components/admin/confirm-modal'

interface BetaCode {
  id: string
  code: string
  name: string | null
  description: string | null
  max_uses: number
  use_count: number
  expires_at: string | null
  created_at: string
  is_active: boolean
  notes: string | null
}

export default function BetaCodesPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const supabase = createClient()
  const hasAdminAccess = profile?.is_admin === true || profile?.is_super_admin === true
  const { toast } = useToast()

  const [codes, setCodes] = useState<BetaCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_uses: 1,
    expires_days: 30,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    action: () => Promise<void>
    title: string
    description: string
    confirmLabel?: string
  } | null>(null)

  const fetchCodes = async () => {
    if (!supabase) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('beta_codes' as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching beta codes:', error)
        toast({ type: 'error', text: `Failed to load codes: ${error.message}` })
      } else if (data) {
        setCodes(data)
      }
    } catch (err) {
      console.error('Unexpected error fetching codes:', err)
      toast({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (hasAdminAccess) {
      fetchCodes()
    }
  }, [hasAdminAccess])

  // Only admins can access - check AFTER all hooks
  if (profile === undefined) {
    // Still loading profile
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-neon-blue" />
        <p className="mt-4 text-foreground-muted">Loading...</p>
      </div>
    )
  }

  if (!hasAdminAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <AlertCircle className="mb-4 h-12 w-12 text-neon-pink" />
        <h1 className="font-display text-xl font-bold text-foreground">Access Denied</h1>
        <p className="text-foreground-muted text-sm mt-2">You need admin access to manage beta codes</p>
        <Button onClick={() => router.push('/admin')} className="mt-4">Back to Admin</Button>
      </div>
    )
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleCreateCode = async () => {
    if (!supabase) return
    setIsSaving(true)

    try {
      const code = generateCode()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + formData.expires_days)

      const { error } = await supabase.from('beta_codes' as any).insert({
        code,
        name: formData.name || null,
        description: formData.description || null,
        max_uses: formData.max_uses,
        expires_at: expiresAt.toISOString(),
        created_by: user?.id,
      } as any)

      if (error) throw error

      toast({ type: 'success', text: `Beta code created: ${code}` })
      setFormData({ name: '', description: '', max_uses: 1, expires_days: 30 })
      setShowForm(false)
      fetchCodes()
    } catch (err) {
      console.error('Error creating beta code:', err)
      toast({ type: 'error', text: 'Failed to create beta code' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleDeactivateCode = (codeId: string) => {
    if (!supabase) return
    setConfirmAction({
      action: async () => {
        try {
          // @ts-expect-error - Beta tables not yet in generated types
          const { error } = await supabase.from('beta_codes').update({ is_active: false }).eq('id', codeId)

          if (error) throw error

          toast({ type: 'success', text: 'Code deactivated' })
          fetchCodes()
        } catch {
          toast({ type: 'error', text: 'Failed to deactivate code' })
        }
      },
      title: 'Deactivate Code',
      description: 'Deactivate this beta code? Users will no longer be able to use it.',
      confirmLabel: 'Deactivate',
    })
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="font-display font-bold text-lg neon-text-yellow uppercase tracking-wider">
            Beta Codes
          </h1>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Code
          </Button>
        </div>
      </header>

      <main className="p-4 grid-bg">
        {/* Create Form */}
        {showForm && (
          <Card className="mb-6 p-4">
            <h2 className="font-display font-bold text-lg mb-4 neon-text-green">
              Generate New Beta Code
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Name/Label (optional)
                </label>
                <Input
                  placeholder="Wave 1 Coaches"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description (optional)
                </label>
                <Input
                  placeholder="For coaching staff at ILH schools"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Max Uses
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="9999"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Expires In (days)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.expires_days}
                    onChange={(e) => setFormData({ ...formData, expires_days: parseInt(e.target.value) || 30 })}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCode} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
                  Generate Code
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border-neon-blue/30">
            <p className="text-2xl font-display font-bold text-neon-blue">
              {codes.filter(c => c.is_active).length}
            </p>
            <p className="text-xs text-foreground-muted uppercase">Active Codes</p>
          </Card>
          <Card className="p-4 border-neon-green/30">
            <p className="text-2xl font-display font-bold text-neon-green">
              {codes.reduce((sum, c) => sum + c.use_count, 0)}
            </p>
            <p className="text-xs text-foreground-muted uppercase">Total Uses</p>
          </Card>
          <Card className="p-4 border-neon-yellow/30">
            <p className="text-2xl font-display font-bold text-neon-yellow">
              {codes.filter(c => c.use_count < c.max_uses && c.is_active).length}
            </p>
            <p className="text-xs text-foreground-muted uppercase">Available</p>
          </Card>
          <Card className="p-4 border-neon-pink/30">
            <p className="text-2xl font-display font-bold text-neon-pink">
              {codes.filter(c => c.expires_at && new Date(c.expires_at) < new Date()).length}
            </p>
            <p className="text-xs text-foreground-muted uppercase">Expired</p>
          </Card>
        </div>

        {/* Codes List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
          </div>
        ) : codes.length === 0 ? (
          <Card className="p-8 text-center">
            <Key className="mx-auto mb-4 h-12 w-12 text-foreground-muted" />
            <p className="text-foreground-muted">No beta codes yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {codes.map((code) => {
              const isExpired = code.expires_at && new Date(code.expires_at) < new Date()
              const isMaxed = code.use_count >= code.max_uses
              const isUsable = code.is_active && !isExpired && !isMaxed

              return (
                <Card key={code.id} className={cn(
                  'p-4 border-2',
                  isUsable ? 'border-neon-green/30' : 'border-border opacity-60'
                )}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Code */}
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

                        {/* Status badges */}
                        {!code.is_active && <Badge variant="secondary">Inactive</Badge>}
                        {isExpired && <Badge variant="destructive">Expired</Badge>}
                        {isMaxed && <Badge variant="default">Max Uses</Badge>}
                        {isUsable && <Badge variant="default" className="bg-neon-green/20 text-neon-green border-neon-green/30">Active</Badge>}
                      </div>

                      {/* Name & Description */}
                      {code.name && (
                        <p className="text-sm font-medium text-foreground mb-1">{code.name}</p>
                      )}
                      {code.description && (
                        <p className="text-sm text-foreground-muted mb-2">{code.description}</p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-foreground-muted">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {code.use_count} / {code.max_uses} uses
                        </span>
                        {code.expires_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expires {new Date(code.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {code.is_active && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeactivateCode(code.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={!!confirmAction}
        onConfirm={async () => { await confirmAction?.action(); setConfirmAction(null) }}
        onCancel={() => setConfirmAction(null)}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmLabel={confirmAction?.confirmLabel || 'Deactivate'}
        variant="destructive"
      />
    </div>
  )
}
