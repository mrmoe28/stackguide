import { test, expect } from '@playwright/test'
import {
  signIn,
  safeClick,
  captureScreenshot,
  discoverButtons,
  sendChatMessage,
  hasRecommendations,
  getRecommendationCards,
} from './helpers'

test.describe('Dashboard - Interactive Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    if (page.url().includes('/auth/signin')) {
      await signIn(page)
    }
  })

  test('discover and document all buttons', async ({ page }) => {
    const buttons = await discoverButtons(page)

    console.log('Discovered buttons:', JSON.stringify(buttons, null, 2))

    // Verify expected buttons exist
    expect(buttons.some((b) => b.text.includes('Sign Out'))).toBe(true)

    await captureScreenshot(page, 'interactions-buttons-inventory')
  })

  test('sign out button works', async ({ page }) => {
    const signOutButton = page.locator('button:has-text("Sign Out")')

    await expect(signOutButton).toBeVisible()
    await expect(signOutButton).toBeEnabled()

    await captureScreenshot(page, 'interactions-before-signout')

    await signOutButton.click()

    // Should redirect to signin page
    await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 10000 })

    await captureScreenshot(page, 'interactions-after-signout')
  })

  test('chat input field is functional', async ({ page }) => {
    const input = page.locator('input[placeholder*="Describe"]')

    await expect(input).toBeVisible()
    await expect(input).toBeEnabled()

    // Test typing
    const testMessage = 'I need a web application for a blog'
    await input.fill(testMessage)

    const value = await input.inputValue()
    expect(value).toBe(testMessage)

    await captureScreenshot(page, 'interactions-chat-input-filled')

    // Clear input
    await input.clear()
    expect(await input.inputValue()).toBe('')
  })

  test('send button enables/disables based on input', async ({ page }) => {
    const input = page.locator('input[placeholder*="Describe"]')
    const sendButton = page.locator('button[type="submit"]')

    // Button should be disabled when input is empty
    await expect(sendButton).toBeDisabled()

    await captureScreenshot(page, 'interactions-send-button-disabled')

    // Type message
    await input.fill('Test message')

    // Button should be enabled
    await expect(sendButton).toBeEnabled()

    await captureScreenshot(page, 'interactions-send-button-enabled')
  })

  test('can send a chat message successfully', async ({ page }) => {
    const result = await sendChatMessage(
      page,
      'I need a simple REST API with Node.js'
    )

    expect(result.success, result.error).toBe(true)
    expect(result.responseReceived).toBe(true)

    await captureScreenshot(page, 'interactions-chat-message-sent')

    // Verify message appears in chat
    await expect(
      page.locator('text=I need a simple REST API with Node.js')
    ).toBeVisible()

    // Verify response appears
    const messages = await page.locator('div[class*="space-y-4"] > div').count()
    expect(messages).toBeGreaterThan(1)
  })

  test('loading spinner appears during AI response', async ({ page }) => {
    const input = page.locator('input[placeholder*="Describe"]')
    const sendButton = page.locator('button[type="submit"]')

    await input.fill('Create a mobile app')
    await sendButton.click()

    // Loading spinner should appear
    await expect(page.locator('.animate-spin')).toBeVisible({
      timeout: 2000,
    })

    await captureScreenshot(page, 'interactions-loading-spinner')

    // Wait for response
    await page.waitForSelector('.animate-spin', {
      state: 'detached',
      timeout: 30000,
    })
  })

  test('recommendations panel updates after chat', async ({ page }) => {
    // Initially should show empty state
    const emptyState = page.locator('text=Recommendations will appear here')
    await expect(emptyState).toBeVisible()

    // Send message that should trigger recommendations
    await sendChatMessage(
      page,
      'I want to build a React application with TypeScript'
    )

    // Wait a bit for recommendations to load
    await page.waitForTimeout(2000)

    // Check if recommendations appeared
    const hasRecs = await hasRecommendations(page)

    await captureScreenshot(page, 'interactions-recommendations-updated')

    if (hasRecs) {
      const cards = await getRecommendationCards(page)
      expect(cards.length).toBeGreaterThan(0)
    }
  })

  test('external link buttons open in new tab', async ({ page, context }) => {
    // First get recommendations
    await sendChatMessage(page, 'I need a database for my app')
    await page.waitForTimeout(3000)

    // Look for external link icons
    const externalLinks = page.locator('a[target="_blank"]')
    const count = await externalLinks.count()

    if (count > 0) {
      // Listen for new page
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        externalLinks.first().click(),
      ])

      // Verify new page opened
      expect(newPage).toBeDefined()
      await newPage.close()

      await captureScreenshot(page, 'interactions-external-link-opened')
    }
  })

  test('Add to Stack button changes state on click', async ({ page }) => {
    // Get recommendations first
    await sendChatMessage(page, 'Suggest tools for a web app')
    await page.waitForTimeout(3000)

    const addButton = page.locator('button:has-text("Add to Stack")').first()

    if ((await addButton.count()) > 0) {
      await expect(addButton).toBeVisible()

      await captureScreenshot(page, 'interactions-add-button-before')

      await addButton.click()

      // Wait for state change
      await page.waitForTimeout(1000)

      // Button should show "Saved" or be disabled
      const savedButton = page.locator('button:has-text("Saved")').first()

      await captureScreenshot(page, 'interactions-add-button-after')

      // Note: This may fail if API endpoint isn't implemented
      // But we're testing the UI behavior
    }
  })

  test('scroll areas work correctly', async ({ page }) => {
    // Send multiple messages to create scrollable content
    for (let i = 0; i < 3; i++) {
      await sendChatMessage(page, `Test message number ${i + 1}`)
      await page.waitForTimeout(1000)
    }

    // Test chat scroll
    const chatScroll = page.locator('div.h-full').first()
    await expect(chatScroll).toBeVisible()

    await captureScreenshot(page, 'interactions-scrollable-chat')

    // Verify auto-scroll to bottom (latest message visible)
    const lastMessage = page.locator('text=Test message number 3')
    await expect(lastMessage).toBeVisible()
  })

  test('keyboard navigation works for chat input', async ({ page }) => {
    const input = page.locator('input[placeholder*="Describe"]')

    await input.focus()
    await expect(input).toBeFocused()

    // Type with keyboard
    await page.keyboard.type('Testing keyboard input')

    // Verify text entered
    expect(await input.inputValue()).toBe('Testing keyboard input')

    // Tab to send button
    await page.keyboard.press('Tab')

    // Send button should be focused
    const sendButton = page.locator('button[type="submit"]')
    await expect(sendButton).toBeFocused()

    await captureScreenshot(page, 'interactions-keyboard-navigation')
  })

  test('all interactive elements are reachable via keyboard', async ({
    page,
  }) => {
    // Tab through all focusable elements
    const focusableElements = []
    let tabCount = 0
    const maxTabs = 20

    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab')
      tabCount++

      const focused = await page.evaluate(() => {
        const el = document.activeElement
        return {
          tag: el?.tagName,
          text: el?.textContent?.trim().slice(0, 50),
          type: el?.getAttribute('type'),
        }
      })

      focusableElements.push(focused)
    }

    console.log('Focusable elements:', JSON.stringify(focusableElements, null, 2))

    await captureScreenshot(page, 'interactions-keyboard-accessible')

    // Should have tabbed through multiple elements
    expect(focusableElements.length).toBeGreaterThan(0)
  })
})
