/**
 * Audit Configuration
 *
 * This config can be reused for auditing any page in the application.
 * Simply update the TARGET_PAGE_PATH and ALT_TARGET_URL as needed.
 */

export interface AuditConfig {
  // The route path to test (e.g., '/dashboard', '/auth/signin')
  targetPagePath: string

  // Alternative full URL if testing deployed site instead of local
  altTargetUrl?: string

  // Base URL for local development
  localBaseUrl: string

  // Test user credentials (for authenticated pages)
  testUser?: {
    email: string
    password: string
  }

  // Timeout settings
  timeouts: {
    navigation: number
    action: number
    test: number
  }

  // Screenshot settings
  screenshots: {
    enabled: boolean
    onFailure: boolean
    fullPage: boolean
  }
}

export const defaultConfig: AuditConfig = {
  targetPagePath: '/dashboard',
  localBaseUrl: 'http://localhost:3002',
  timeouts: {
    navigation: 30000,
    action: 10000,
    test: 60000,
  },
  screenshots: {
    enabled: true,
    onFailure: true,
    fullPage: true,
  },
  testUser: {
    email: 'test@example.com',
    password: 'Test123456!',
  },
}

/**
 * Get the full URL to test
 */
export function getTestUrl(config: AuditConfig = defaultConfig): string {
  return config.altTargetUrl || `${config.localBaseUrl}${config.targetPagePath}`
}

/**
 * Get the slug for the current page (for directory naming)
 */
export function getPageSlug(config: AuditConfig = defaultConfig): string {
  return config.targetPagePath.replace(/^\//, '').replace(/\//g, '-') || 'home'
}
