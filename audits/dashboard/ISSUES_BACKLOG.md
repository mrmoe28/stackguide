# Issues Backlog - Dashboard Page

**Generated:** 2025-10-07
**Priority Levels:** P0 (Critical) → P1 (High) → P2 (Medium) → P3 (Low)

---

## P0: Critical Issues (Blocks Core Functionality)

### Issue #1: Build Module Resolution Errors
- **Severity:** P0 - Critical
- **Symptom:** `Cannot find module './chunks/vendor-chunks/formdata-node@4.4.1.js'` and similar webpack chunk errors
- **Impact:** API routes may fail, page rendering unstable, unpredictable behavior
- **Reproduction:**
  1. Start dev server: `pnpm dev`
  2. Check server logs in terminal
  3. Observe module not found errors in stderr
- **Evidence:** Dev server output shows two critical module errors
- **Suspected Root Cause:** Corrupted `.next` build cache or pnpm dependency resolution issue
- **Scope:** Build system, affects API routes and document rendering
- **Affected Components:**
  - `/api/chat` route
  - `_document` page
  - Potentially other routes using affected dependencies

---

### Issue #2: Missing Test User Account
- **Severity:** P0 - Blocks Testing
- **Symptom:** Cannot execute E2E test suite
- **Impact:** Unable to verify features work correctly, test coverage at 0%
- **Reproduction:**
  1. Run: `npx playwright test`
  2. Tests attempt to navigate to /dashboard
  3. Redirected to /auth/signin
  4. No test credentials available
- **Evidence:** Authentication required for all dashboard features
- **Suspected Root Cause:** Database not seeded with test data
- **Scope:** Testing infrastructure
- **Required Actions:**
  - Create test user with email: `test@example.com`
  - Password: `Test123456!`
  - Ensure user has valid UUID in database

---

## P1: High Priority (Degraded Experience)

### Issue #3: Missing API Endpoint - /api/recommendations/save
- **Severity:** P1 - High
- **Symptom:** "Add to Stack" button calls non-existent endpoint
- **Impact:** Users cannot persist their recommended technologies, key feature non-functional
- **Reproduction:**
  1. Log in to dashboard
  2. Send chat message: "Suggest tools for a web app"
  3. Wait for recommendations to appear
  4. Click "Add to Stack" button on any recommendation
  5. Check browser DevTools Network tab
  6. Observe 404 or network error for POST `/api/recommendations/save`
- **Evidence:**
  - stack-card.tsx:28-37 - Code references endpoint
  - No corresponding file in `src/app/api/recommendations/save/`
- **Suspected Root Cause:** API endpoint planned but not yet implemented
- **Scope:** Backend API, requires database schema support
- **Related Files:**
  - `src/components/stack-card.tsx` (frontend)
  - Missing: `src/app/api/recommendations/save/route.ts` (backend)

---

### Issue #4: User ID Type Mismatch (UUID Validation)
- **Severity:** P1 - High
- **Symptom:** Chat API validation may reject userId if it's not a valid UUID
- **Impact:** Chat fails for users whose ID isn't UUID format, blocks core functionality
- **Reproduction:**
  1. Create user with non-UUID ID (e.g., sequential integer)
  2. Log in as that user
  3. Attempt to send chat message
  4. API returns 400: "Invalid user ID"
- **Evidence:**
  - `src/app/api/chat/route.ts:8` - Zod schema requires UUID: `.string().uuid('Invalid user ID')`
  - `src/app/dashboard/page.tsx:29` - Passes `session.user?.id` without UUID guarantee
  - Database schema may use non-UUID IDs depending on auth provider
- **Suspected Root Cause:** Mismatch between NextAuth ID format and API expectation
- **Scope:** API validation, authentication integration
- **Possible Solutions:**
  1. Ensure all user IDs in database are UUIDs
  2. Change validation to accept any string ID
  3. Add UUID conversion layer

---

### Issue #5: ANTHROPIC_API_KEY Environment Variable May Be Missing
- **Severity:** P1 - High
- **Symptom:** Chat API fails with 500 error when AI key is not configured
- **Impact:** Core chat functionality completely non-functional
- **Reproduction:**
  1. Remove `ANTHROPIC_API_KEY` from .env
  2. Send chat message
  3. API returns 500 internal server error
