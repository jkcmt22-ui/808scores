'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getFingerprint,
  detectBotIndicators,
  type DeviceInfo,
} from '@/lib/security'

interface SecurityState {
  deviceInfo: DeviceInfo | null
  botIndicators: string[]
  isInitialized: boolean
  trustScore: number | null
}

interface UseSecurityReturn extends SecurityState {
  recordDeviceAccess: () => Promise<void>
  checkRateLimit: (action: string) => Promise<{ allowed: boolean; requireCaptcha?: boolean }>
}

/**
 * Hook to manage security state and operations
 */
export function useSecurity(userId?: string): UseSecurityReturn {
  const [state, setState] = useState<SecurityState>({
    deviceInfo: null,
    botIndicators: [],
    isInitialized: false,
    trustScore: null,
  })

  const supabase = useMemo(() => createClient(), [])

  // Initialize device fingerprint and bot detection
  useEffect(() => {
    async function init() {
      try {
        // Generate device fingerprint
        const deviceInfo = await getFingerprint()

        // Detect bot indicators
        const botIndicators = detectBotIndicators()

        setState({
          deviceInfo,
          botIndicators,
          isInitialized: true,
          trustScore: null,
        })

        // If we detected bot indicators, log them
        if (botIndicators.length > 0 && supabase) {
          console.warn('Bot indicators detected:', botIndicators)

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('suspicious_activity_log')
            .insert({
              user_id: userId || null,
              device_fingerprint: deviceInfo.fingerprint,
              activity_type: 'bot_indicators',
              severity: botIndicators.length > 2 ? 'high' : 'medium',
              details: { indicators: botIndicators },
            })
        }
      } catch (error) {
        console.error('Security initialization error:', error)
        setState((prev) => ({ ...prev, isInitialized: true }))
      }
    }

    init()
  }, [userId, supabase])

  // Record device access in database
  const recordDeviceAccess = useCallback(async () => {
    if (!state.deviceInfo || !userId || !supabase) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).rpc('record_device', {
        p_user_id: userId,
        p_fingerprint_hash: state.deviceInfo.fingerprint,
        p_user_agent: state.deviceInfo.userAgent,
        p_screen_resolution: state.deviceInfo.screenResolution,
        p_timezone: state.deviceInfo.timezone,
        p_language: state.deviceInfo.language,
        p_platform: state.deviceInfo.platform,
        p_ip_address: null, // Server will get real IP
      })

      if (data) {
        setState((prev) => ({
          ...prev,
          trustScore: data.trust_score || prev.trustScore,
        }))
      }
    } catch (error) {
      console.error('Error recording device:', error)
    }
  }, [state.deviceInfo, userId, supabase])

  // Check rate limit for an action
  const checkRateLimit = useCallback(
    async (action: string): Promise<{ allowed: boolean; requireCaptcha?: boolean }> => {
      if (!supabase) return { allowed: true }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).rpc('check_rate_limit', {
          p_user_id: userId || null,
          p_ip_address: null,
          p_action_type: action,
        })

        if (error) {
          console.error('Rate limit check error:', error)
          return { allowed: true }
        }

        const result = data as { allowed: boolean; penalty_type?: string }
        return {
          allowed: result.allowed,
          requireCaptcha: result.penalty_type === 'captcha',
        }
      } catch (error) {
        console.error('Rate limit check exception:', error)
        return { allowed: true }
      }
    },
    [userId, supabase]
  )

  return {
    ...state,
    recordDeviceAccess,
    checkRateLimit,
  }
}

/**
 * Hook to track user's trust score
 */
export function useTrustScore(userId?: string) {
  const [trustScore, setTrustScore] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function fetchTrustScore() {
      if (!userId || !supabase) {
        setIsLoading(false)
        return
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from('users')
          .select('trust_score')
          .eq('id', userId)
          .single()

        if (data) {
          setTrustScore((data as { trust_score: number | null }).trust_score)
        }
      } catch (error) {
        console.error('Error fetching trust score:', error)
      }

      setIsLoading(false)
    }

    fetchTrustScore()
  }, [userId, supabase])

  return { trustScore, isLoading }
}
