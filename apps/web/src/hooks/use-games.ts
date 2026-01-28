'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  useGames as useGamesBase,
  useLiveGames as useLiveGamesBase,
  useGame as useGameBase,
  type GameWithTeamsAndCount,
} from '@808scores/shared'
import type { SportGender, GameType } from '@/types/database'

// Re-export the type
export type { GameWithTeamsAndCount }

interface UseGamesOptions {
  date?: Date
  sportCode?: string
  status?: string
  gender?: SportGender
  gameTypes?: GameType[]
  excludeGameTypes?: GameType[]
}

export function useGames(options: UseGamesOptions = {}) {
  const supabase = useMemo(() => createClient(), [])
  return useGamesBase(supabase as any, options)
}

export function useLiveGames() {
  const supabase = useMemo(() => createClient(), [])
  return useLiveGamesBase(supabase as any)
}

export function useGame(gameId: string) {
  const supabase = useMemo(() => createClient(), [])
  return useGameBase(supabase as any, gameId)
}
