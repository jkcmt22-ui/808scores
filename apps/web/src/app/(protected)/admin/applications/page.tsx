'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Loader2, Shield } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { ApplicationCard, type TrustedReporterApplication } from '@/components/admin/application-card'
import { ConfirmModal } from '@/components/admin/confirm-modal'

export default function AdminApplicationsPage() {
  const { profile } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()

  const [applications, setApplications] = useState<TrustedReporterApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [applicationFilter, setApplicationFilter] = useState<'pending' | 'all'>('pending')
  const [confirmAction, setConfirmAction] = useState<{
    action: () => Promise<void>
    title: string
    description: string
    confirmLabel?: string
    variant?: 'destructive' | 'default'
  } | null>(null)

  const fetchApplications = useCallback(async () => {
    if (!supabase) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('trusted_reporter_applications')
        .select(`
          *,
          user:users(display_name, email, phone, reputation_score, submission_count, verified_count)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        toast({ type: 'error', text: 'Failed to load applications' })
      } else if (data) {
        setApplications(data as TrustedReporterApplication[])
      }
    } catch (err) {
      console.error('Error fetching applications:', err)
      toast({ type: 'error', text: 'Failed to load applications' })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const filteredApplications = useMemo(() => {
    if (applicationFilter === 'pending') {
      return applications.filter((app) => app.status === 'pending')
    }
    return applications
  }, [applications, applicationFilter])

  const handleApproveApplication = (application: TrustedReporterApplication) => {
    if (!supabase) return
    setConfirmAction({
      action: async () => {
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

          if (userError) {
            // Rollback: revert application status if user update fails
            await supabase
              .from('trusted_reporter_applications')
              .update({ status: 'pending', reviewed_at: null, reviewed_by: null } as never)
              .eq('id', application.id)
            throw userError
          }

          // Update local state
          setApplications((prev) =>
            prev.map((app) =>
              app.id === application.id
                ? { ...app, status: 'approved' as const, reviewed_at: new Date().toISOString() }
                : app
            )
          )
          toast({ type: 'success', text: `${application.full_name} is now a Trusted Reporter!` })
        } catch (err) {
          console.error('Error approving application:', err)
          toast({ type: 'error', text: 'Failed to approve application' })
        }
      },
      title: 'Approve Application',
      description: `Approve ${application.full_name} as a Trusted Reporter?`,
      confirmLabel: 'Approve',
      variant: 'default',
    })
  }

  const handleRejectApplication = (application: TrustedReporterApplication) => {
    if (!supabase) return
    setConfirmAction({
      action: async () => {
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

          setApplications((prev) =>
            prev.map((app) =>
              app.id === application.id
                ? { ...app, status: 'rejected' as const, reviewed_at: new Date().toISOString() }
                : app
            )
          )
          toast({ type: 'success', text: 'Application rejected' })
        } catch (err) {
          console.error('Error rejecting application:', err)
          toast({ type: 'error', text: 'Failed to reject application' })
        }
      },
      title: 'Reject Application',
      description: `Reject ${application.full_name}'s application?`,
      confirmLabel: 'Reject',
      variant: 'destructive',
    })
  }

  return (
    <div className="p-4 pb-24">
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
      <ConfirmModal
        isOpen={!!confirmAction}
        onConfirm={async () => { await confirmAction?.action(); setConfirmAction(null) }}
        onCancel={() => setConfirmAction(null)}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmLabel={confirmAction?.confirmLabel || 'Confirm'}
        variant={confirmAction?.variant || 'destructive'}
      />
    </div>
  )
}
