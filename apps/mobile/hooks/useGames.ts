import { useSupabase } from '../contexts/SupabaseContext'
import {
  useGames as useGamesBase,
  useLiveGames as useLiveGamesBase,
  useGame as useGameBase,
  type GameWithTeamsAndCount,
  type SportGender,
  type GameType,
} from '@808scores/shared'

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
  const { supabase } = useSupabase()
  return useGamesBase(supabase, options)
}

export function useLiveGames() {
  const { supabase } = useSupabase()
  return useLiveGamesBase(supabase)
}

export function useGame(gameId: string) {
  const { supabase } = useSupabase()
  return useGameBase(supabase, gameId)
}
