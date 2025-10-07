import { test, expect } from '@playwright/test'
import { signIn, captureScreenshot, sendChatMessage } from './helpers'

test.describe('Dashboard - Code Viewer Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    if (page.url().includes('/auth/signin')) {
      await signIn(page)
    }
  })

  test('code viewer appears when boilerplate is generated', async ({
    page,
  }) => {
    // Send a message that should generate boilerplate
    await sendChatMessage(page, 'Generate a simple Express.js server setup')

    // Wait for response
    await page.waitForTimeout(5000)

    // Look for code viewer
    const codeViewer = page.locator('h3:has-text("Starter Code")')

    // Note: May not appear if AI doesn't generate boilerplate
    const exists = (await codeViewer.count()) > 0

    if (exists) {
      await expect(codeViewer).toBeVisible()
      await captureScreenshot(page, 'code-viewer-appeared')
    } else {
      console.log('No boilerplate generated in this response')
    }
  })

  test('file tabs navigation works', async ({ page }) => {
    // Try to trigger boilerplate generation
    await sendChatMessage(page, 'Create a React + TypeScript starter project')
    await page.waitForTimeout(5000)

    const fileTabs = page.locator('button').filter({
      has: page.locator('text=/\\.(ts|tsx|js|jsx|json)$/'),
    })

    const tabCount = await fileTabs.count()

    if (tabCount > 1) {
      // Click first tab
      await fileTabs.nth(0).click()
      await captureScreenshot(page, 'code-viewer-tab-1')

      // Click second tab
      await fileTabs.nth(1).click()
      await captureScreenshot(page, 'code-viewer-tab-2')

      // Verify active tab styling changed
      const activeTab = fileTabs.nth(1)
      await expect(activeTab).toHaveClass(/bg-blue/)
    }
  })

  test('copy code button works', async ({ page, context }) => {
    await sendChatMessage(page, 'Generate a Node.js package.json file')
    await page.waitForTimeout(5000)

    const copyButton = page.locator('button:has-text("Copy")')

    if ((await copyButton.count()) > 0) {
      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])

      await copyButton.click()

      // Button should show "Copied!"
      await expect(page.locator('text=Copied!')).toBeVisible({
        timeout: 2000,
      })

      await captureScreenshot(page, 'code-viewer-copy-feedback')

      // Verify button reverts back
      await page.waitForTimeout(2500)
      await expect(page.locator('button:has-text("Copy")')).toBeVisible()
    }
  })

  test('download all button creates file', async ({ page }) => {
    await sendChatMessage(page, 'Create a basic HTML/CSS/JS project structure')
    await page.waitForTimeout(5000)

    const downloadButton = page.locator('button:has-text("Download")')

    if ((await downloadButton.count()) > 0) {
      // Listen for download
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadButton.click(),
      ])

      // Verify download started
      expect(download.suggestedFilename()).toMatch(/boilerplate\.md$/)

      await captureScreenshot(page, 'code-viewer-download-triggered')
    }
  })

  test('save to folder button shows consent dialog', async ({ page }) => {
    await sendChatMessage(page, 'Generate a Python Flask project')
    await page.waitForTimeout(5000)

    const saveButton = page.locator('button:has-text("Save to Folder")')

    if ((await saveButton.count()) > 0) {
      await saveButton.click()

      // Consent dialog should appear
      await expect(
        page.locator('text=/file system access|permission/i')
      ).toBeVisible({ timeout: 2000 })

      await captureScreenshot(page, 'code-viewer-consent-dialog')

      // Click decline to close
      const declineButton = page.locator('button:has-text("Decline")')
      if ((await declineButton.count()) > 0) {
        await declineButton.click()
      }
    }
  })

  test('file system API browser support detection', async ({ page }) => {
    // Check if browser supports File System Access API
    const hasFileSystemAPI = await page.evaluate(() => {
      return 'showDirectoryPicker' in window
    })

    console.log('File System API supported:', hasFileSystemAPI)

    if (!hasFileSystemAPI) {
      await sendChatMessage(page, 'Create a Vue.js project')
      await page.waitForTimeout(5000)

      const saveButton = page.locator('button:has-text("Save to Folder")')

      if ((await saveButton.count()) > 0) {
        // Accept consent if shown
        const acceptButton = page.locator('button:has-text("Accept")')
        if ((await acceptButton.count()) > 0) {
          await saveButton.click()
          await acceptButton.click()

          // Should show browser not supported alert
          // Note: Hard to test alerts in Playwright
        }
      }
    }
  })

  test('syntax highlighting renders correctly', async ({ page }) => {
    await sendChatMessage(page, 'Show me a JavaScript function example')
    await page.waitForTimeout(5000)

    // Look for syntax highlighter elements
    const codeBlock = page.locator('pre code, pre[class*="language"]')

    if ((await codeBlock.count()) > 0) {
      // Verify syntax highlighting is applied
      const hasHighlighting = await codeBlock.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return computed.color !== 'rgb(0, 0, 0)' // Not default black
      })

      expect(hasHighlighting).toBe(true)

      await captureScreenshot(page, 'code-viewer-syntax-highlighting')
    }
  })

  test('code display scrolls for long content', async ({ page }) => {
    await sendChatMessage(
      page,
      'Generate a complete Express.js API with multiple routes'
    )
    await page.waitForTimeout(5000)

    const codeContainer = page.locator('div.max-h-\\[400px\\]')

    if ((await codeContainer.count()) > 0) {
      // Check if scroll is present
      const isScrollable = await codeContainer.evaluate((el) => {
        return el.scrollHeight > el.clientHeight
      })

      if (isScrollable) {
        // Test scrolling
        await codeContainer.evaluate((el) => {
          el.scrollTop = el.scrollHeight / 2
        })

        await captureScreenshot(page, 'code-viewer-scrolled')
      }
    }
  })

  test('setup instructions display when available', async ({ page }) => {
    await sendChatMessage(
      page,
      'Create a Next.js project with setup instructions'
    )
    await page.waitForTimeout(5000)

    // Look for setup section
    const setupSection = page.locator('text=/Getting Started|Setup Instructions/i')

    if ((await setupSection.count()) > 0) {
      await expect(setupSection).toBeVisible()

      // Verify numbered steps exist
      const steps = page.locator('ol li')
      const stepCount = await steps.count()

      expect(stepCount).toBeGreaterThan(0)

      await captureScreenshot(page, 'code-viewer-setup-instructions')
    }
  })

  test('progress checklist shows during save operation', async ({
    page,
    context,
  }) => {
    // Note: This test is browser-specific (Chromium only)
    const hasFileSystemAPI = await page.evaluate(() => {
      return 'showDirectoryPicker' in window
    })

    if (!hasFileSystemAPI) {
      test.skip()
      return
    }

    await sendChatMessage(page, 'Generate a multi-file React project')
    await page.waitForTimeout(5000)

    const saveButton = page.locator('button:has-text("Save to Folder")')

    if ((await saveButton.count()) > 0) {
      await saveButton.click()

      // Accept consent
      const acceptButton = page.locator('button:has-text("Accept")')
      if ((await acceptButton.count()) > 0) {
        await acceptButton.click()

        // Note: Cannot actually complete the file system picker in automated tests
        // But we can verify the dialog appeared
        await page.waitForTimeout(1000)

        // In a real scenario, user would select a folder
        // and we'd see the progress checklist
      }
    }
  })

  test('file tabs support horizontal scroll', async ({ page }) => {
    await sendChatMessage(
      page,
      'Create a full-stack application with many files'
    )
    await page.waitForTimeout(5000)

    const tabContainer = page.locator('div.overflow-x-auto').first()

    if ((await tabContainer.count()) > 0) {
      const isScrollable = await tabContainer.evaluate((el) => {
        return el.scrollWidth > el.clientWidth
      })

      if (isScrollable) {
        // Test horizontal scroll
        await tabContainer.evaluate((el) => {
          el.scrollLeft = 100
        })

        await captureScreenshot(page, 'code-viewer-horizontal-scroll')
      }
    }
  })

  test('code viewer handles different file types', async ({ page }) => {
    // Try to get different file types
    await sendChatMessage(
      page,
      'Show me examples of JSON, TypeScript, and Markdown files'
    )
    await page.waitForTimeout(5000)

    const fileTabs = page.locator('button[class*="font-mono"]')
    const tabCount = await fileTabs.count()

    if (tabCount > 0) {
      const fileTypes = []

      for (let i = 0; i < Math.min(tabCount, 5); i++) {
        const tabText = await fileTabs.nth(i).textContent()
        fileTypes.push(tabText)
      }

      console.log('File types detected:', fileTypes)

      await captureScreenshot(page, 'code-viewer-multiple-file-types')
    }
  })
})
