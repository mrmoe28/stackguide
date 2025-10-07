import { Page, Locator, expect } from '@playwright/test'
import type { AuditConfig } from '../../config'

/**
 * Test Helpers for Dashboard Auditing
 * Reusable utilities for E2E testing
 */

export interface TestCredentials {
  email: string
  password: string
}

/**
 * Authentication helper - signs in a user
 */
export async function signIn(
  page: Page,
  credentials: TestCredentials = {
    email: 'test@example.com',
    password: 'Test123456!',
  }
) {
  await page.goto('/auth/signin')
  await page.fill('input[type="email"]', credentials.email)
  await page.fill('input[type="password"]', credentials.password)
  await page.click('button[type="submit"]')
  // Wait for navigation to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 })
}

/**
 * Get all interactive elements on the page
 */
export async function getInteractiveElements(page: Page): Promise<{
  buttons: Locator[]
  links: Locator[]
  inputs: Locator[]
  textareas: Locator[]
}> {
  const buttons = await page.locator('button:visible').all()
  const links = await page.locator('a:visible').all()
  const inputs = await page.locator('input:visible').all()
  const textareas = await page.locator('textarea:visible').all()

  return { buttons, links, inputs, textareas }
}

/**
 * Safe click - waits for element and clicks with error handling
 */
export async function safeClick(locator: Locator, name: string = 'element') {
  try {
    await locator.waitFor({ state: 'visible', timeout: 5000 })
    await locator.click({ timeout: 5000 })
    return { success: true, error: null }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Capture screenshot with timestamp
 */
export async function captureScreenshot(
  page: Page,
  name: string,
  basePath: string = './audits/dashboard/screenshots'
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${basePath}/${name}-${timestamp}.png`
  await page.screenshot({ path: filename, fullPage: true })
  return filename
}

/**
 * Get console errors from page
 */
export function setupConsoleListener(page: Page): {
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    } else if (msg.type() === 'warning') {
      warnings.push(msg.text())
    }
  })

  return { errors, warnings }
}

/**
 * Wait for network idle (no requests for specified time)
 */
export async function waitForNetworkIdle(
  page: Page,
  timeout: number = 2000
): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout })
}

/**
 * Check if element is visible and enabled
 */
export async function isInteractive(locator: Locator): Promise<boolean> {
  try {
    const isVisible = await locator.isVisible()
    const isEnabled = await locator.isEnabled()
    return isVisible && isEnabled
  } catch {
    return false
  }
}

/**
 * Get all network requests
 */
export function setupNetworkListener(page: Page): {
  requests: Request[]
  responses: Response[]
  failures: string[]
} {
  const requests: Request[] = []
  const responses: Response[] = []
  const failures: string[] = []

  page.on('request', (request) => {
    requests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postData(),
    } as Request)
  })

  page.on('response', (response) => {
    responses.push({
      url: response.url(),
      status: response.status(),
      headers: response.headers(),
    } as Response)

    if (response.status() >= 400) {
      failures.push(`${response.status()} ${response.url()}`)
    }
  })

  return { requests, responses, failures }
}

interface Request {
  url: string
  method: string
  headers: Record<string, string>
  postData?: string | null
}

interface Response {
  url: string
  status: number
  headers: Record<string, string>
}

/**
 * Fill form with safe error handling
 */
export async function safeFillForm(
  page: Page,
  fields: Array<{ selector: string; value: string }>
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = []

  for (const field of fields) {
    try {
      const locator = page.locator(field.selector)
      await locator.waitFor({ state: 'visible', timeout: 5000 })
      await locator.fill(field.value)
    } catch (error) {
      errors.push(
        `Failed to fill ${field.selector}: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  return { success: errors.length === 0, errors }
}

/**
 * Assert no console errors
 */
export async function assertNoConsoleErrors(
  errors: string[],
  allowedPatterns: RegExp[] = []
) {
  const filteredErrors = errors.filter(
    (error) => !allowedPatterns.some((pattern) => pattern.test(error))
  )
  expect(
    filteredErrors,
    `Found ${filteredErrors.length} console errors: ${filteredErrors.join(', ')}`
  ).toHaveLength(0)
}

/**
 * Assert no network failures
 */
export async function assertNoNetworkFailures(
  failures: string[],
  allowedUrls: string[] = []
) {
  const filteredFailures = failures.filter(
    (failure) => !allowedUrls.some((url) => failure.includes(url))
  )
  expect(
    filteredFailures,
    `Found ${filteredFailures.length} network failures: ${filteredFailures.join(', ')}`
  ).toHaveLength(0)
}

/**
 * Discover all buttons and their purposes
 */
export async function discoverButtons(page: Page): Promise<
  Array<{
    text: string
    selector: string
    visible: boolean
    enabled: boolean
  }>
> {
  const buttons = await page.locator('button').all()
  const discovered = []

  for (const button of buttons) {
    try {
      const text = await button.textContent()
      const visible = await button.isVisible()
      const enabled = await button.isEnabled()
      const selector = await button.evaluate((el) => {
        const id = el.id
        const classes = el.className
        if (id) return `#${id}`
        if (classes) return `button.${classes.split(' ').join('.')}`
        return 'button'
      })

      discovered.push({
        text: text?.trim() || '',
        selector,
        visible,
        enabled,
      })
    } catch {
      // Skip if element becomes stale
      continue
    }
  }

  return discovered
}

/**
 * Test chat flow - send message and wait for response
 */
export async function sendChatMessage(
  page: Page,
  message: string
): Promise<{
  success: boolean
  error?: string
  responseReceived: boolean
}> {
  try {
    // Find input and send button
    const input = page.locator('input[placeholder*="Describe"]')
    const sendButton = page.locator('button[type="submit"]')

    // Type message
    await input.fill(message)
    await expect(sendButton).toBeEnabled()

    // Click send
    await sendButton.click()

    // Wait for loading state
    await page.waitForSelector('.animate-spin', { state: 'visible', timeout: 5000 })

    // Wait for response (loading spinner disappears)
    await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 30000 })

    return { success: true, responseReceived: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      responseReceived: false,
    }
  }
}

/**
 * Check if recommendations panel has content
 */
export async function hasRecommendations(page: Page): Promise<boolean> {
  try {
    const emptyState = page.locator('text=Recommendations will appear here')
    const isVisible = await emptyState.isVisible()
    return !isVisible
  } catch {
    return false
  }
}

/**
 * Get all recommendation cards
 */
export async function getRecommendationCards(page: Page) {
  return await page
    .locator('div.space-y-3 > div')
    .filter({ has: page.locator('button:has-text("Add to Stack")') })
    .all()
}
