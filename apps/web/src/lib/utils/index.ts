export { cn } from './cn'

export function formatGameTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Pacific/Honolulu',
  })
}

export function formatGameDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'Pacific/Honolulu',
  })
}

export function formatFullDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Pacific/Honolulu',
  })
}

export function isToday(date: string | Date): boolean {
  const d = new Date(date)
  const today = new Date()
  // Compare dates in Hawaii timezone
  const dateStr = d.toLocaleDateString('en-US', { timeZone: 'Pacific/Honolulu' })
  const todayStr = today.toLocaleDateString('en-US', { timeZone: 'Pacific/Honolulu' })
  return dateStr === todayStr
}

export function isGameLive(status: string): boolean {
  return status === 'in_progress'
}

export function isGameFinal(status: string): boolean {
  return status === 'final'
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'Scheduled'
    case 'in_progress':
      return 'Live'
    case 'final':
      return 'Final'
    case 'postponed':
      return 'Postponed'
    case 'canceled':
      return 'Canceled'
    default:
      return status
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'in_progress':
      return 'text-red-500'
    case 'final':
      return 'text-gray-500'
    case 'postponed':
    case 'canceled':
      return 'text-yellow-500'
    default:
      return 'text-gray-400'
  }
}

export function getTierLabel(tier: string): string {
  switch (tier) {
    case 'new':
      return 'New'
    case 'standard':
      return 'Standard'
    case 'verified':
      return 'Verified'
    case 'elite':
      return 'Elite'
    case 'trusted':
      return 'Trusted Reporter'
    default:
      return tier
  }
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case 'trusted':
      return 'text-purple-500 bg-purple-500/10'
    case 'elite':
      return 'text-yellow-500 bg-yellow-500/10'
    case 'verified':
      return 'text-blue-500 bg-blue-500/10'
    case 'standard':
      return 'text-green-500 bg-green-500/10'
    default:
      return 'text-gray-500 bg-gray-500/10'
  }
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) {
    return 'just now'
  } else if (diffMin < 60) {
    return `${diffMin}m ago`
  } else if (diffHour < 24) {
    return `${diffHour}h ago`
  } else if (diffDay < 7) {
    return `${diffDay}d ago`
  } else {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Pacific/Honolulu' })
  }
}

/**
 * Check if a game should show "Score Not Submitted" warning
 * Rules:
 * - Game scheduled time + 1 day at 5AM HST has passed
 * - Game is still marked as 'scheduled' OR has no verified score
 * - This indicates the game likely happened but no one submitted the score
 */
export function isScoreOverdue(
  scheduledAt: string | Date,
  status: string,
  isVerified: boolean
): boolean {
  // If game is final and verified, it's not overdue
  if (status === 'final' && isVerified) {
    return false
  }

  // If game is canceled or postponed, it's not overdue
  if (status === 'canceled' || status === 'postponed') {
    return false
  }

  const gameDate = new Date(scheduledAt)
  const now = new Date()

  // Get the game date in Hawaii timezone (YYYY-MM-DD format)
  const gameDateHST = gameDate.toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu' })

  // Parse to get year, month, day
  const [year, month, day] = gameDateHST.split('-').map(Number)

  // Calculate 5AM HST the day after the game
  // 5AM HST = 15:00 UTC (HST is UTC-10)
  const deadlineUTC = new Date(Date.UTC(year, month - 1, day + 1, 15, 0, 0, 0))

  // If we're past the deadline
  if (now > deadlineUTC) {
    // Game is scheduled but time has passed - score was never submitted
    if (status === 'scheduled') {
      return true
    }
    // Game is still "in_progress" way past game time - clearly needs score
    if (status === 'in_progress') {
      return true
    }
    // Game is final but not verified - needs verification
    if (status === 'final' && !isVerified) {
      return true
    }
  }

  return false
}

/**
 * Get the deadline for score submission (5AM HST next day)
 */
export function getScoreDeadline(scheduledAt: string | Date): Date {
  const gameDate = new Date(scheduledAt)

  // Get the game date in Hawaii timezone (YYYY-MM-DD format)
  const gameDateHST = gameDate.toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu' })

  // Parse to get year, month, day
  const [year, month, day] = gameDateHST.split('-').map(Number)

  // 5AM HST the next day = 15:00 UTC (HST is UTC-10)
  return new Date(Date.UTC(year, month - 1, day + 1, 15, 0, 0, 0))
}

/**
 * Validate and sanitize a redirect URL to prevent open redirect attacks.
 * Only allows relative paths that start with "/" and don't contain "//".
 * Returns "/" if the URL is invalid or potentially malicious.
 */