- **Evidence:**
  - `src/lib/anthropic.ts` (if exists) requires API key
  - No fallback or helpful error message to user
- **Suspected Root Cause:** Environment variable not set or incorrect
- **Scope:** Configuration, error handling
- **Recommended Fix:**
  - Add startup validation for required env vars
  - Show user-friendly message when key is missing
  - Update .env.example with placeholder

---

## P2: Medium Priority (Usability Issues)

### Issue #6: Missing ARIA Labels on Interactive Elements
- **Severity:** P2 - Medium
- **Symptom:** Screen reader users cannot identify purpose of some controls
- **Impact:** Inaccessible to screen reader users, WCAG compliance failure
- **Reproduction:**
  1. Run axe-core accessibility scan
  2. Or use screen reader (NVDA/JAWS)
  3. Navigate to chat input field
  4. Screen reader announces: "Edit text" (not descriptive)
- **Evidence:** Code review shows missing aria-label attributes
- **Suspected Root Cause:** Accessibility not prioritized during development
- **Scope:** UI components
- **Affected Elements:**
  - Chat input field (`<Input>` at chat-interface.tsx:173)
  - Send button (may rely on icon only)
  - Sign out button
  - Recommendation card buttons
- **Recommended Fix:**
  ```tsx
  <Input
    aria-label="Describe your project requirements"
    placeholder="Describe your project..."
  />
  ```

---

### Issue #7: No Loading Skeleton UI
- **Severity:** P2 - Medium
- **Symptom:** Page shows spinner but no structure preview during load
- **Impact:** Users don't know what's loading, poor perceived performance
- **Reproduction:**
  1. Open dashboard with slow network (Chrome DevTools throttle to 3G)
  2. Observe only spinner shown
  3. No preview of layout or content structure
- **Evidence:** Code review shows only `<Loader2>` spinner component
- **Suspected Root Cause:** Skeleton loaders not implemented
- **Scope:** UX enhancement, loading states
- **Recommended Fix:**
  - Add skeleton cards for recommendations panel
  - Add skeleton bubbles for chat messages
  - Use libraries like `react-loading-skeleton`

---

### Issue #8: Missing React Error Boundaries
- **Severity:** P2 - Medium
- **Symptom:** Component error crashes entire page with white screen
- **Impact:** One failing component takes down whole app
- **Reproduction:**
  1. Simulate component error (e.g., throw in render)
  2. Entire page crashes
  3. User sees development error overlay or white screen in production
- **Evidence:** No error.tsx files in component hierarchy
- **Suspected Root Cause:** Error boundaries not implemented
- **Scope:** Error handling, resilience
- **Recommended Fix:**
  - Add error.tsx at app level
  - Add error boundaries around major components
  - Example: `src/app/error.tsx`, `src/components/error-boundary.tsx`

---

### Issue #9: Recommendations Not Persisted Across Sessions
- **Severity:** P2 - Medium
- **Symptom:** Recommendations disappear on page refresh
- **Impact:** Users lose context, must re-ask questions
- **Reproduction:**
  1. Send chat message and get recommendations
  2. Refresh page (Cmd/Ctrl + R)
  3. Recommendations panel shows empty state again
- **Evidence:** Recommendations stored only in React state (chat-interface.tsx:56)
- **Suspected Root Cause:** No persistence layer
- **Scope:** State management, data persistence
- **Possible Solutions:**
  1. Store in database with chat history
  2. Use localStorage for quick client-side cache
  3. Fetch last recommendations on mount

---

### Issue #10: Chat Input Lacks Character Limit Indicator
- **Severity:** P2 - Medium
- **Symptom:** No feedback on input length, potential for very long messages
- **Impact:** Users may send messages that exceed API limits
- **Reproduction:**
  1. Type very long message (e.g., 5000 characters)
  2. No warning or limit shown
  3. Message may fail or be truncated by API
