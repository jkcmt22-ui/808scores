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
