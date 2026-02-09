'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Loader2, Key, Copy, Check } from 'lucide-react'
import { Button, Badge, Input, Card } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { TrustedReporterCode } from '@/types/database'

export default function AdminCodesPage() {
  const { profile, user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()

  const [codes, setCodes] = useState<TrustedReporterCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newCodeNote, setNewCodeNote] = useState('')
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const fetchCodes = useCallback(async () => {
    if (!supabase) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('trusted_reporter_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        toast({ type: 'error', text: `Failed to load codes: ${error.message}` })
      } else if (data) {
        setCodes(data as TrustedReporterCode[])
      }
    } catch (err) {
      console.error('Error fetching codes:', err)
      toast({ type: 'error', text: 'Failed to load codes' })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  useEffect(() => {
    fetchCodes()
  }, [fetchCodes])

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const randomValues = new Uint32Array(8)
    crypto.getRandomValues(randomValues)
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(randomValues[i] % chars.length)
    }
    return code
  }

  const handleGenerateCode = async () => {
    if (!supabase) return
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
      toast({ type: 'success', text: `Code ${code} created!` })
    } catch (err) {
      console.error('Error generating code:', err)
      toast({ type: 'error', text: 'Failed to generate code' })
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const handleDeactivateCode = async (codeId: string) => {
    if (!supabase) return
    try {
      const { error } = await supabase
        .from('trusted_reporter_codes')
        .update({ active: false } as never)
        .eq('id', codeId)

      if (error) throw error
      setCodes((prev) => prev.map((c) => (c.id === codeId ? { ...c, active: false } : c)))
      toast({ type: 'success', text: 'Code deactivated' })
    } catch (err) {
      console.error('Error deactivating code:', err)
      toast({ type: 'error', text: 'Failed to deactivate code' })
    }
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="p-4 pb-24">
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
            <Button onClick={handleGenerateCode} disabled={isGeneratingCode}>
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
          <p className="text-foreground-muted font-display">No codes generated yet</p>
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
                      <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                    )}
                    {code.use_count >= code.max_uses && (
                      <Badge variant="default" className="text-[10px]">Used</Badge>
                    )}
                  </div>
                  {code.note && (
                    <p className="text-sm text-foreground-muted mb-1">{code.note}</p>
                  )}
                  <p className="text-xs text-foreground-subtle">
                    Created: {new Date(code.created_at).toLocaleDateString('en-US', { timeZone: 'Pacific/Honolulu' })}
                    {code.redeemed_at && (
                      <> &middot; Redeemed: {new Date(code.redeemed_at).toLocaleDateString('en-US', { timeZone: 'Pacific/Honolulu' })}</>
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
  )
}