/**
 * Hawaii timezone utilities
 * Hawaii is always UTC-10 (no daylight saving time)
 */
const HAWAII_OFFSET_HOURS = -10
const HAWAII_OFFSET_MS = HAWAII_OFFSET_HOURS * 60 * 60 * 1000

/**
 * Convert a datetime-local input value to a UTC ISO string, treating the input as Hawaii time.
 * datetime-local gives us "2024-02-02T17:30" which we interpret as Hawaii time.
 * @param datetimeLocal - Value from datetime-local input (e.g., "2024-02-02T17:30")
 * @returns ISO string in UTC
 */
export function hawaiiDatetimeToUTC(datetimeLocal: string): string {
  if (!datetimeLocal) return ''

  // Parse the datetime-local value as Hawaii time
  // Add the Hawaii offset to get UTC
  // datetime-local gives "2024-02-02T17:30", we append Hawaii offset
  const hawaiiDatetime = `${datetimeLocal}:00.000${HAWAII_OFFSET_HOURS >= 0 ? '+' : ''}${String(HAWAII_OFFSET_HOURS).padStart(3, '0').replace('-', '-0')}:00`

  // Use a simpler approach: parse without timezone, then adjust
  const [datePart, timePart] = datetimeLocal.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)

  // Create a date in UTC that represents this Hawaii time
  // If it's 5:30 PM Hawaii (UTC-10), that's 3:30 AM next day UTC
  const utcHours = hours - HAWAII_OFFSET_HOURS // Subtract negative offset = add 10

  const utcDate = new Date(Date.UTC(year, month - 1, day, utcHours, minutes, 0, 0))
  return utcDate.toISOString()
}

/**
 * Convert a UTC date to a datetime-local value in Hawaii time.
 * @param utcDate - Date object or ISO string in UTC
 * @returns Value suitable for datetime-local input (e.g., "2024-02-02T17:30")
 */
export function utcToHawaiiDatetime(utcDate: string | Date): string {
  const d = new Date(utcDate)

  // Get Hawaii time components
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Pacific/Honolulu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }

  const formatter = new Intl.DateTimeFormat('en-CA', options)
  const parts = formatter.formatToParts(d)

  const getPart = (type: string) => parts.find(p => p.type === type)?.value || ''

  const year = getPart('year')
  const month = getPart('month')
  const day = getPart('day')
  const hour = getPart('hour')
  const minute = getPart('minute')

  return `${year}-${month}-${day}T${hour}:${minute}`
}

/**
 * Get today's date in Hawaii timezone as YYYY-MM-DD
 */
export function getTodayHawaii(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu' })
}

/**
 * Get the start of a day in Hawaii time as a UTC Date
 */
export function getHawaiiDayStartUTC(date: Date): Date {
  const hawaiiDate = date.toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu' })
  const [year, month, day] = hawaiiDate.split('-').map(Number)
  // Midnight Hawaii = 10:00 UTC same day
  return new Date(Date.UTC(year, month - 1, day, 10, 0, 0, 0))
}

/**
 * Get the end of a day in Hawaii time as a UTC Date
 */
export function getHawaiiDayEndUTC(date: Date): Date {
  const hawaiiDate = date.toLocaleDateString('en-CA', { timeZone: 'Pacific/Honolulu' })
  const [year, month, day] = hawaiiDate.split('-').map(Number)
  // 11:59:59 PM Hawaii = 09:59:59 UTC next day
  return new Date(Date.UTC(year, month - 1, day + 1, 9, 59, 59, 999))
}

export function getSafeRedirectUrl(url: string | null, fallback: string = '/'): string {
  if (!url) {
    return fallback
  }

  // Trim whitespace
  const trimmed = url.trim()

  // Must start with a single forward slash (relative path)
  if (!trimmed.startsWith('/')) {
    return fallback
  }

  // Block protocol-relative URLs (//evil.com)
  if (trimmed.startsWith('//')) {
    return fallback
  }

  // Block URLs with encoded slashes or other tricks
  // Decode and check again
  try {
    const decoded = decodeURIComponent(trimmed)
    if (decoded.startsWith('//') || decoded.includes('://')) {
      return fallback
    }
  } catch {
    // If decoding fails, the URL is malformed
    return fallback
  }

  // Block javascript: URLs
  if (trimmed.toLowerCase().includes('javascript:')) {
    return fallback
  }

  // Block data: URLs
  if (trimmed.toLowerCase().includes('data:')) {
    return fallback
  }

  return trimmed
}
