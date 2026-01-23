'use client'

import { useState } from 'react'
import { Button, Card, Input } from '@/components/ui'
import { useSchools, useSports, useFavoriteTeams, useFavoriteSports } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { getSportEmoji } from '@/lib/sport-utils'
import { cn } from '@/lib/utils'
import {
  Search,
  Loader2,
  Check,
  ChevronRight,
  Star,
} from 'lucide-react'

interface FavoritesModalProps {
  userId: string
  onComplete: () => void
}

type Step = 'schools' | 'sports'

export function FavoritesModal({ userId, onComplete }: FavoritesModalProps) {
  const [step, setStep] = useState<Step>('schools')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Team selection state
  const [schoolSearch, setSchoolSearch] = useState('')
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set())

  // Sport selection state
  const [selectedSports, setSelectedSports] = useState<Set<string>>(new Set())

  // Hooks
  const { schools, isLoading: schoolsLoading } = useSchools()
  const { sports, isLoading: sportsLoading } = useSports()
  const { addFavorite: addTeamFavorite } = useFavoriteTeams(userId)
  const { addFavorite: addSportFavorite } = useFavoriteSports(userId)

  const supabase = createClient()

  // Filter schools by search
  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    school.short_name.toLowerCase().includes(schoolSearch.toLowerCase())
  )

  // Toggle school selection
  const toggleSchool = (schoolId: string) => {
    setSelectedSchools((prev) => {
      const next = new Set(prev)
      if (next.has(schoolId)) {
        next.delete(schoolId)
      } else {
        next.add(schoolId)
      }
      return next
    })
  }

  // Toggle sport selection
  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) => {
      const next = new Set(prev)
      if (next.has(sportId)) {
        next.delete(sportId)
      } else {
        next.add(sportId)
      }
      return next
    })
  }

  // Handle moving to next step
  const handleNextStep = () => {
    setStep('sports')
  }

  // Handle completing onboarding
  const handleComplete = async () => {
    setIsSubmitting(true)

    try {
      // Add team favorites
      const teamPromises = Array.from(selectedSchools).map((schoolId) =>
        addTeamFavorite(schoolId, true)
      )

      // Add sport favorites
      const sportPromises = Array.from(selectedSports).map((sportId) =>
        addSportFavorite(sportId, true)
      )

      await Promise.all([...teamPromises, ...sportPromises])

      // Mark onboarding as complete
      await supabase
        .from('users')
        .update({ onboarding_completed: true } as never)
        .eq('id', userId)

      onComplete()
    } catch (err) {
      console.error('Error saving favorites:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle skip
  const handleSkip = async () => {
    setIsSubmitting(true)
    try {
      await supabase
        .from('users')
        .update({ onboarding_completed: true } as never)
        .eq('id', userId)
      onComplete()
    } catch (err) {
      console.error('Error skipping onboarding:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <Card className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-hidden border-2 border-neon-blue/50">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          disabled={isSubmitting}
          className="absolute right-4 top-4 text-sm text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
        >
          Skip
        </button>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 px-6 pt-6">
          <div
            className={cn(
              'h-2 w-8 rounded-full transition-colors',
              step === 'schools' ? 'bg-neon-blue' : 'bg-neon-blue/30'
            )}
          />
          <div
            className={cn(
              'h-2 w-8 rounded-full transition-colors',
              step === 'sports' ? 'bg-neon-blue' : 'bg-neon-blue/30'
            )}
          />
        </div>

        <div className="p-6">
          {step === 'schools' ? (
            <>
              {/* Schools step */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neon-blue/10">
                  <Star className="h-8 w-8 text-neon-blue" />
                </div>
                <h2 className="mb-2 font-display text-xl font-bold text-foreground">
                  Follow Your Favorite Schools
                </h2>
                <p className="text-sm text-foreground-muted">
                  Get notified when your teams play. Select as many as you like.
                </p>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                <Input
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  placeholder="Search schools..."
                  className="pl-10"
                />
              </div>

              {/* Selected count */}
              {selectedSchools.size > 0 && (
                <p className="mb-2 text-sm text-neon-green">
                  {selectedSchools.size} school{selectedSchools.size !== 1 ? 's' : ''} selected
                </p>
              )}

              {/* Schools list */}
              <div className="max-h-[40vh] overflow-y-auto">
                {schoolsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-neon-blue" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredSchools.map((school) => (
                      <button
                        key={school.id}
                        onClick={() => toggleSchool(school.id)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors',
                          selectedSchools.has(school.id)
                            ? 'bg-neon-blue/10 border border-neon-blue/30'
                            : 'hover:bg-background-secondary'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-background-tertiary font-display text-xs font-bold text-foreground-muted">
                            {school.short_name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{school.name}</p>
                            <p className="text-xs text-foreground-muted">
                              {school.league} &bull; {school.island}
                            </p>
                          </div>
                        </div>
                        {selectedSchools.has(school.id) && (
                          <Check className="h-5 w-5 text-neon-blue" />
                        )}
                      </button>
                    ))}

                    {filteredSchools.length === 0 && (
                      <p className="py-4 text-center text-sm text-foreground-muted">
                        No schools found
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Continue button */}
              <div className="mt-6">
                <Button
                  onClick={handleNextStep}
                  className="w-full"
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Sports step */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neon-pink/10">
                  <span className="text-3xl">🏆</span>
                </div>
                <h2 className="mb-2 font-display text-xl font-bold text-foreground">
                  Select Your Favorite Sports
                </h2>
                <p className="text-sm text-foreground-muted">
                  See games for these sports at the top of your feed.
                </p>
              </div>

              {/* Selected count */}
              {selectedSports.size > 0 && (
                <p className="mb-4 text-sm text-neon-green">
                  {selectedSports.size} sport{selectedSports.size !== 1 ? 's' : ''} selected
                </p>
              )}

              {/* Sports grid */}
              <div className="max-h-[40vh] overflow-y-auto">
                {sportsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-neon-blue" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {sports.map((sport) => (
                      <button
                        key={sport.id}
                        onClick={() => toggleSport(sport.id)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors',
                          selectedSports.has(sport.id)
                            ? 'border-neon-pink bg-neon-pink/10'
                            : 'border-border hover:border-foreground-muted'
                        )}
                      >
                        <span className="text-2xl">{getSportEmoji(sport.code)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">
                            {sport.display_name || sport.name}
                          </p>
                          <p className="text-xs text-foreground-muted capitalize">
                            {sport.gender}
                          </p>
                        </div>
                        {selectedSports.has(sport.id) && (
                          <Check className="h-4 w-4 flex-shrink-0 text-neon-pink" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Done button */}
              <div className="mt-6">
                <Button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="w-full bg-neon-pink hover:bg-neon-pink/90"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Done'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
