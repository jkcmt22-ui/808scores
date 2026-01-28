/**
 * Performance timing utilities for monitoring admin operations
 * Helps identify bottlenecks and slow queries
 */

interface PerfTiming {
  operation: string
  duration: number
  timestamp: number
}

class PerfMonitor {
  private timings: PerfTiming[] = []
  private maxTimings = 100 // Keep last 100 timings
  private enabled = typeof window !== 'undefined' && process.env.NODE_ENV === 'development'

  /**
   * Start a performance timer
   * Returns a function to end the timer
   */
  start(operation: string): () => void {
    if (!this.enabled) return () => {}

    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      this.record(operation, duration)
    }
  }

  /**
   * Record a timing manually
   */
  private record(operation: string, duration: number): void {
    this.timings.push({
      operation,
      duration,
      timestamp: Date.now(),
    })

    // Keep only last N timings
    if (this.timings.length > this.maxTimings) {
      this.timings.shift()
    }

    // Log slow operations (> 1 second)
    if (duration > 1000) {
      console.warn(`⚠️  Slow operation: ${operation} took ${duration.toFixed(0)}ms`)
    } else if (duration > 500) {
      console.log(`🐢 ${operation} took ${duration.toFixed(0)}ms`)
    }
  }

  /**
   * Get all recorded timings
   */
  getTimings(): PerfTiming[] {
    return [...this.timings]
  }

  /**
   * Get average duration for an operation
   */
  getAverage(operation: string): number | null {
    const filtered = this.timings.filter(t => t.operation === operation)
    if (filtered.length === 0) return null

    const sum = filtered.reduce((acc, t) => acc + t.duration, 0)
    return sum / filtered.length
  }

  /**
   * Get slowest operations
   */
  getSlowest(count = 10): PerfTiming[] {
    return [...this.timings]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, count)
  }

  /**
   * Clear all timings
   */
  clear(): void {
    this.timings = []
  }

  /**
   * Log summary to console
   */
  logSummary(): void {
    if (!this.enabled || this.timings.length === 0) return

    console.group('📊 Performance Summary')

    // Group by operation
    const byOperation = this.timings.reduce((acc, t) => {
      if (!acc[t.operation]) {
        acc[t.operation] = []
      }
      acc[t.operation].push(t.duration)
      return acc
    }, {} as Record<string, number[]>)

    // Calculate stats
    Object.entries(byOperation).forEach(([operation, durations]) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length
      const min = Math.min(...durations)
      const max = Math.max(...durations)

      console.log(
        `${operation}: avg ${avg.toFixed(0)}ms | min ${min.toFixed(0)}ms | max ${max.toFixed(0)}ms (${durations.length} calls)`
      )
    })

    console.groupEnd()
  }
}

// Singleton instance
export const perf = new PerfMonitor()

// Expose to window for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__perf = perf
}
