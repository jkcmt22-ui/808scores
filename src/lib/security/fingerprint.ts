/**
 * Device fingerprinting for bot detection
 * Uses browser APIs to create a unique device identifier
 */

export interface DeviceInfo {
  fingerprint: string
  userAgent: string
  screenResolution: string
  timezone: string
  language: string
  platform: string
  colorDepth: number
  hardwareConcurrency: number
  deviceMemory?: number
  touchSupport: boolean
  webglVendor?: string
  webglRenderer?: string
  canvas?: string
}

/**
 * Generate a device fingerprint hash
 * This creates a unique identifier based on browser/device characteristics
 */
export async function generateFingerprint(): Promise<DeviceInfo> {
  const components: string[] = []

  // User Agent
  const userAgent = navigator.userAgent
  components.push(userAgent)

  // Screen info
  const screenResolution = `${screen.width}x${screen.height}x${screen.colorDepth}`
  components.push(screenResolution)

  // Timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  components.push(timezone)

  // Language
  const language = navigator.language
  components.push(language)

  // Platform
  const platform = navigator.platform
  components.push(platform)

  // Hardware
  const colorDepth = screen.colorDepth
  const hardwareConcurrency = navigator.hardwareConcurrency || 0
  components.push(`${colorDepth}:${hardwareConcurrency}`)

  // Device memory (if available)
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  if (deviceMemory) {
    components.push(`mem:${deviceMemory}`)
  }

  // Touch support
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  components.push(`touch:${touchSupport}`)

  // WebGL info (GPU fingerprint)
  let webglVendor: string | undefined
  let webglRenderer: string | undefined
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        components.push(`webgl:${webglVendor}:${webglRenderer}`)
      }
    }
  } catch {
    // WebGL not available
  }

  // Canvas fingerprint (how the browser renders specific shapes)
  let canvasFingerprint: string | undefined
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      canvas.width = 200
      canvas.height = 50
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(0, 0, 200, 50)
      ctx.fillStyle = '#069'
      ctx.fillText('808scores fingerprint', 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.fillText('808scores fingerprint', 4, 17)
      canvasFingerprint = canvas.toDataURL().slice(-50)
      components.push(`canvas:${canvasFingerprint}`)
    }
  } catch {
    // Canvas not available
  }

  // Generate hash
  const fingerprintString = components.join('|')
  const fingerprint = await hashString(fingerprintString)

  return {
    fingerprint,
    userAgent,
    screenResolution,
    timezone,
    language,
    platform,
    colorDepth,
    hardwareConcurrency,
    deviceMemory,
    touchSupport,
    webglVendor,
    webglRenderer,
    canvas: canvasFingerprint,
  }
}

/**
 * Hash a string using SHA-256
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Store fingerprint in localStorage for consistency
 */
export function getStoredFingerprint(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('device_fp')
}

/**
 * Store fingerprint
 */
export function storeFingerprint(fingerprint: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('device_fp', fingerprint)
}

/**
 * Get or generate fingerprint
 */
export async function getFingerprint(): Promise<DeviceInfo> {
  const stored = getStoredFingerprint()
  if (stored) {
    // Return minimal info with stored fingerprint
    return {
      fingerprint: stored,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      colorDepth: screen.colorDepth,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      touchSupport: 'ontouchstart' in window,
    }
  }

  const deviceInfo = await generateFingerprint()
  storeFingerprint(deviceInfo.fingerprint)
  return deviceInfo
}

/**
 * Detect common bot indicators
 */
export function detectBotIndicators(): string[] {
  const indicators: string[] = []

  // Check for headless browser
  if (navigator.webdriver) {
    indicators.push('webdriver')
  }

  // Check for PhantomJS
  if ((window as Window & { _phantom?: unknown })._phantom) {
    indicators.push('phantom')
  }

  // Check for Selenium
  if ((document as Document & { __selenium_unwrapped?: unknown }).__selenium_unwrapped) {
    indicators.push('selenium')
  }

  // Check for impossible screen dimensions
  if (screen.width === 0 || screen.height === 0) {
    indicators.push('zero_screen')
  }

  // Check for missing features that real browsers have
  if (!(window as Window & { chrome?: unknown }).chrome && /Chrome/.test(navigator.userAgent)) {
    indicators.push('fake_chrome')
  }

  // Check for suspicious plugins count
  if (navigator.plugins && navigator.plugins.length === 0 && !/Mobile|Android/.test(navigator.userAgent)) {
    indicators.push('no_plugins')
  }

  // Check for automation flags
  const automationFlags = [
    'callPhantom',
    '__nightmare',
    'domAutomation',
    'domAutomationController',
  ]
  for (const flag of automationFlags) {
    if (flag in window) {
      indicators.push(`automation_${flag}`)
    }
  }

  return indicators
}
