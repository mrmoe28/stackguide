# Implementation Plan - Dashboard Fixes & Improvements

**Generated:** 2025-10-07
**Project:** StackGuideR Dashboard
**Planning Horizon:** 3 Milestones
**Total Estimated Effort:** ~40-60 hours

---

## Milestone 1: Critical Fixes (P0 + Foundation)

**Goal:** Fix showstopper bugs and establish testing foundation
**Timeline:** Week 1 (3-5 days)
**Total Effort:** ~12-16 hours
**Risk:** LOW - Well-documented fixes

### M1.1: Fix Build Module Errors
- **Owner:** unassigned
- **Effort:** 0.5 hours
- **Tasks:**
  1. Clear `.next` directory: `rm -rf .next`
  2. Reinstall dependencies: `rm -rf node_modules && pnpm install`
  3. Run clean build: `pnpm build`
  4. Verify dev server starts without errors
  5. Add `clean` scripts to package.json
- **Acceptance Criteria:**
  - ✅ Dev server starts without module not found errors
  - ✅ No webpack chunk errors in console
  - ✅ `/api/chat` route loads successfully
- **Dependencies:** None
- **Risks:** Low - Standard Next.js troubleshooting

---

### M1.2: Create Test User Account
- **Owner:** unassigned
- **Effort:** 1-2 hours
- **Tasks:**
  1. Create seed script: `src/lib/db/seed.ts`
  2. Hash password with bcryptjs
  3. Insert test user with UUID: `test@example.com / Test123456!`
  4. Add seed script to package.json
  5. Document test credentials in .env.example
  6. Run seed: `pnpm db:seed`
- **Acceptance Criteria:**
  - ✅ Test user exists in database
  - ✅ Can log in with test credentials
  - ✅ User ID is valid UUID format
- **Dependencies:** Database connection, NextAuth configured
- **Risks:** Medium - Requires database access

---

### M1.3: Fix User ID UUID Validation
- **Owner:** unassigned
- **Effort:** 2-3 hours
- **Tasks:**
  1. Create `types/next-auth.d.ts` with Session extension
  2. Add session callback to auth config
  3. Ensure database users table uses UUID primary key
  4. Test chat API with authenticated user
  5. Update validation schema if needed (either enforce UUID or accept any string)
- **Acceptance Criteria:**
  - ✅ Session includes user.id property
  - ✅ Chat API accepts userId without validation errors
  - ✅ TypeScript types are correct
- **Dependencies:** M1.2 (test user), NextAuth configured
- **Risks:** Medium - Type system integration

---

### M1.4: Validate Environment Variables on Startup
- **Owner:** unassigned
- **Effort:** 1-2 hours
- **Tasks:**
  1. Create `src/lib/env.ts` with Zod validation
  2. Validate required env vars: DATABASE_URL, NEXTAUTH_*, ANTHROPIC_API_KEY
  3. Call validation in `src/app/layout.tsx` or middleware
  4. Provide helpful error messages when vars missing
  5. Update .env.example with all required vars
- **Acceptance Criteria:**
  - ✅ App fails fast with clear message when env vars missing
  - ✅ All required variables documented
  - ✅ No runtime errors due to missing configuration
- **Dependencies:** None
- **Risks:** Low - Standard validation

---

### M1.5: Run Playwright Test Suite
- **Owner:** unassigned
- **Effort:** 2-3 hours
- **Tasks:**
  1. Install Playwright browsers (if not done): `npx playwright install`
  2. Run smoke tests: `npx playwright test 00-smoke.spec.ts`
  3. Fix any test failures
  4. Run full suite: `npx playwright test`
  5. Generate HTML report: `npx playwright show-report`
  6. Document results in TEST_REPORT.md
- **Acceptance Criteria:**
  - ✅ At least 30/42 tests pass
  - ✅ All P0/P1 features have passing tests
  - ✅ Screenshots captured for evidence
- **Dependencies:** M1.1, M1.2, M1.3
- **Risks:** High - Many tests may fail initially

---

### M1.6: Implement Error Boundaries
- **Owner:** unassigned
- **Effort:** 2-3 hours
- **Tasks:**
  1. Create `src/app/dashboard/error.tsx` with 'use client' directive
  2. Create `src/app/error.tsx` for app-level errors
  3. Create `src/app/global-error.tsx` for root errors
  4. Add error logging to external service (optional)
  5. Test by throwing errors in components
- **Acceptance Criteria:**
  - ✅ Component errors don't crash entire page
  - ✅ User sees friendly error message with "Try again" button
  - ✅ Errors logged for debugging
- **Dependencies:** None
- **Risks:** Low - Well-documented Next.js feature

---

