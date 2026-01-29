'use client'

import { useState, useMemo, useCallback } from 'react'
import { X, Plus, Search, AlertTriangle, Loader2 } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { School, Team } from '@/types/database'

interface TeamWithSchool extends Team {
  school: School
}

interface TeamAssignmentPanelProps {
  assignedTeams: TeamWithSchool[]
  availableTeams: TeamWithSchool[]
  onAssign: (teamId: string) => void
  onUnassign: (teamId: string) => void
  isLoading?: boolean
  league: string
  division: string
  region?: string | null
}

export function TeamAssignmentPanel({
  assignedTeams,
  availableTeams,
  onAssign,
  onUnassign,
  isLoading,
  league,
  division,
  region,
}: TeamAssignmentPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Filter available teams by search query
  const filteredAvailable = useMemo(() => {
    if (!searchQuery.trim()) return availableTeams
    const query = searchQuery.toLowerCase()
    return availableTeams.filter(team =>
      team.school.short_name.toLowerCase().includes(query) ||
      team.school.name.toLowerCase().includes(query)
    )
  }, [availableTeams, searchQuery])

  // Check for duplicate assignments (team already in another division of same league)
  const getDuplicateWarning = useCallback((team: TeamWithSchool): string | null => {
    if (team.league === league && team.division && team.division !== division) {
      return `Already in ${team.league} ${team.division}${team.region ? ` ${team.region}` : ''}`
    }
    return null
  }, [league, division])

  const handleAddTeam = (teamId: string) => {
    onAssign(teamId)
    setSearchQuery('')
    setIsDropdownOpen(false)
  }

  const locationText = region
    ? `${league} ${division} ${region}`
    : `${league} ${division}`

  return (
    <Card className="flex flex-col h-full">
      <div className="p-3 border-b-2 border-border bg-background-secondary flex-shrink-0">
        <h3 className="font-display font-bold text-neon-blue uppercase tracking-wider text-sm">
          Assigned Teams ({assignedTeams.length})
        </h3>
        <p className="text-xs text-foreground-muted mt-1">{locationText}</p>
      </div>

      {/* Assigned teams list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-neon-yellow" />
          </div>
        ) : assignedTeams.length === 0 ? (
          <div className="p-4 text-center text-foreground-muted text-sm">
            No teams assigned to this {region ? 'region' : 'division'} yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {assignedTeams.map(team => (
              <li
                key={team.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-background-tertiary group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-display font-bold text-foreground truncate">
                    {team.school.short_name}
                  </span>
                </div>
                <button
                  onClick={() => onUnassign(team.id)}
                  className="p-1 text-foreground-muted hover:text-neon-pink opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from division"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add team section */}
      <div className="p-3 border-t-2 border-border bg-background-secondary flex-shrink-0">
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                type="text"
                placeholder="Search teams to add..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsDropdownOpen(true)
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* Dropdown with available teams */}
          {isDropdownOpen && (searchQuery || availableTeams.length > 0) && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />

              <div className="absolute bottom-full left-0 right-0 mb-1 z-20 max-h-64 overflow-y-auto bg-background border-2 border-border shadow-lg">
                {filteredAvailable.length === 0 ? (
                  <div className="p-3 text-sm text-foreground-muted text-center">
                    {searchQuery ? 'No teams match your search' : 'No available teams'}
                  </div>
                ) : (
                  <ul>
                    {filteredAvailable.slice(0, 10).map(team => {
                      const warning = getDuplicateWarning(team)
                      return (
                        <li key={team.id}>
                          <button
                            onClick={() => handleAddTeam(team.id)}
                            className={cn(
                              'w-full text-left px-3 py-2 hover:bg-background-tertiary flex items-center justify-between gap-2',
                              warning && 'bg-neon-yellow/5'
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Plus className="h-4 w-4 text-neon-green flex-shrink-0" />
                              <span className="font-display font-bold truncate">
                                {team.school.short_name}
                              </span>
                              {team.league && (
                                <span className="text-xs text-foreground-muted">
                                  ({team.league}{team.division ? ` ${team.division}` : ''})
                                </span>
                              )}
                            </div>
                            {warning && (
                              <div className="flex items-center gap-1 text-neon-yellow flex-shrink-0">
                                <AlertTriangle className="h-3 w-3" />
                                <span className="text-xs">{warning}</span>
                              </div>
                            )}
                          </button>
                        </li>
                      )
                    })}
                    {filteredAvailable.length > 10 && (
                      <li className="px-3 py-2 text-xs text-foreground-muted text-center border-t border-border">
                        {filteredAvailable.length - 10} more teams match...
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
