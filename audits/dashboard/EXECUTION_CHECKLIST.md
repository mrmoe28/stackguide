# Execution Checklist - Dashboard Fixes

**Start Date:** ___________
**Target Completion:** ___________
**Developer:** ___________

Use this checklist to track progress through all implementation tasks. Check off each item as you complete it.

---

## PHASE 1: Pre-Flight Checks

- [ ] Read full FEATURE_INVENTORY.md
- [ ] Read full ISSUES_BACKLOG.md
- [ ] Read full RESEARCH_NOTES.md
- [ ] Read full IMPLEMENTATION_PLAN.md
- [ ] Review current codebase state
- [ ] Confirm access to all required tools (database, API keys, etc.)
- [ ] Create feature branch: `git checkout -b fix/dashboard-audit-issues`

---

## MILESTONE 1: Critical Fixes

### M1.1: Fix Build Errors (30 min)

- [ ] Stop dev server if running
- [ ] Run: `rm -rf .next`
- [ ] Run: `rm -rf node_modules`
- [ ] Run: `pnpm install`
- [ ] Run: `pnpm build`
- [ ] Check for errors in build output
- [ ] Run: `pnpm dev`
- [ ] Verify http://localhost:3002 loads
- [ ] Check console for webpack errors (should be none)
- [ ] Add clean scripts to package.json:
  ```json
  "clean": "rm -rf .next",
  "clean-build": "pnpm run clean && pnpm run build",
  "clean-dev": "pnpm run clean && pnpm dev"
  ```
- [ ] Test clean scripts work
- [ ] Commit: `git commit -m "fix: resolve webpack chunk module errors"`

---

### M1.2: Create Test User (1-2 hours)

- [ ] Create file: `src/lib/db/seed.ts`
- [ ] Import bcryptjs and db client
- [ ] Write seed function:
  ```typescript
  import bcrypt from 'bcryptjs'
  import { db, users } from '@/lib/db'

  async function seed() {
    const passwordHash = await bcrypt.hash('Test123456!', 10)
    await db.insert(users).values({
      email: 'test@example.com',
      passwordHash,
      name: 'Test User',
    })
    console.log('Test user created')
  }
  ```
- [ ] Add seed script to package.json: `"db:seed": "tsx src/lib/db/seed.ts"`
- [ ] Run: `pnpm db:seed`
- [ ] Verify user in database (check with `pnpm db:studio`)
- [ ] Test login with test credentials
- [ ] Document credentials in .env.example
- [ ] Commit: `git commit -m "feat: add test user seed script"`

---

### M1.3: Fix UUID Validation (2-3 hours)

- [ ] Create file: `types/next-auth.d.ts`
- [ ] Add Session interface extension:
  ```typescript
  import NextAuth, { type DefaultSession } from "next-auth"

  declare module "next-auth" {
    interface Session {
      user: {
        id: string
      } & DefaultSession["user"]
    }
  }
  ```
- [ ] Open `src/lib/auth.ts` (or where NextAuth config is)
- [ ] Add session callback:
  ```typescript
  callbacks: {
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        },
      }
    },
  }
  ```
- [ ] Verify database users table uses UUID:
  - [ ] Check `src/lib/db/schema.ts`
  - [ ] Ensure: `id: uuid('id').primaryKey().defaultRandom()`
- [ ] Run: `pnpm typecheck`
- [ ] Fix any TypeScript errors
- [ ] Test chat API with authenticated user
- [ ] Verify no "Invalid user ID" errors
- [ ] Commit: `git commit -m "fix: add user ID to session and ensure UUID validation"`

---

### M1.4: Environment Variable Validation (1-2 hours)

- [ ] Create file: `src/lib/env.ts`
- [ ] Add Zod schema:
  ```typescript
  import { z } from 'zod'

  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),
    ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  })

  export const env = envSchema.parse(process.env)
  ```
- [ ] Import and call in `src/app/layout.tsx` or middleware
- [ ] Test with missing env var (should fail with clear message)
- [ ] Update .env.example with all required vars and descriptions
- [ ] Document in README.md
- [ ] Commit: `git commit -m "feat: add environment variable validation"`

---

### M1.5: Run Test Suite (2-3 hours)

- [ ] Ensure Playwright installed: `npx playwright install chromium`
- [ ] Run smoke tests: `npx playwright test 00-smoke.spec.ts`
- [ ] Review failures, fix obvious issues
- [ ] Run interaction tests: `npx playwright test 01-interactions.spec.ts`
- [ ] Run code viewer tests: `npx playwright test 02-code-viewer.spec.ts`
- [ ] Run accessibility tests: `npx playwright test 03-accessibility.spec.ts`
- [ ] Run full suite: `npx playwright test`
- [ ] Generate report: `npx playwright show-report`
- [ ] Review screenshots in `audits/dashboard/screenshots/`
- [ ] Document pass/fail counts in TEST_REPORT.md
- [ ] Commit test results (not screenshots): `git commit -m "test: run initial Playwright test suite"`