### M1.7: Add Loading Skeletons
- **Owner:** unassigned
- **Effort:** 2-3 hours
- **Tasks:**
  1. Install `react-loading-skeleton` or use custom
  2. Create skeleton components for:
     - Chat message bubbles
     - Recommendation cards
     - Code viewer
  3. Show skeletons during loading states
  4. Test with slow network throttling
- **Acceptance Criteria:**
  - ✅ Users see content structure while loading
  - ✅ Smooth transition from skeleton to real content
  - ✅ Improves perceived performance
- **Dependencies:** None
- **Risks:** Low - UI enhancement

---

**Milestone 1 Summary:**
- **Tasks:** 7
- **Effort:** 12-16 hours
- **Dependencies:** Sequential (M1.1 → M1.2 → M1.3 → M1.5)
- **Deliverables:**
  - Working build system
  - Test user account
  - UUID validation fixed
  - Error boundaries implemented
  - Loading UX improved
  - Test results documented

---

## Milestone 2: Core Features (P1 + Key UX)

**Goal:** Implement missing core features and improve accessibility
**Timeline:** Week 2-3 (7-10 days)
**Total Effort:** ~18-24 hours
**Risk:** MEDIUM - Requires new API development

### M2.1: Implement /api/recommendations/save Endpoint
- **Owner:** unassigned
- **Effort:** 3-4 hours
- **Tasks:**
  1. Review database schema for recommendations table
  2. Create `src/app/api/recommendations/save/route.ts`
  3. Add Zod validation schema
  4. Implement POST handler with authentication check
  5. Use Drizzle `.insert().returning()` pattern
  6. Add error handling (try/catch with appropriate status codes)
  7. Test with Postman or curl
  8. Update frontend to handle success/error responses
- **Acceptance Criteria:**
  - ✅ Endpoint returns 200 on successful save
  - ✅ Returns 400 for validation errors
  - ✅ Returns 401 for unauthorized requests
  - ✅ Data persists in database
  - ✅ "Add to Stack" button works end-to-end
- **Dependencies:** M1.2 (test user), M1.3 (UUID validation)
- **Risks:** Medium - Requires database schema alignment

---

### M2.2: Add ARIA Labels for Accessibility
- **Owner:** unassigned
- **Effort:** 2-3 hours
- **Tasks:**
  1. Add `aria-label` to chat input: "Describe your project requirements"
  2. Add `aria-label` to send button: "Send message"
  3. Add `aria-label` to sign out button: "Sign out of account"
  4. Add `aria-label` to external link icons: "Open official website"
  5. Add `aria-label` to "Add to Stack" buttons: "Save {techName} to your stack"
  6. Run axe-core scan to verify fixes
  7. Test with screen reader (VoiceOver/NVDA)
- **Acceptance Criteria:**
  - ✅ All interactive elements have accessible names
  - ✅ axe-core scan passes with 0 critical violations
  - ✅ Screen reader announces elements correctly
- **Dependencies:** None
- **Risks:** Low - Straightforward attribute additions

---

### M2.3: Improve Recommendations Persistence
- **Owner:** unassigned
- **Effort:** 3-4 hours
- **Tasks:**
  1. Decide on persistence strategy (database vs localStorage)
  2. If database: Fetch last recommendations on dashboard mount
  3. If localStorage: Store/retrieve recommendations array
  4. Update ChatInterface to load persisted data
  5. Clear old recommendations on new query (or keep history)
  6. Add loading state for fetching recommendations
- **Acceptance Criteria:**
  - ✅ Recommendations survive page refresh
  - ✅ User doesn't lose context when navigating away
  - ✅ Performance impact is minimal
- **Dependencies:** M2.1 if using database
- **Risks:** Medium - Design decision impacts UX

---

### M2.4: Add Chat Input Character Limit
- **Owner:** unassigned
- **Effort:** 1 hour
- **Tasks:**
  1. Add `maxLength={1000}` attribute to input
  2. Add character counter: `{input.length} / 1000`
  3. Style counter (gray normally, red when approaching limit)
  4. Show warning at 90% capacity
  5. Test edge cases (paste long text)
- **Acceptance Criteria:**
  - ✅ Input limited to 1000 characters
  - ✅ Counter visible to user
  - ✅ Visual feedback when approaching limit
- **Dependencies:** None
- **Risks:** Low - Simple validation

---

### M2.5: Fix File System API Browser Check Order
- **Owner:** unassigned
- **Effort:** 1-2 hours
- **Tasks:**
  1. Move browser support check before consent dialog
  2. Hide "Save to Folder" button in unsupported browsers
  3. Show tooltip: "Use Chrome/Edge for folder save"
  4. Or show alternative message: "Download available for all browsers"
  5. Test in Firefox, Safari, Chrome
- **Acceptance Criteria:**
  - ✅ Users don't see confusing error after accepting consent
  - ✅ Clear guidance on browser compatibility
  - ✅ Fallback download works in all browsers
- **Dependencies:** None
- **Risks:** Low - Logic reordering

