/**
 * Cloudflare Turnstile integration
 * https://developers.cloudflare.com/turnstile/
 */

// These should be in environment variables
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || ''
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export interface TurnstileVerifyResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
  action?: string
  cdata?: string
}

/**
 * Get the Turnstile site key for client-side widget
 */
export function getTurnstileSiteKey(): string {
  return TURNSTILE_SITE_KEY
}

/**
 * Verify a Turnstile token server-side
 */
export async function verifyTurnstileToken(
  token: string,
  ip?: string
): Promise<{ success: boolean; error?: string }> {
  if (!TURNSTILE_SECRET_KEY) {
    console.warn('Turnstile secret key not configured')
    // In development without key, allow through
    if (process.env.NODE_ENV === 'development') {
      return { success: true }
    }
    return { success: false, error: 'Turnstile not configured' }
  }

  try {
    const formData = new URLSearchParams()
    formData.append('secret', TURNSTILE_SECRET_KEY)
    formData.append('response', token)
    if (ip) {
      formData.append('remoteip', ip)
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const result: TurnstileVerifyResponse = await response.json()

    if (result.success) {
      return { success: true }
    } else {
      const errorCode = result['error-codes']?.[0] || 'unknown'
      return { success: false, error: `Verification failed: ${errorCode}` }
    }
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return { success: false, error: 'Verification service unavailable' }
  }
}

/**
 * Hash a token for storage (prevent replay attacks)
 */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Actions that can require Turnstile verification
 */
export type TurnstileAction =
  | 'signup'
  | 'login'
  | 'raffle_entry'
  | 'password_reset'
  | 'report_abuse'

/**
 * Check if an action should show Turnstile (client-side hint)
 * The actual decision is made server-side
 */
export function shouldShowTurnstile(
  action: TurnstileAction,
  userTrustScore?: number
): boolean {
  // These always require Turnstile
  if (action === 'signup' || action === 'password_reset') {
    return true
  }

  // Low trust users always see Turnstile
  if (userTrustScore !== undefined && userTrustScore < 50) {
    return true
  }

  return false
}
