'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  Loader2,
  Shield,
  ShieldCheck,
  UserCheck,
  Star,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  History,
  X,
  Ban,
} from 'lucide-react'
import { Button, Card, Badge, Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks'
import { useToast } from '@/components/ui/toast'

interface AdminUser {
  id: string
  display_name: string | null
  email: string | null
  phone: string | null
  is_super_admin: boolean
  is_admin: boolean
  is_trusted_reporter: boolean
  has_beta_access: boolean
  is_banned?: boolean
  tier: string
  reputation_score: number
  submission_count: number
  created_at: string
}

interface AuditLogEntry {
  id: string
  user_id: string | null
  action_type: string
  entity_type: string
  entity_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
  actor_name?: string | null
  actor_email?: string | null
}

const USERS_PER_PAGE = 20

export default function AdminUsersPage() {
  const supabase = useMemo(() => createClient(), [])
  const { profile } = useAuth()
  const isSuperAdmin = profile?.is_super_admin === true
  const { toast } = useToast()

  // State
  const [users, setUsers] = useState<AdminUser[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  // Audit log modal
  const [auditUser, setAuditUser] = useState<AdminUser | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [isLoadingAudit, setIsLoadingAudit] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1) // Reset to first page on new search
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!supabase) return

    setIsLoading(true)

    try {
      const offset = (page - 1) * USERS_PER_PAGE

      // Build query
      let query = supabase
        .from('users')
        .select('id, display_name, email, phone, is_super_admin, is_admin, is_trusted_reporter, has_beta_access, is_banned, tier, reputation_score, submission_count, created_at', { count: 'exact' })

      // Apply search filter
      if (debouncedSearch) {
        query = query.or(`display_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,phone.ilike.%${debouncedSearch}%`)
      }

      // Apply pagination and ordering
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + USERS_PER_PAGE - 1)

      if (error) throw error

      setUsers((data || []) as AdminUser[])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Error fetching users:', err)
      toast({ type: 'error', text: 'Failed to load users' })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, page, debouncedSearch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Fetch audit logs for a user
  const fetchAuditLogs = async (userId: string) => {
    if (!supabase) return

    setIsLoadingAudit(true)

    try {
      // Query audit log for changes to this user
      const { data, error } = await supabase
        .from('audit_log_with_user')
        .select('*')
        .eq('entity_type', 'users')
        .eq('entity_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setAuditLogs((data || []) as AuditLogEntry[])
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      setAuditLogs([])
    } finally {
      setIsLoadingAudit(false)
    }
  }

  // Open audit log modal
  const handleViewAuditLog = async (user: AdminUser) => {
    setAuditUser(user)
    await fetchAuditLogs(user.id)
  }

  // Toggle user role
  const handleToggleRole = async (
    userId: string,
    field: 'is_admin' | 'is_trusted_reporter' | 'has_beta_access' | 'is_super_admin' | 'is_banned',
    currentValue: boolean
  ) => {
    if (!supabase) return

    // Super admin toggle requires super admin
    if (field === 'is_super_admin' && !isSuperAdmin) {
      toast({ type: 'error', text: 'Only super admins can grant super admin access' })
      return
    }

    // Admin toggle requires super admin
    if (field === 'is_admin' && !isSuperAdmin) {
      toast({ type: 'error', text: 'Only super admins can grant admin access' })
      return
    }

    const newValue = !currentValue
    const fieldLabels: Record<string, string> = {
      is_admin: 'Admin',
      is_trusted_reporter: 'Trusted Reporter',
      has_beta_access: 'Beta Access',
      is_super_admin: 'Super Admin',
      is_banned: 'Ban',
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ [field]: newValue } as never)
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, [field]: newValue } : u
        )
      )

      toast({
        type: 'success',
        text: `${fieldLabels[field]} ${newValue ? 'granted' : 'revoked'} successfully`,
      })
    } catch (err: unknown) {
      console.error('Error updating user role:', err)
      const errorMessage = err instanceof Error ? err.message :
        (err && typeof err === 'object' && 'message' in err) ? String((err as {message: unknown}).message) :
        'Failed to update user role'
      toast({ type: 'error', text: errorMessage })
    }
  }

  const totalPages = Math.ceil(totalCount / USERS_PER_PAGE)

  // Format role change from audit log
  const formatRoleChange = (entry: AuditLogEntry) => {
    const changes: string[] = []
    const oldData = entry.old_data || {}
    const newData = entry.new_data || {}

    const roleFields = ['is_admin', 'is_super_admin', 'is_trusted_reporter', 'has_beta_access', 'is_banned']
    const labels: Record<string, string> = {
      is_admin: 'Admin',
      is_super_admin: 'Super Admin',
      is_trusted_reporter: 'Trusted Reporter',
      has_beta_access: 'Beta Access',
      is_banned: 'Ban',
    }

    for (const field of roleFields) {
      if (oldData[field] !== newData[field]) {
        const action = newData[field] ? 'granted' : 'revoked'
        changes.push(`${labels[field]} ${action}`)
      }
    }

    return changes.length > 0 ? changes.join(', ') : 'User updated'
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl neon-text-yellow uppercase tracking-wider">
            User Management
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Search and manage user roles and permissions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Role Legend */}
      <div className="mb-6 p-4 bg-background-secondary border-2 border-border rounded">
        <h3 className="font-display font-bold text-sm mb-2 text-foreground">Role Hierarchy</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-foreground-muted">
          <p>
            <span className="text-neon-pink font-bold">Super Admin:</span> Full access, can manage all users and admins
          </p>
          <p>
            <span className="text-neon-blue font-bold">Admin:</span> Backend access to manage content (games, schools, etc.)
          </p>
          <p>
            <span className="text-neon-green font-bold">Trusted Reporter:</span> Auto-verified scores, badge on comments
          </p>
          <p>
            <span className="text-neon-yellow font-bold">Beta Access:</span> Access to beta features before public release
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {debouncedSearch && (
          <p className="text-xs text-foreground-muted mt-2">
            Found {totalCount} user{totalCount !== 1 ? 's' : ''} matching &quot;{debouncedSearch}&quot;
          </p>
        )}
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
        </div>
      ) : users.length === 0 ? (
        <Card className="p-8 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-foreground-muted" />
          <h3 className="font-display font-bold text-foreground mb-2">No Users Found</h3>
          <p className="text-sm text-foreground-muted">
            {debouncedSearch
              ? 'Try a different search term'
              : 'No users in the system'}
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isSuperAdmin={isSuperAdmin}
                onToggleRole={handleToggleRole}
                onViewAuditLog={() => handleViewAuditLog(user)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 p-4 border-2 border-border bg-background-secondary">
              <div className="text-sm text-foreground-muted">
                Showing {(page - 1) * USERS_PER_PAGE + 1}-{Math.min(page * USERS_PER_PAGE, totalCount)} of {totalCount} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-display">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Audit Log Modal */}
      {auditUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden border-2 border-neon-blue/30">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="font-display font-bold text-lg text-neon-blue">
                  Audit Log
                </h2>
                <p className="text-sm text-foreground-muted">
                  Role changes for {auditUser.display_name || auditUser.email || 'User'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setAuditUser(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {isLoadingAudit ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-neon-blue" />
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8">
                  <History className="mx-auto mb-4 h-10 w-10 text-foreground-muted" />
                  <p className="text-foreground-muted text-sm">No role changes recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 bg-background-secondary border border-border rounded"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {formatRoleChange(entry)}
                          </p>
                          <p className="text-xs text-foreground-muted mt-1">
                            By: {entry.actor_name || entry.actor_email || 'System'}
                          </p>
                        </div>
                        <span className="text-xs text-foreground-subtle whitespace-nowrap">
                          {new Date(entry.created_at).toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// User Row Component
function UserRow({
  user,
  isSuperAdmin,
  onToggleRole,
  onViewAuditLog,
}: {
  user: AdminUser
  isSuperAdmin: boolean
  onToggleRole: (userId: string, field: 'is_admin' | 'is_trusted_reporter' | 'has_beta_access' | 'is_super_admin' | 'is_banned', currentValue: boolean) => Promise<void>
  onViewAuditLog: () => void
}) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleToggle = async (field: 'is_admin' | 'is_trusted_reporter' | 'has_beta_access' | 'is_super_admin' | 'is_banned') => {
    if (isLoading) return
    setIsLoading(field)
    try {
      await onToggleRole(user.id, field, !!user[field])
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <Card className="p-4 border-2 border-border">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-foreground truncate">
              {user.display_name || 'No Name'}
            </h3>
            {user.is_super_admin && (
              <Badge className="bg-neon-pink/20 text-neon-pink border-neon-pink/30">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Super
              </Badge>
            )}
            {user.is_admin && !user.is_super_admin && (
              <Badge className="bg-neon-blue/20 text-neon-blue border-neon-blue/30">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
            {user.is_trusted_reporter && (
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                <UserCheck className="h-3 w-3 mr-1" />
                Trusted
              </Badge>
            )}
            {user.has_beta_access && (
              <Badge className="bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30">
                <Star className="h-3 w-3 mr-1" />
                Beta
              </Badge>
            )}
            {user.is_banned && (
              <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                <Ban className="h-3 w-3 mr-1" />
                Banned
              </Badge>
            )}
          </div>
          <div className="text-sm text-foreground-muted space-y-0.5">
            {user.email && <p>{user.email}</p>}
            {user.phone && <p>{user.phone}</p>}
            <p className="text-xs text-foreground-subtle">
              Joined: {new Date(user.created_at).toLocaleDateString('en-US', { timeZone: 'Pacific/Honolulu' })}
              {' | '}Rep: {user.reputation_score}
              {' | '}Submissions: {user.submission_count}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Trusted Reporter Toggle - any admin */}
          <Button
            variant={user.is_trusted_reporter ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToggle('is_trusted_reporter')}
            disabled={isLoading !== null}
            className={cn(
              user.is_trusted_reporter && 'bg-neon-green hover:bg-neon-green/80'
            )}
          >
            {isLoading === 'is_trusted_reporter' ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <UserCheck className="h-3 w-3 mr-1" />
            )}
            Trusted
          </Button>

          {/* Beta Access Toggle - any admin */}
          <Button
            variant={user.has_beta_access ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToggle('has_beta_access')}
            disabled={isLoading !== null}
            className={cn(
              user.has_beta_access && 'bg-neon-yellow hover:bg-neon-yellow/80 text-black'
            )}
          >
            {isLoading === 'has_beta_access' ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Star className="h-3 w-3 mr-1" />
            )}
            Beta
          </Button>

          {/* Admin Toggle - super admin only */}
          {isSuperAdmin && (
            <Button
              variant={user.is_admin ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToggle('is_admin')}
              disabled={isLoading !== null || user.is_super_admin}
              className={cn(
                user.is_admin && 'bg-neon-blue hover:bg-neon-blue/80'
              )}
            >
              {isLoading === 'is_admin' ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Shield className="h-3 w-3 mr-1" />
              )}
              Admin
            </Button>
          )}

          {/* Super Admin Toggle - super admin only */}
          {isSuperAdmin && (
            <Button
              variant={user.is_super_admin ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToggle('is_super_admin')}
              disabled={isLoading !== null}
              className={cn(
                user.is_super_admin && 'bg-neon-pink hover:bg-neon-pink/80'
              )}
            >
              {isLoading === 'is_super_admin' ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <ShieldCheck className="h-3 w-3 mr-1" />
              )}
              Super
            </Button>
          )}

          {/* Ban Toggle - any admin */}
          <Button
            variant={user.is_banned ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => handleToggle('is_banned')}
            disabled={isLoading !== null || user.is_super_admin}
            title={user.is_banned ? 'Unban user' : 'Ban user'}
          >
            {isLoading === 'is_banned' ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Ban className="h-3 w-3 mr-1" />
            )}
            {user.is_banned ? 'Unban' : 'Ban'}
          </Button>

          {/* Audit Log Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAuditLog}
            title="View role change history"
          >
            <History className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