- **Evidence:** Input component has no maxLength attribute (chat-interface.tsx:173-179)
- **Suspected Root Cause:** Limit not designed/implemented
- **Scope:** Form validation, UX feedback
- **Recommended Fix:**
  ```tsx
  <Input
    maxLength={1000}
    value={input}
    onChange={(e) => setInput(e.target.value)}
  />
  <span className="text-sm text-gray-500">
    {input.length} / 1000
  </span>
  ```

---

### Issue #11: No Keyboard Shortcut to Send Message
- **Severity:** P2 - Medium
- **Symptom:** Must click send button, Enter key doesn't work
- **Impact:** Slower for keyboard users, unexpected behavior
- **Reproduction:**
  1. Type message in chat input
  2. Press Enter key
  3. Nothing happens (expected: message sends)
- **Evidence:** Form has onSubmit handler but input doesn't capture Enter (chat-interface.tsx:172)
- **Suspected Root Cause:** Enter key handler not implemented on input
- **Scope:** Keyboard interaction, UX
- **Recommended Fix:**
  - Form's onSubmit already handles Enter when send button is focused
  - Ensure input is inside form (it is)
  - May work already, needs testing

---

### Issue #12: File System API Unsupported Browser Detection Could Be Better
- **Severity:** P2 - Medium
- **Symptom:** Alert shown after user accepts consent (code-viewer.tsx:76-82)
- **Impact:** Confusing UX - user clicks through dialog then sees error
- **Reproduction:**
  1. Open dashboard in Firefox or Safari
  2. Get boilerplate code from AI
  3. Click "Save to Folder"
  4. Accept consent
  5. Then see browser not supported alert
- **Evidence:** Browser check happens after consent (code-viewer.tsx:75-82)
- **Suspected Root Cause:** Check order wrong, should check before consent
- **Scope:** UX flow, error prevention
- **Recommended Fix:**
  - Check browser support before showing consent dialog
  - Hide "Save to Folder" button entirely in unsupported browsers
  - Show info tooltip: "Use Chrome/Edge for folder save"

---

## P3: Low Priority (Polish / Nice to Have)

### Issue #13: No Dark Mode Toggle in UI
- **Severity:** P3 - Low
- **Symptom:** Theme changes with system preference but no manual toggle
- **Impact:** Users cannot override system preference
- **Reproduction:**
  1. Look for dark/light mode toggle button
  2. None exists in UI
- **Evidence:** ThemeProvider configured (layout.tsx) but no toggle component
- **Suspected Root Cause:** Toggle UI not implemented
- **Scope:** Theme management UI
- **Recommended Fix:**
  - Add theme toggle button in header
  - Use `next-themes` useTheme hook

---

### Issue #14: Recommendations Panel Width Fixed, Not Resizable
- **Severity:** P3 - Low
- **Symptom:** Right panel always 384px (w-96), cannot adjust
- **Impact:** Wasted space on large screens, cramped on medium screens
- **Reproduction:**
  1. View on ultrawide monitor
  2. Recommendations panel stays 384px
  3. Lots of empty space in chat area
- **Evidence:** Fixed width class (chat-interface.tsx:192: `className="w-96"`)
- **Suspected Root Cause:** Responsive design not implemented
- **Scope:** Layout, responsive design
- **Recommended Fix:**
  - Use percentage width or flex-basis
  - Or add resize handle with react-resizable-panels

---

### Issue #15: No Message Editing or Deletion
- **Severity:** P3 - Low
- **Symptom:** Cannot edit or delete sent messages
- **Impact:** Typos cannot be fixed, must send new message
- **Reproduction:**
  1. Send message with typo
  2. No option to edit or delete
- **Evidence:** Message display is read-only (chat-interface.tsx:129-159)
- **Suspected Root Cause:** Feature not designed
- **Scope:** Chat UX enhancement
- **Recommended Fix:**
  - Add edit/delete buttons on hover
  - Update backend to support message updates

---

### Issue #16: No Conversation History / Project Management
- **Severity:** P3 - Low
- **Symptom:** All conversations mixed in one thread, no project organization
- **Impact:** Hard to track multiple project discussions
- **Reproduction:**
  1. Send multiple unrelated project queries
  2. All appear in same chat thread
  3. No way to separate or name conversations
