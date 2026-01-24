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
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

  // If game is live, it's not overdue
  if (status === 'in_progress') {
    return false
  }

  // If game is canceled or postponed, it's not overdue
  if (status === 'canceled' || status === 'postponed') {
    return false
  }

  const gameDate = new Date(scheduledAt)
  const now = new Date()

  // Calculate 5AM HST the day after the game
  // Hawaii is UTC-10 (no DST)
  const nextDay5amHST = new Date(gameDate)
  nextDay5amHST.setDate(nextDay5amHST.getDate() + 1)
  // Set to 5AM HST = 15:00 UTC (5AM + 10 hours)
  nextDay5amHST.setUTCHours(15, 0, 0, 0)

  // If we're past the deadline and game is still scheduled or not verified
  if (now > nextDay5amHST) {
    // Game is scheduled but time has passed - score was never submitted
    if (status === 'scheduled') {
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
  const deadline = new Date(gameDate)
  deadline.setDate(deadline.getDate() + 1)
  deadline.setUTCHours(15, 0, 0, 0) // 5AM HST = 15:00 UTC
  return deadline
}