---

### M2.6: Implement Keyboard Shortcut for Send
- **Owner:** unassigned
- **Effort:** 1 hour
- **Tasks:**
  1. Verify form onSubmit already handles Enter (it should)
  2. If not, add onKeyDown handler to input: check for Enter key
  3. Prevent default behavior
  4. Trigger send if input not empty
  5. Test with keyboard only (no mouse)
- **Acceptance Criteria:**
  - ✅ Enter key sends message
  - ✅ Shift+Enter creates new line (if applicable)
  - ✅ Works consistently across browsers
- **Dependencies:** None
- **Risks:** Low - May already work

---

### M2.7: Add Project Management UI (Stretch)
- **Owner:** unassigned
- **Effort:** 6-8 hours
- **Tasks:**
  1. Design project sidebar UI
  2. Create projects API endpoints (CRUD)
  3. Add project selector dropdown or sidebar
  4. Filter chats by selected project
  5. Add "New Project" button
  6. Store projectId in chat messages
  7. Update database queries to filter by project
- **Acceptance Criteria:**
  - ✅ Users can create multiple projects
  - ✅ Conversations are organized by project
  - ✅ Can switch between projects
  - ✅ Project names are editable
- **Dependencies:** M2.1, M2.3
- **Risks:** High - Significant feature addition
- **Note:** STRETCH GOAL - May defer to M3

---

**Milestone 2 Summary:**
- **Tasks:** 7 (6 required + 1 stretch)
- **Effort:** 18-24 hours (excluding stretch goal)
- **Dependencies:** M1 completion recommended
- **Deliverables:**
  - Recommendations can be saved
  - Full accessibility compliance
  - Improved UX (limits, keyboard shortcuts)
  - Better browser compatibility handling
  - (Optional) Multi-project support

---

## Milestone 3: Polish & Enhancements (P2/P3)

**Goal:** Improve UX, add nice-to-have features, optimize performance
**Timeline:** Week 4-5 (5-7 days)
**Total Effort:** ~10-20 hours
**Risk:** LOW - All optional enhancements

### M3.1: Add Dark Mode Toggle UI
- **Owner:** unassigned
- **Effort:** 1-2 hours
- **Tasks:**
  1. Install theme toggle component (ShadCN or custom)
  2. Add button to header
  3. Use `next-themes` useTheme hook
  4. Test theme switching
  5. Persist preference
- **Acceptance Criteria:**
  - ✅ Toggle button visible in header
  - ✅ Switches between light/dark/system
  - ✅ Preference persists across sessions
- **Dependencies:** None
- **Risks:** Low - Theme system already configured

---

### M3.2: Make Recommendations Panel Resizable
- **Owner:** unassigned
- **Effort:** 2-3 hours
- **Tasks:**
  1. Install `react-resizable-panels` or similar
  2. Replace fixed w-96 with resizable panel
  3. Add resize handle with visual indicator
  4. Set min/max width constraints
  5. Persist panel size in localStorage
- **Acceptance Criteria:**
  - ✅ Users can drag to resize recommendations panel
  - ✅ Size persists on refresh
  - ✅ Responsive on mobile (collapsible)
- **Dependencies:** None
- **Risks:** Low - Library handles complexity

---

### M3.3: Add Message Editing/Deletion
- **Owner:** unassigned
- **Effort:** 3-4 hours
- **Tasks:**
  1. Add edit/delete buttons on message hover
  2. Implement edit mode with save/cancel
  3. Create API endpoint for message updates
  4. Update database on edit/delete
  5. Show "edited" indicator on edited messages
  6. Confirm before delete
- **Acceptance Criteria:**
  - ✅ Users can edit their own messages
  - ✅ Users can delete their own messages
  - ✅ Changes persist to database
- **Dependencies:** M2.1 (API pattern)
- **Risks:** Medium - Requires careful state management

---

### M3.4: Implement Chat Export Feature
- **Owner:** unassigned
- **Effort:** 2-3 hours
- **Tasks:**
  1. Add "Export Chat" button to header
  2. Generate markdown with full conversation
  3. Include recommendations in export
  4. Format with timestamps and metadata
  5. Offer download as .md or .pdf
  6. Test with long conversations
- **Acceptance Criteria:**
  - ✅ Users can export full conversation
  - ✅ Export includes all messages and recommendations
  - ✅ Format is readable and shareable
- **Dependencies:** None
- **Risks:** Low - Similar to existing download feature

---

### M3.5: Add Tooltips to Icon Buttons
- **Owner:** unassigned
- **Effort:** 1-2 hours
- **Tasks:**
  1. Install tooltip library (Radix UI Tooltip or similar)
  2. Wrap icon-only buttons with tooltip
  3. Add descriptive messages
  4. Test hover and keyboard navigation
  5. Ensure mobile fallback (long press or tap)