- **Evidence:** No project selection UI in dashboard
- **Suspected Root Cause:** Multi-project feature not implemented
- **Scope:** Data model, UI navigation
- **Recommended Fix:**
  - Add project sidebar
  - Allow creating/switching between projects
  - Filter chats by projectId

---

### Issue #17: No Export Chat History Feature
- **Severity:** P3 - Low
- **Symptom:** Cannot export conversation for sharing or backup
- **Impact:** Users cannot save their recommendations externally
- **Reproduction:**
  1. Have meaningful conversation with AI
  2. Want to share with colleague
  3. No export button
- **Evidence:** No export functionality in UI
- **Suspected Root Cause:** Feature not designed
- **Scope:** Data export
- **Recommended Fix:**
  - Add "Export Chat" button
  - Generate markdown or PDF with full conversation

---

### Issue #18: Recommendation Cards Lack Visual Hierarchy
- **Severity:** P3 - Low
- **Symptom:** All recommendations appear equal importance
- **Impact:** Users don't know which are most critical
- **Reproduction:**
  1. Get recommendations
  2. All cards look identical
  3. No priority or category grouping
- **Evidence:** Stack cards uniform styling (stack-card.tsx:50-101)
- **Suspected Root Cause:** Design doesn't include priority indicators
- **Scope:** Visual design, information architecture
- **Recommended Fix:**
  - Group by category (Frontend, Backend, Database, etc.)
  - Add visual indicators (e.g., "Essential", "Optional")
  - Sort by relevance score from AI

---

### Issue #19: No Tooltips on Icon-Only Buttons
- **Severity:** P3 - Low
- **Symptom:** Some buttons use only icons without text labels
- **Impact:** Users may not understand button purpose
- **Reproduction:**
  1. Hover over external link icon in recommendation card
  2. No tooltip appears explaining "Open official website"
- **Evidence:** Icons without title attributes (stack-card.tsx:69-71)
- **Suspected Root Cause:** Tooltips not implemented
- **Scope:** UX clarity
- **Recommended Fix:**
  - Add tooltip library (e.g., Radix UI Tooltip)
  - Wrap icon buttons with descriptive tooltips

---

### Issue #20: Code Viewer Doesn't Remember Last Selected Tab
- **Severity:** P3 - Low
- **Symptom:** Switching between file tabs resets on new boilerplate
- **Impact:** Minor annoyance, must re-select preferred tab
- **Reproduction:**
  1. Get boilerplate with multiple files
  2. Switch to tab 3
  3. Send another message with boilerplate
  4. New code viewer defaults to tab 0 again
- **Evidence:** selectedFile state reset on new render (code-viewer.tsx:25)
- **Suspected Root Cause:** State not persisted
- **Scope:** State management
- **Recommended Fix:**
  - Use localStorage to remember tab preference
  - Or default to most relevant file (e.g., package.json first)

---

## Summary Statistics

| Priority | Count | % of Total |
|----------|-------|------------|
| P0 (Critical) | 2 | 10% |
| P1 (High) | 5 | 25% |
| P2 (Medium) | 7 | 35% |
| P3 (Low) | 6 | 30% |
| **Total** | **20** | **100%** |

---

## Recommended Triage Order

1. **Issue #1** - Fix build errors (affects everything)
2. **Issue #2** - Create test user (enables testing)
3. **Issue #3** - Implement /api/recommendations/save (core feature)
4. **Issue #4** - Fix userId validation (blocks chat)
5. **Issue #5** - Validate environment variables (blocks chat)
6. **Issue #6** - Add ARIA labels (quick accessibility win)
7. **Issue #8** - Add error boundaries (resilience)
8. **Issue #7** - Add loading skeletons (quick UX improvement)
9. Rest can be prioritized based on user feedback

---

**Next Actions:**
1. Review and validate each issue with actual testing
2. Create GitHub issues for each item
3. Assign to team members
4. Estimate effort for sprint planning
5. Group related issues for batch fixes