---

### M1.6: Error Boundaries (2-3 hours)

- [ ] Create file: `src/app/dashboard/error.tsx`
- [ ] Add 'use client' directive
- [ ] Implement Error component with reset button
- [ ] Style error UI to match app theme
- [ ] Create file: `src/app/error.tsx` (app-level)
- [ ] Create file: `src/app/global-error.tsx` (root)
- [ ] Test by throwing error in dashboard component
- [ ] Verify error boundary catches and displays
- [ ] Test reset button functionality
- [ ] Add error logging (console.error or external service)
- [ ] Commit: `git commit -m "feat: add error boundaries for resilience"`

---

### M1.7: Loading Skeletons (2-3 hours)

- [ ] Install (if needed): `pnpm add react-loading-skeleton`
- [ ] Or create custom skeleton components
- [ ] Create `src/components/skeletons/chat-skeleton.tsx`
- [ ] Create `src/components/skeletons/recommendation-skeleton.tsx`
- [ ] Create `src/components/skeletons/code-viewer-skeleton.tsx`
- [ ] Replace loading spinners with skeletons:
  - [ ] ChatInterface loading state
  - [ ] Recommendations panel initial load
  - [ ] Code viewer during generation
- [ ] Test with network throttling (Chrome DevTools → Slow 3G)
- [ ] Verify smooth transitions
- [ ] Commit: `git commit -m "feat: add loading skeletons for better UX"`

---

## MILESTONE 2: Core Features

### M2.1: Implement /api/recommendations/save (3-4 hours)

- [ ] Review database schema: `src/lib/db/schema.ts`
- [ ] Verify `recommendations` table structure
- [ ] Create directory: `src/app/api/recommendations/save/`
- [ ] Create file: `route.ts`
- [ ] Implement POST handler:
  - [ ] Import NextRequest, NextResponse
  - [ ] Import db, recommendations
  - [ ] Import z from 'zod'
  - [ ] Create validation schema
  - [ ] Add auth check: `const session = await auth()`
  - [ ] Parse and validate request body
  - [ ] Insert with `.insert().values().returning()`
  - [ ] Return success response
  - [ ] Add error handling (400, 401, 500)
- [ ] Test with curl or Postman:
  ```bash
  curl -X POST http://localhost:3002/api/recommendations/save \
    -H "Content-Type: application/json" \
    -H "Cookie: [session-cookie]" \
    -d '{"projectId":"...", "technologies":["React","Next.js"]}'
  ```
- [ ] Verify data in database
- [ ] Update frontend `stack-card.tsx` to handle responses
- [ ] Test "Add to Stack" button end-to-end
- [ ] Commit: `git commit -m "feat: implement recommendations save API endpoint"`

---

### M2.2: Add ARIA Labels (2-3 hours)

- [ ] Open `src/components/chat-interface.tsx`
- [ ] Add aria-label to chat input:
  ```tsx
  <Input
    aria-label="Describe your project requirements"
    placeholder="Describe your project..."
  />
  ```
- [ ] Add aria-label to send button:
  ```tsx
  <Button type="submit" aria-label="Send message">
    <Send />
  </Button>
  ```
- [ ] Open `src/components/sign-out-button.tsx`
- [ ] Add aria-label:
  ```tsx
  <button
    onClick={...}
    aria-label="Sign out of account"
  >
    Sign Out
  </button>
  ```
- [ ] Open `src/components/stack-card.tsx`
- [ ] Add aria-label to external link:
  ```tsx
  <a
    href={recommendation.url}
    aria-label={`Open ${recommendation.name} official website`}
    target="_blank"
    rel="noopener noreferrer"
  >
    <ExternalLink />
  </a>
  ```
- [ ] Add dynamic aria-label to "Add to Stack" button:
  ```tsx
  <Button
    onClick={handleSave}
    aria-label={`Save ${recommendation.name} to your stack`}
  >
    Add to Stack
  </Button>
  ```
- [ ] Run: `npx playwright test 03-accessibility.spec.ts`
- [ ] Fix any remaining a11y violations
- [ ] Test with screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] Commit: `git commit -m "feat: add ARIA labels for accessibility"`

---

### M2.3: Recommendations Persistence (3-4 hours)

- [ ] Decide: Database or localStorage? (Recommend: localStorage for speed)
- [ ] If localStorage:
  - [ ] Create `src/lib/storage.ts` with get/set helpers
  - [ ] Update `ChatInterface` to load from localStorage on mount
  - [ ] Save recommendations to localStorage after API response
  - [ ] Clear on new query or keep history (design decision)
