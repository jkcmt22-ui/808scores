'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSports as useSportsBase, type SportCategory } from '@808scores/shared'

// Re-export the type
export type { SportCategory }

export function useSports() {
  const supabase = useMemo(() => createClient(), [])
  return useSportsBase(supabase as any)
}
