'use client'

import { Clock, CheckCircle, AlertCircle, UserCheck, UserX } from 'lucide-react'
import { Button, Badge, Card } from '@/components/ui'
import { cn } from '@/lib/utils'

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

export type { TrustedReporterApplication }

export function ApplicationCard({
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

  return (
    <Card className={cn(
      'border-2 p-4',
      isPending && 'border-neon-yellow/30',
      isApproved && 'border-neon-green/30 bg-neon-green/5',
      isRejected && 'border-neon-pink/30 bg-neon-pink/5'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
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

          <p className="text-xs text-foreground-subtle mt-2">
            Applied: {new Date(application.created_at).toLocaleDateString()}
            {application.reviewed_at && (
              <> &middot; Reviewed: {new Date(application.reviewed_at).toLocaleDateString()}</>
            )}
          </p>
        </div>

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
            <Button size="sm" variant="destructive" onClick={onReject}>
              <UserX className="mr-1 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
