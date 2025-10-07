# Feature Audit System

This directory contains a comprehensive, reusable audit system for testing and documenting features across the application.

## Quick Start

To audit any page in the application:

1. **Update Config:**
   ```typescript
   // audits/config.ts
   export const defaultConfig: AuditConfig = {
     targetPagePath: '/your-page-path',  // Change this
     localBaseUrl: 'http://localhost:3002',
     // ... rest of config
   }
   ```

2. **Run Tests:**
   ```bash
   npx playwright test
   ```

3. **View Reports:**
   - HTML Report: `npx playwright show-report`
   - Screenshots: `audits/<page-slug>/screenshots/`
   - Results: `audits/<page-slug>/test-results.json`

## Directory Structure

```
audits/
├── README.md                    # This file
├── config.ts                    # Reusable configuration
├── dashboard/                   # Example audit (dashboard page)
│   ├── FEATURE_INVENTORY.md   # Complete feature map
│   ├── TEST_REPORT.md          # Test results and status
│   ├── ISSUES_BACKLOG.md       # Prioritized bug list
│   ├── RESEARCH_NOTES.md       # Fix approaches with sources
│   ├── IMPLEMENTATION_PLAN.md  # Phased implementation plan
│   ├── EXECUTION_CHECKLIST.md  # Step-by-step todo list
│   ├── playwright/             # Test suite
│   │   ├── helpers.ts         # Reusable test utilities
│   │   ├── 00-smoke.spec.ts   # Smoke tests
│   │   ├── 01-interactions.spec.ts  # Interaction tests
│   │   ├── 02-code-viewer.spec.ts   # Feature-specific tests
│   │   └── 03-accessibility.spec.ts # A11y tests
│   ├── screenshots/            # Test evidence
│   └── playwright-report/      # HTML test report
└── [other-pages]/              # Add more page audits here
```

## Files Generated

### 1. FEATURE_INVENTORY.md
Complete catalog of all interactive elements and features on the page.

**Contains:**
- Feature descriptions
- Selectors for testing
- Expected behaviors
- Dependencies (APIs, env vars, browser features)
- Priority matrix

**Use for:**
- Understanding what exists
- Writing comprehensive tests
- Onboarding new developers

---

### 2. TEST_REPORT.md
Detailed test results with pass/fail status for each feature.

**Contains:**
- Test coverage summary
- Feature-by-feature results
- Console errors detected
- Known issues
- Performance observations
- Screenshot references

**Use for:**
- QA validation
- Bug triage
- Regression tracking

---

### 3. ISSUES_BACKLOG.md
Prioritized list of all bugs and improvements needed.

**Contains:**
- Issue severity (P0-P3)
- Reproduction steps
- Impact assessment
- Suspected root causes
- Evidence links

**Use for:**
- Sprint planning
- Bug fixing workflow
- Communicating issues to stakeholders

---

### 4. RESEARCH_NOTES.md
Research-backed fix approaches for each major issue.

**Contains:**
- 2-4 credible sources per issue
- Multiple solution approaches (3-6 bullets each)
- Code examples
- Links to official docs

**Use for:**
- Implementation guidance
- Learning best practices
- Avoiding common pitfalls

---

### 5. IMPLEMENTATION_PLAN.md
Phased, milestone-based plan with estimates and dependencies.

**Contains:**
- 3 milestones (Critical → Core → Polish)
- Task breakdown with effort estimates
- Acceptance criteria per task
- Risk assessment
- Timeline and prioritization

**Use for:**
- Project management
- Resource planning
- Progress tracking

---

### 6. EXECUTION_CHECKLIST.md
Step-by-step tactical checklist for implementing all fixes.

**Contains:**
- Checkbox for every step
- Exact commands to run
- Code snippets to add
- Testing instructions
- Troubleshooting tips

**Use for:**
- Daily execution
- Avoiding missed steps
- Training junior developers

---

## Configuration

### audits/config.ts

```typescript
export interface AuditConfig {
  targetPagePath: string        // e.g., '/dashboard'
  altTargetUrl?: string          // Full URL if testing deployed site
  localBaseUrl: string           // e.g., 'http://localhost:3002'
  testUser?: {
    email: string
    password: string
  }
  timeouts: {
    navigation: number
    action: number
    test: number
  }
  screenshots: {
    enabled: boolean
    onFailure: boolean
    fullPage: boolean
  }
}
```