- [ ] If database:
  - [ ] Add projectId to recommendations table (if not exists)
  - [ ] Create GET `/api/recommendations` endpoint
  - [ ] Fetch on dashboard mount
  - [ ] Update state with fetched data
- [ ] Test: Send message → get recommendations → refresh page
- [ ] Verify recommendations still visible
- [ ] Commit: `git commit -m "feat: persist recommendations across sessions"`

---

### M2.4: Character Limit on Chat Input (1 hour)

- [ ] Open `src/components/chat-interface.tsx`
- [ ] Add maxLength to Input:
  ```tsx
  <Input
    maxLength={1000}
    value={input}
    onChange={(e) => setInput(e.target.value)}
  />
  ```
- [ ] Add character counter below input:
  ```tsx
  <span className={`text-sm ${input.length > 900 ? 'text-red-500' : 'text-gray-500'}`}>
    {input.length} / 1000
  </span>
  ```
- [ ] Test typing long text
- [ ] Test pasting text over limit
- [ ] Verify counter updates in real-time
- [ ] Commit: `git commit -m "feat: add character limit and counter to chat input"`

---

### M2.5: Fix File System API Check Order (1-2 hours)

- [ ] Open `src/components/code-viewer.tsx`
- [ ] Move browser check before showing "Save to Folder" button
- [ ] Option A: Hide button in unsupported browsers
  ```tsx
  const [hasFileSystemAPI, setHasFileSystemAPI] = useState(false)

  useEffect(() => {
    setHasFileSystemAPI('showDirectoryPicker' in window)
  }, [])

  {hasFileSystemAPI && (
    <Button onClick={handleSaveToFolder}>Save to Folder</Button>
  )}
  ```
- [ ] Option B: Show tooltip on hover
- [ ] Test in Chrome (should work)
- [ ] Test in Firefox (button hidden or shows tooltip)
- [ ] Test in Safari (button hidden or shows tooltip)
- [ ] Commit: `git commit -m "fix: improve File System API browser detection UX"`

---

### M2.6: Keyboard Shortcut (1 hour)

- [ ] Open `src/components/chat-interface.tsx`
- [ ] Check if Enter already works (form onSubmit usually handles it)
- [ ] If not, add onKeyDown to input:
  ```tsx
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading && input.trim()) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  <Input
    onKeyDown={handleKeyDown}
    ...
  />
  ```
- [ ] Test: Type message → Press Enter → Message sends
- [ ] Test: Empty input → Press Enter → Nothing happens
- [ ] Test: Loading state → Press Enter → Nothing happens
- [ ] Commit: `git commit -m "feat: add Enter key shortcut to send messages"`

---

## MILESTONE 3: Polish (Optional)

### M3.1: Dark Mode Toggle (1-2 hours)

- [ ] Install (if needed): `pnpm add @radix-ui/react-dropdown-menu`
- [ ] Create `src/components/theme-toggle.tsx`
- [ ] Use next-themes useTheme hook
- [ ] Add button with Sun/Moon icons
- [ ] Place in dashboard header
- [ ] Test switching themes
- [ ] Verify persistence
- [ ] Commit: `git commit -m "feat: add dark mode toggle to header"`

---

### M3.2: Resizable Recommendations Panel (2-3 hours)

- [ ] Install: `pnpm add react-resizable-panels`
- [ ] Update ChatInterface to use ResizablePanelGroup
- [ ] Replace fixed w-96 with ResizablePanel
- [ ] Add ResizableHandle between panels
- [ ] Set min/max constraints
- [ ] Store size in localStorage
- [ ] Test resizing
- [ ] Commit: `git commit -m "feat: make recommendations panel resizable"`

---

### M3.3: Message Edit/Delete (3-4 hours)

- [ ] Add hover state to message bubbles
- [ ] Show edit/delete icons on hover
- [ ] Implement edit mode (inline or modal)
- [ ] Create PATCH `/api/chat/[id]` endpoint
- [ ] Create DELETE `/api/chat/[id]` endpoint
- [ ] Update UI on success
- [ ] Show "edited" indicator
- [ ] Add confirmation dialog for delete
- [ ] Test editing/deleting messages
- [ ] Commit: `git commit -m "feat: add message edit and delete functionality"`

---

### M3.4: Chat Export (2-3 hours)

- [ ] Add "Export" button to header
- [ ] Create export function to generate markdown
- [ ] Include all messages, recommendations, timestamps
- [ ] Create downloadable file
- [ ] Optional: Add PDF export (use jsPDF or similar)
- [ ] Test with long conversations
- [ ] Commit: `git commit -m "feat: add chat export functionality"`

---

### M3.5: Icon Button Tooltips (1-2 hours)

