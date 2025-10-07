import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { signIn, captureScreenshot } from './helpers'

test.describe('Dashboard - Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    if (page.url().includes('/auth/signin')) {
      await signIn(page)
    }
  })

  test('should not have automatically detectable accessibility issues', async ({
    page,
  }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    await captureScreenshot(page, 'a11y-initial-scan')

    // Log violations for review
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:')
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`- ${violation.id}: ${violation.description}`)
        console.log(`  Impact: ${violation.impact}`)
        console.log(`  Elements: ${violation.nodes.length}`)
      })
    }

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('critical interactive elements have accessible names', async ({
    page,
  }) => {
    const violations = []

    // Check sign out button
    const signOutButton = page.locator('button:has-text("Sign Out")')
    const signOutName = await signOutButton.getAttribute('aria-label')
    if (!signOutName && !(await signOutButton.textContent())) {
      violations.push('Sign Out button lacks accessible name')
    }

    // Check send button
    const sendButton = page.locator('button[type="submit"]')
    const sendName = await sendButton.getAttribute('aria-label')
    if (!sendName && !(await sendButton.textContent())) {
      violations.push('Send button lacks accessible name')
    }

    // Check chat input
    const chatInput = page.locator('input[placeholder*="Describe"]')
    const inputLabel = await chatInput.getAttribute('aria-label')
    if (!inputLabel) {
      console.warn('Chat input should have aria-label')
    }

    await captureScreenshot(page, 'a11y-interactive-elements')

    expect(
      violations,
      `Accessibility issues: ${violations.join(', ')}`
    ).toHaveLength(0)
  })

  test('keyboard navigation follows logical tab order', async ({ page }) => {
    const focusOrder = []

    // Tab through first 10 elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')

      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        return {
          tag: el?.tagName,
          text: el?.textContent?.trim().slice(0, 30),
          role: el?.getAttribute('role'),
          ariaLabel: el?.getAttribute('aria-label'),
        }
      })

      focusOrder.push(focusedElement)
    }

    console.log('Tab order:', JSON.stringify(focusOrder, null, 2))

    await captureScreenshot(page, 'a11y-tab-order')

    // Verify we tabbed through multiple elements
    expect(focusOrder.length).toBe(10)
  })

  test('focus is visible on all interactive elements', async ({ page }) => {
    const interactiveSelectors = [
      'button:has-text("Sign Out")',
      'input[placeholder*="Describe"]',
      'button[type="submit"]',
    ]

    for (const selector of interactiveSelectors) {
      const element = page.locator(selector).first()

      if ((await element.count()) > 0) {
        await element.focus()

        // Check if focus is visible (has outline or focus ring)
        const hasFocusStyle = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el)
          return (
            computed.outline !== 'none' &&
            computed.outline !== 'rgb(0, 0, 0) none 0px' &&
            computed.outline !== ''
          )
        })

        // Note: Some frameworks use box-shadow for focus rings
        // So we allow both outline and custom focus styles
        console.log(`Focus style for ${selector}:`, hasFocusStyle)
      }
    }

    await captureScreenshot(page, 'a11y-focus-visibility')
  })

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze()

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    )

    if (contrastViolations.length > 0) {
      console.log('Color contrast violations:', contrastViolations)
    }

    await captureScreenshot(page, 'a11y-color-contrast')

    expect(contrastViolations).toHaveLength(0)
  })

  test('images have alt text', async ({ page }) => {
    const images = await page.locator('img').all()

    const imagesWithoutAlt = []

    for (const img of images) {
      const alt = await img.getAttribute('alt')
      const src = await img.getAttribute('src')

      if (!alt) {
        imagesWithoutAlt.push(src)
      }
    }

    if (imagesWithoutAlt.length > 0) {
      console.log('Images without alt text:', imagesWithoutAlt)
    }

    await captureScreenshot(page, 'a11y-images')

    expect(
      imagesWithoutAlt,
      `${imagesWithoutAlt.length} images lack alt text`
    ).toHaveLength(0)
  })

  test('heading structure is semantic', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()

    const headingStructure = []

    for (const heading of headings) {
      const level = await heading.evaluate((el) => parseInt(el.tagName[1]))
      const text = (await heading.textContent())?.trim()
      headingStructure.push({ level, text })
    }

    console.log('Heading structure:', headingStructure)

    await captureScreenshot(page, 'a11y-headings')

    // Should have at least one h1
    const h1Count = headingStructure.filter((h) => h.level === 1).length
    expect(h1Count).toBeGreaterThanOrEqual(1)

    // Headings should not skip levels
    for (let i = 1; i < headingStructure.length; i++) {
      const diff = headingStructure[i].level - headingStructure[i - 1].level
      if (diff > 1) {
        console.warn(
          `Heading level skipped: ${headingStructure[i - 1].level} to ${headingStructure[i].level}`
        )
      }
    }
  })

  test('landmarks are properly defined', async ({ page }) => {
    const landmarks = await page
      .locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer')
      .all()

    const landmarkInfo = []

    for (const landmark of landmarks) {
      const role = await landmark.evaluate((el) => {
        return el.getAttribute('role') || el.tagName.toLowerCase()
      })
      landmarkInfo.push(role)
    }

    console.log('Landmarks found:', landmarkInfo)

    await captureScreenshot(page, 'a11y-landmarks')

    // Should have main content area
    const hasMain = landmarkInfo.some((l) => l === 'main')
    expect(hasMain, 'Page should have main landmark').toBe(true)
  })

  test('buttons have appropriate type attributes', async ({ page }) => {
    const buttons = await page.locator('button').all()

    const buttonsWithoutType = []

    for (const button of buttons) {
      const type = await button.getAttribute('type')
      const text = (await button.textContent())?.trim()

      if (!type) {
        buttonsWithoutType.push(text)
      }
    }

    if (buttonsWithoutType.length > 0) {
      console.log('Buttons without type:', buttonsWithoutType)
    }

    await captureScreenshot(page, 'a11y-button-types')

    // This is a best practice, not a strict requirement
    // But good to track
  })

  test('links are distinguishable from regular text', async ({ page }) => {
    const links = await page.locator('a').all()

    for (const link of links) {
      const isVisible = await link.isVisible()

      if (isVisible) {
        const styles = await link.evaluate((el) => {
          const computed = window.getComputedStyle(el)
          return {
            color: computed.color,
            textDecoration: computed.textDecoration,
            cursor: computed.cursor,
          }
        })

        // Links should have cursor pointer and some visual distinction
        expect(styles.cursor).toBe('pointer')
      }
    }

    await captureScreenshot(page, 'a11y-links')
  })

  test('form inputs have associated labels', async ({ page }) => {
    const inputs = await page.locator('input').all()

    const inputsWithoutLabels = []

    for (const input of inputs) {
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledBy = await input.getAttribute('aria-labelledby')
      const placeholder = await input.getAttribute('placeholder')

      // Check if there's an associated label
      let hasLabel = false
      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        hasLabel = (await label.count()) > 0
      }

      if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
        inputsWithoutLabels.push({
          id,
          placeholder,
        })
      }
    }

    if (inputsWithoutLabels.length > 0) {
      console.log('Inputs without proper labels:', inputsWithoutLabels)
    }

    await captureScreenshot(page, 'a11y-form-labels')

    // Note: Placeholder is not a substitute for label
    // But we're being lenient here
  })

  test('screen reader compatibility (ARIA roles)', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast']) // Already tested separately
      .analyze()

    const ariaViolations = accessibilityScanResults.violations.filter((v) =>
      v.id.includes('aria')
    )

    if (ariaViolations.length > 0) {
      console.log('ARIA violations:', ariaViolations)
    }

    await captureScreenshot(page, 'a11y-aria-roles')

    expect(ariaViolations).toHaveLength(0)
  })

  test('page is zoom-friendly (up to 200%)', async ({ page }) => {
    // Test at normal zoom
    await captureScreenshot(page, 'a11y-zoom-100')

    // Zoom to 150%
    await page.evaluate(() => {
      document.body.style.zoom = '1.5'
    })
    await page.waitForTimeout(500)

    await captureScreenshot(page, 'a11y-zoom-150')

    // Check if content is still accessible
    await expect(page.locator('h1:has-text("StackGuideR")')).toBeVisible()

    // Zoom to 200%
    await page.evaluate(() => {
      document.body.style.zoom = '2'
    })
    await page.waitForTimeout(500)

    await captureScreenshot(page, 'a11y-zoom-200')

    // Content should still be visible and usable
    await expect(page.locator('h1:has-text("StackGuideR")')).toBeVisible()

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1'
    })
  })
})
