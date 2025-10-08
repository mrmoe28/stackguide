import { test, expect } from '@playwright/test'

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'

test.describe('Pre-Launch Feature Tests', () => {
  test.describe('1. Landing Page', () => {
    test('should display all landing page elements', async ({ page }) => {
      await page.goto(BASE_URL)

      // Check hero section
      await expect(page.getByText('Build Your Perfect')).toBeVisible()
      await expect(page.getByText('Tech Stack')).toBeVisible()

      // Check CTA buttons
      await expect(page.getByRole('link', { name: /start building free/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /view on github/i })).toBeVisible()

      // Check navigation
      await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible()

      // Check feature cards
      await expect(page.getByText('AI-Powered Suggestions')).toBeVisible()
      await expect(page.getByText('Ready-to-Use Prompts')).toBeVisible()
      await expect(page.getByText('Best Practices Built-In')).toBeVisible()
    })

    test('should have animated background', async ({ page }) => {
      await page.goto(BASE_URL)

      // Check for background blobs
      const blobs = page.locator('.animate-blob')
      await expect(blobs).toHaveCount(3)
    })

    test('should navigate to sign up page', async ({ page }) => {
      await page.goto(BASE_URL)

      await page.getByRole('link', { name: /get started/i }).first().click()
      await expect(page).toHaveURL(/.*\/auth\/signup/)
    })

    test('should navigate to sign in page', async ({ page }) => {
      await page.goto(BASE_URL)

      await page.getByRole('link', { name: 'Sign In' }).click()
      await expect(page).toHaveURL(/.*\/auth\/signin/)
    })
  })

  test.describe('2. Authentication Flow', () => {
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPass123!'
    const testName = 'Test User'

    test('should sign up new user successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signup`)

      // Fill signup form
      await page.getByLabel(/full name/i).fill(testName)
      await page.getByLabel(/email/i).fill(testEmail)
      await page.getByLabel(/^password/i).fill(testPassword)

      // Submit
      await page.getByRole('button', { name: /sign up/i }).click()

      // Should redirect to signin or dashboard
      await page.waitForURL(/\/(dashboard|auth\/signin)/, { timeout: 10000 })
    })

    test('should show error with invalid email', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signup`)

      await page.getByLabel(/full name/i).fill('Test User')
      await page.getByLabel(/email/i).fill('invalid-email')
      await page.getByLabel(/^password/i).fill('TestPass123!')

      await page.getByRole('button', { name: /sign up/i }).click()

      // Should show validation error
      await expect(page.getByText(/invalid email/i)).toBeVisible({ timeout: 5000 })
    })

    test('should show error with weak password', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signup`)

      await page.getByLabel(/full name/i).fill('Test User')
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/^password/i).fill('weak')

      await page.getByRole('button', { name: /sign up/i }).click()

      // Should show validation error
      await expect(page.getByText(/password must/i)).toBeVisible({ timeout: 5000 })
    })

    test('should sign in existing user', async ({ page, context }) => {
      // First create a user (using API directly to avoid test dependency)
      // In production, you'd want to use a test database with seed data

      await page.goto(`${BASE_URL}/auth/signin`)

      await page.getByLabel(/email/i).fill(testEmail)
      await page.getByLabel(/password/i).fill(testPassword)

      await page.getByRole('button', { name: /sign in/i }).click()

      // Should redirect to dashboard
      await page.waitForURL(/.*\/dashboard/, { timeout: 10000 })
    })

    test('should show error with wrong password', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/signin`)

      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('WrongPassword123!')

      await page.getByRole('button', { name: /sign in/i }).click()

      // Should show error
      await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('3. Dashboard - Authenticated', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in before each dashboard test
      await page.goto(`${BASE_URL}/auth/signin`)
      // Use a test account that exists
      await page.getByLabel(/email/i).fill('ekosolarize@gmail.com')
      await page.getByLabel(/password/i).fill('your-test-password')
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL(/.*\/dashboard/)
    })

    test('should display dashboard layout', async ({ page }) => {
      // Check header
      await expect(page.getByText('StackGuideR')).toBeVisible()
      await expect(page.getByText(/AI-Powered Tech Stack Advisor/i)).toBeVisible()

      // Check sidebar
      await expect(page.getByText('Recent Projects')).toBeVisible()
      await expect(page.getByRole('button', { name: /new chat/i })).toBeVisible()

      // Check main chat area
      await expect(page.getByPlaceholder(/describe your project/i)).toBeVisible()

      // Check tech stack panel
      await expect(page.getByText('Tech Stack')).toBeVisible()
    })

    test('should show settings menu', async ({ page }) => {
      const settingsButton = page.locator('[data-testid="settings-button"]').or(
        page.getByRole('button').filter({ has: page.locator('svg') })
      )

      await settingsButton.first().click()

      // Check menu items
      await expect(page.getByText(/profile settings/i)).toBeVisible()
      await expect(page.getByText(/dark mode/i)).toBeVisible()
      await expect(page.getByText(/log out/i)).toBeVisible()
    })

    test('should send chat message and get response', async ({ page }) => {
      const testMessage = 'I want to build a simple todo app'

      await page.getByPlaceholder(/describe your project/i).fill(testMessage)
      await page.getByRole('button', { name: /send/i }).or(
        page.locator('button[type="submit"]')
      ).click()

      // Wait for response
      await expect(page.getByText(/loading/i).or(
        page.locator('[class*="animate-spin"]')
      )).toBeVisible({ timeout: 2000 })

      // Check for recommendations in sidebar
      await expect(page.getByText(/recommendation/i)).toBeVisible({ timeout: 30000 })
    })

    test('should navigate to settings page', async ({ page }) => {
      // Open settings menu
      const settingsButton = page.locator('[data-testid="settings-button"]').or(
        page.getByRole('button').filter({ has: page.locator('svg') })
      ).first()

      await settingsButton.click()
      await page.getByText(/profile settings/i).click()

      await page.waitForURL(/.*\/settings/)
      await expect(page.getByText('Profile Settings')).toBeVisible()
    })
  })

  test.describe('4. Profile Settings Page', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in and navigate to settings
      await page.goto(`${BASE_URL}/auth/signin`)
      await page.getByLabel(/email/i).fill('ekosolarize@gmail.com')
      await page.getByLabel(/password/i).fill('your-test-password')
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL(/.*\/dashboard/)
      await page.goto(`${BASE_URL}/settings`)
    })

    test('should display settings form', async ({ page }) => {
      await expect(page.getByLabel(/full name/i)).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/bio/i)).toBeVisible()
      await expect(page.getByLabel(/company/i)).toBeVisible()
      await expect(page.getByLabel(/location/i)).toBeVisible()
    })

    test('should have save button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible()
    })

    test('should have account actions', async ({ page }) => {
      await expect(page.getByRole('button', { name: /change password/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /delete account/i })).toBeVisible()
    })

    test('should navigate back to dashboard', async ({ page }) => {
      await page.getByRole('button', { name: /arrow/i }).or(
        page.locator('button').first()
      ).click()

      await page.waitForURL(/.*\/dashboard/)
    })
  })

  test.describe('5. Protected Routes', () => {
    test('should redirect to signin when not authenticated', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`)

      // Should redirect to signin
      await page.waitForURL(/.*\/auth\/signin/)
    })

    test('should redirect to signin for settings when not authenticated', async ({ page }) => {
      await page.goto(`${BASE_URL}/settings`)

      // Should redirect to signin
      await page.waitForURL(/.*\/auth\/signin/)
    })

    test('should allow access to landing page without auth', async ({ page }) => {
      await page.goto(`${BASE_URL}/landing`)

      // Should stay on landing page
      await expect(page).toHaveURL(/.*\/landing/)
      await expect(page.getByText('Build Your Perfect')).toBeVisible()
    })
  })

  test.describe('6. Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(BASE_URL)

      // Check mobile layout
      await expect(page.getByText('StackGuideR')).toBeVisible()
      await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
    })

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(BASE_URL)

      await expect(page.getByText('Build Your Perfect')).toBeVisible()
    })

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto(BASE_URL)

      await expect(page.getByText('Build Your Perfect')).toBeVisible()
    })
  })

  test.describe('7. Accessibility', () => {
    test('should have no critical accessibility violations', async ({ page }) => {
      await page.goto(BASE_URL)

      // Basic accessibility checks
      // Check for alt text on images
      const images = page.locator('img')
      const count = await images.count()

      for (let i = 0; i < count; i++) {
        const img = images.nth(i)
        const alt = await img.getAttribute('alt')
        expect(alt).toBeTruthy()
      }

      // Check for form labels
      await page.goto(`${BASE_URL}/auth/signin`)
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
    })

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto(BASE_URL)

      // Tab through interactive elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Check that focus is visible (basic check)
      const focused = await page.evaluate(() => document.activeElement?.tagName)
      expect(['A', 'BUTTON', 'INPUT']).toContain(focused)
    })
  })

  test.describe('8. Performance', () => {
    test('should load landing page quickly', async ({ page }) => {
      const startTime = Date.now()
      await page.goto(BASE_URL)
      const loadTime = Date.now() - startTime

      // Should load in less than 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })

    test('should load dashboard quickly after auth', async ({ page }) => {
      // Sign in first
      await page.goto(`${BASE_URL}/auth/signin`)
      await page.getByLabel(/email/i).fill('ekosolarize@gmail.com')
      await page.getByLabel(/password/i).fill('your-test-password')
      await page.getByRole('button', { name: /sign in/i }).click()

      const startTime = Date.now()
      await page.waitForURL(/.*\/dashboard/)
      const loadTime = Date.now() - startTime

      // Should load in less than 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })
  })
})