- [ ] Install: `pnpm add @radix-ui/react-tooltip`
- [ ] Create `src/components/ui/tooltip.tsx` wrapper
- [ ] Wrap external link icons with Tooltip
- [ ] Wrap copy/download/save buttons with Tooltip
- [ ] Add descriptive messages
- [ ] Test hover behavior
- [ ] Test keyboard access (Tab + hover)
- [ ] Commit: `git commit -m "feat: add tooltips to icon buttons"`

---

### M3.6: Recommendation Visual Hierarchy (2-3 hours)

- [ ] Group recommendations by category
- [ ] Add category headers
- [ ] Implement priority badges
- [ ] Add sorting dropdown
- [ ] Style with better spacing/colors
- [ ] Test with multiple categories
- [ ] Commit: `git commit -m "feat: improve recommendation card visual hierarchy"`

---

### M3.7: Remember Code Tab Preference (1 hour)

- [ ] Store selectedFile index in localStorage
- [ ] Key: `codeViewer_selectedTab`
- [ ] Restore on mount
- [ ] Or use smart default (README.md, package.json, etc.)
- [ ] Test across multiple boilerplate generations
- [ ] Commit: `git commit -m "feat: remember code viewer tab preference"`

---

### M3.8: Performance Optimization (3-4 hours)

- [ ] Install: `pnpm add @next/bundle-analyzer`
- [ ] Configure in next.config.ts
- [ ] Run: `ANALYZE=true pnpm build`
- [ ] Review bundle size report
- [ ] Add React.memo to expensive components:
  - [ ] ChatInterface
  - [ ] StackCard
  - [ ] CodeViewer
- [ ] Add dynamic imports for heavy components
- [ ] Optimize images with next/image
- [ ] Add Suspense boundaries
- [ ] Run Lighthouse audit
- [ ] Document before/after metrics
- [ ] Commit: `git commit -m "perf: optimize bundle size and runtime performance"`

---

## FINAL STEPS

### Code Quality

- [ ] Run: `pnpm typecheck` (0 errors)
- [ ] Run: `pnpm lint` (0 errors)
- [ ] Run: `pnpm format` (all files formatted)
- [ ] Review all TODO comments in code
- [ ] Remove console.logs (except intentional)
- [ ] Update comments and documentation

---

### Testing

- [ ] Run full Playwright suite: `npx playwright test`
- [ ] Verify 95%+ pass rate
- [ ] Review and address failures
- [ ] Test manually:
  - [ ] Sign in/out flow
  - [ ] Send chat message
  - [ ] View recommendations
  - [ ] Add to stack
  - [ ] Code viewer features
  - [ ] Dark mode toggle
  - [ ] Responsive on mobile
  - [ ] Keyboard navigation
  - [ ] Screen reader (quick check)
- [ ] Update TEST_REPORT.md with final results

---

### Documentation

- [ ] Update README.md with new features
- [ ] Document all API endpoints
- [ ] Update .env.example
- [ ] Add inline code comments where needed
- [ ] Create CHANGELOG.md entry
- [ ] Update CONTEXT.md (if exists)

---

### Deployment Prep

- [ ] Merge main into feature branch: `git merge main`
- [ ] Resolve any conflicts
- [ ] Run full test suite again
- [ ] Create pull request
- [ ] Add description with:
  - Summary of changes
  - Link to IMPLEMENTATION_PLAN.md
  - Link to TEST_REPORT.md
  - Screenshots/GIFs of new features
  - Breaking changes (if any)
- [ ] Request code review
- [ ] Address review feedback
- [ ] Get approval
- [ ] Merge to main
- [ ] Monitor production for errors
- [ ] Celebrate! 🎉

---

## Troubleshooting

If you encounter issues:

1. **Build failures:**
   - Run: `rm -rf .next && pnpm install && pnpm build`
   - Check next.config.ts for syntax errors
   - Review recent changes

2. **Test failures:**
   - Check if dev server is running
   - Verify test user exists
   - Check environment variables
   - Review Playwright debug logs

3. **Database errors:**
   - Verify DATABASE_URL is correct
   - Check if migrations are up to date
   - Use `pnpm db:studio` to inspect data

4. **Auth issues:**
   - Clear browser cookies
   - Check NEXTAUTH_SECRET is set
   - Verify user exists in database
   - Review NextAuth configuration

5. **Type errors:**
   - Run: `pnpm typecheck`
   - Check types/next-auth.d.ts is loaded
   - Review import paths

---

**Checklist Status:** Ready to Execute
**Estimated Total Time:** 45-62 hours
**Success Rate:** Track completion percentage as you go

*Good luck! This is a comprehensive audit → fix workflow. Take breaks, commit often, and don't hesitate to refer back to the research notes when stuck.*
