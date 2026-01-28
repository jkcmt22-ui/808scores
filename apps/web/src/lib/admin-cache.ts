/**
 * Simple in-memory cache for admin panel data
 * Reduces redundant database queries for rarely-changing data
 */

import type { Sport, School } from '@/types/database'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

// Cache duration: 5 minutes
const CACHE_TTL = 5 * 60 * 1000

class AdminCache {
  private sports: CacheEntry<Sport[]> | null = null
  private schools: CacheEntry<School[]> | null = null

  private isExpired(entry: CacheEntry<unknown> | null): boolean {
    if (!entry) return true
    return Date.now() - entry.timestamp > CACHE_TTL
  }

  getSports(): Sport[] | null {
    if (this.isExpired(this.sports)) return null
    return this.sports!.data
  }

  setSports(data: Sport[]): void {
    this.sports = { data, timestamp: Date.now() }
  }

  getSchools(): School[] | null {
    if (this.isExpired(this.schools)) return null
    return this.schools!.data
  }

  setSchools(data: School[]): void {
    this.schools = { data, timestamp: Date.now() }
  }

  clear(): void {
    this.sports = null
    this.schools = null
  }

  clearSports(): void {
    this.sports = null
  }

  clearSchools(): void {
    this.schools = null
  }
}

// Singleton instance
export const adminCache = new AdminCache()
