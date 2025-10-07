import { test, expect } from '@playwright/test'
import {
  setupConsoleListener,
  setupNetworkListener,
  assertNoConsoleErrors,
  assertNoNetworkFailures,
  captureScreenshot,
  signIn,
} from './helpers'

test.describe('Dashboard - Smoke Tests', () => {
  test('page loads without errors', async ({ page }) => {
    const console = setupConsoleListener(page)
    const network = setupNetworkListener(page)

    // Attempt to navigate - may redirect to auth
    await page.goto('/dashboard')

    // If redirected to signin, login first
    if (page.url().includes('/auth/signin')) {
      await signIn(page)
    }

    // Capture screenshot of loaded page
    await captureScreenshot(page, 'smoke-page-loaded')

    // Assert page loaded successfully
    await expect(page).toHaveURL(/\/dashboard/)

    // Check for critical elements
    await expect(page.locator('h1:has-text("StackGuideR")')).toBeVisible()

    // Allow specific known errors (if any)
    const allowedErrors = [
      /Download the React DevTools/i,
      /Failed to load resource/i, // Known issue with some dev tools
    ]

    assertNoConsoleErrors(console.errors, allowedErrors)

    // Check for network failures (excluding known failing endpoints)
    const allowedFailingUrls = [
      '/api/recommendations/save', // May not be implemented yet
    ]

    assertNoNetworkFailures(network.failures, allowedFailingUrls)
  })

  test('critical UI elements are present', async ({ page }) => {
    await page.goto('/dashboard')

    if (page.url().includes('/auth/signin')) {
      await signIn(page)
    }

    // Header elements
    await expect(page.locator('h1:has-text("StackGuideR")')).toBeVisible()
    await expect(page.locator('button:has-text("Sign Out")')).toBeVisible()

    // Chat interface elements
    await expect(
      page.locator('input[placeholder*="Describe"]')
    ).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Recommendations panel
    await expect(
      page.locator('h2:has-text("Recommended Stack")')
    ).toBeVisible()

    await captureScreenshot(page, 'smoke-ui-elements')
  })

  test('page is responsive to viewport changes', async ({ page }) => {
    await page.goto('/dashboard')

    if (page.url().includes('/auth/signin')) {
      await signIn(page)
    }

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })
    await captureScreenshot(page, 'smoke-desktop-view')

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await captureScreenshot(page, 'smoke-tablet-view')

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await captureScreenshot(page, 'smoke-mobile-view')

    // Verify main elements still visible on mobile
    await expect(page.locator('h1:has-text("StackGuideR")')).toBeVisible()
  })

  test('no 4xx/5xx responses during page load', async ({ page }) => {
    const network = setupNetworkListener(page)

    await page.goto('/dashboard')

    if (page.url().includes('/auth/signin')) {
      await signIn(page)
    }

    // Wait for network to settle
    await page.waitForLoadState('networkidle')

    // Filter out expected failures
    const criticalFailures = network.failures.filter(
      (failure) =>
        !failure.includes('/api/recommendations/save') &&
        !failure.includes('chrome-extension')
    )

    expect(
      criticalFailures,
      `Critical network failures detected: ${criticalFailures.join(', ')}`
    ).toHaveLength(0)
  })

  test('authentication redirect works correctly', async ({ page, context }) => {
    // Clear cookies to simulate logged-out state
    await context.clearCookies()

    await page.goto('/dashboard')

    // Should redirect to signin
    await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 10000 })

    await captureScreenshot(page, 'smoke-auth-redirect')
  })
})