### Customization

To audit a different page:

1. Change `targetPagePath` in config
2. Run tests to generate new screenshots
3. Review failures
4. Create new markdown docs based on findings

---

## Test Helpers

### Available Utilities (playwright/helpers.ts)

- `signIn(page, credentials)` - Authenticate user
- `captureScreenshot(page, name)` - Save evidence
- `sendChatMessage(page, message)` - Test chat flow
- `safeClick(locator, name)` - Click with error handling
- `setupConsoleListener(page)` - Track console errors
- `setupNetworkListener(page)` - Track API calls
- `getInteractiveElements(page)` - Discover all interactive elements
- `discoverButtons(page)` - Document all buttons
- `hasRecommendations(page)` - Check for content

### Example Test

```typescript
import { test, expect } from '@playwright/test'
import { signIn, sendChatMessage, captureScreenshot } from './helpers'

test('feature works correctly', async ({ page }) => {
  await page.goto('/dashboard')
  await signIn(page)

  await sendChatMessage(page, 'Test message')

  await captureScreenshot(page, 'feature-test')

  expect(await page.locator('selector').textContent()).toContain('Expected')
})
```

---

## Running Tests

### All Tests
```bash
npx playwright test
```

### Specific Test File
```bash
npx playwright test 00-smoke.spec.ts
```

### With UI (Headed Mode)
```bash
npx playwright test --headed
```

### Debug Mode
```bash
npx playwright test --debug
```

### Generate Report
```bash
npx playwright show-report
```

---

## Best Practices

### 1. Test Organization
- **00-smoke.spec.ts**: Basic page load, no errors, critical elements present
- **01-interactions.spec.ts**: Button clicks, form submissions, navigation
- **02-[feature].spec.ts**: Specific feature deep dives
- **03-accessibility.spec.ts**: A11y tests with axe-core

### 2. Naming Conventions
- Test files: `XX-description.spec.ts`
- Screenshots: `category-action-timestamp.png`
- Helpers: Descriptive function names with JSDoc

### 3. Assertions
- Use specific selectors (data-testid when possible)
- Assert expected state, not just absence of errors
- Capture screenshot before and after key actions

### 4. Maintenance
- Update FEATURE_INVENTORY.md when features change
- Re-run tests after fixes to update TEST_REPORT.md
- Archive old screenshots periodically

---

## Extending the System

### Add New Test Suite

1. Create new directory: `audits/new-page/`
2. Copy `playwright/` directory structure
3. Update helpers for page-specific needs
4. Write tests following same patterns
5. Generate markdown docs

### Add New Helper Functions

1. Open `audits/dashboard/playwright/helpers.ts`
2. Add new function with JSDoc
3. Export and use in tests
4. Document in this README

### Add New Assertions

Follow this pattern:

```typescript
/**
 * Verify specific condition
 */
export async function assertCondition(page: Page, expected: string) {
  const actual = await page.locator('selector').textContent()
  expect(actual, 'Descriptive failure message').toBe(expected)
}
```

---

## Troubleshooting

### Tests Timeout
- Increase timeout in playwright.config.ts
- Check if dev server is running
- Verify network connection

### Authentication Fails
- Ensure test user exists in database
- Check credentials in config
- Clear browser cookies

### Screenshots Not Saving
- Check directory permissions
- Verify path in helpers.ts
- Ensure disk space available

### Accessibility Tests Fail
- Run axe-core scan manually
- Check for missing ARIA labels
- Verify semantic HTML structure

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: npx playwright install --with-deps
      - run: pnpm build
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: audits/*/playwright-report/
```

---

## Metrics to Track

- **Test Coverage**: % of features with tests
- **Pass Rate**: % of passing tests
- **Issue Resolution**: Bugs fixed vs. found
- **Performance**: Lighthouse scores
- **Accessibility**: axe-core violations count

---

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [axe-core Accessibility Testing](https://github.com/dequelabs/axe-core)
- [Next.js Testing Guide](https://nextjs.org/docs/app/building-your-application/testing)
- [React Testing Best Practices](https://react.dev/learn/testing)

---

**System Version:** 1.0
**Last Updated:** 2025-10-07
**Maintained By:** Development Team