- **Acceptance Criteria:**
  - ✅ All icon buttons have descriptive tooltips
  - ✅ Tooltips appear on hover
  - ✅ Accessible via keyboard
- **Dependencies:** None
- **Risks:** Low - Standard pattern

---

### M3.6: Improve Recommendation Card Visual Hierarchy
- **Owner:** unassigned
- **Effort:** 2-3 hours
- **Tasks:**
  1. Group recommendations by category
  2. Add visual separators/headers
  3. Implement priority badges (Essential, Recommended, Optional)
  4. Add sorting options (by category, relevance)
  5. Consider card animations/transitions
- **Acceptance Criteria:**
  - ✅ Recommendations are visually organized
  - ✅ Users can easily scan priorities
  - ✅ Grouping makes sense
- **Dependencies:** M2.1 (may need schema changes for priority)
- **Risks:** Low - Primarily CSS changes

---

### M3.7: Remember Code Viewer Tab Preference
- **Owner:** unassigned
- **Effort:** 1 hour
- **Tasks:**
  1. Store selected tab index in localStorage
  2. Restore on mount
  3. Or use smart default (e.g., README.md first)
  4. Test across multiple boilerplate responses
- **Acceptance Criteria:**
  - ✅ Tab preference persists
  - ✅ Improves UX for repeated interactions
- **Dependencies:** None
- **Risks:** Low - Simple state persistence

---

### M3.8: Performance Optimization Pass
- **Owner:** unassigned
- **Effort:** 3-4 hours
- **Tasks:**
  1. Run Lighthouse audit
  2. Optimize bundle size (analyze with `next/bundle-analyzer`)
  3. Add React.memo to expensive components
  4. Implement code splitting for heavy dependencies
  5. Optimize images (use next/image everywhere)
  6. Add Suspense boundaries for async components
  7. Measure and document improvements
- **Acceptance Criteria:**
  - ✅ Lighthouse score > 90
  - ✅ First Contentful Paint < 1.5s
  - ✅ Time to Interactive < 3s
  - ✅ Bundle size reduced by at least 10%
- **Dependencies:** All previous milestones complete
- **Risks:** Low - Standard optimization techniques

---

**Milestone 3 Summary:**
- **Tasks:** 8
- **Effort:** 15-22 hours
- **Dependencies:** M1, M2 completion recommended
- **Deliverables:**
  - Polished UI with theme toggle
  - Enhanced chat features (edit/delete/export)
  - Better visual organization
  - Performance improvements
  - Overall better UX

---

## Summary & Timeline

### Effort Breakdown

| Milestone | Tasks | Hours | Complexity |
|-----------|-------|-------|------------|
| M1: Critical Fixes | 7 | 12-16 | Low-Medium |
| M2: Core Features | 7 | 18-24 | Medium-High |
| M3: Polish | 8 | 15-22 | Low-Medium |
| **Total** | **22** | **45-62** | **Mixed** |

### Recommended Timeline

- **Week 1:** M1 (Critical Fixes) - 3-5 days
- **Week 2-3:** M2 (Core Features) - 7-10 days
- **Week 4-5:** M3 (Polish) - 5-7 days
- **Total:** 4-5 weeks for complete implementation

### Priority Execution Order

1. **Must Do First:**
   - M1.1 Fix build errors
   - M1.2 Create test user
   - M1.3 UUID validation
   - M1.4 Environment validation

2. **Do Next:**
   - M1.5 Run tests
   - M1.6 Error boundaries
   - M2.1 Implement save endpoint
   - M2.2 ARIA labels

3. **Then:**
   - M2.3-M2.6 UX improvements
   - M1.7 Loading skeletons

4. **Finally:**
   - M3.* All polish items

### Risk Mitigation

- **High Risk Items:**
  - M1.5 Test execution (may reveal unexpected issues)
  - M2.1 API endpoint (requires schema validation)
  - M2.7 Project management (large scope)

- **Mitigation Strategies:**
  - Run tests early and often
  - Review database schema before implementing endpoints
  - Consider deferring M2.7 to separate sprint
  - Maintain comprehensive documentation
  - Use feature flags for gradual rollout

### Success Metrics

- **Code Quality:**
  - 0 TypeScript errors
  - 0 ESLint errors
  - 90%+ test coverage for new code

- **Functionality:**
  - All P0/P1 issues resolved
  - 95%+ test pass rate
  - No critical bugs in production

- **Accessibility:**
  - 0 axe-core critical violations
  - WCAG 2.1 AA compliance
  - Keyboard navigation fully functional

- **Performance:**
  - Lighthouse score > 90
  - API response time < 3s (P95)
  - Page load time < 2s

---

**Plan Status:** DRAFT - Ready for Review
**Last Updated:** 2025-10-07
**Next Steps:** Begin M1 implementation after stakeholder approval
