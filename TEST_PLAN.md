# StackGuideR - Pre-Launch Test Plan

## 🎯 Test Coverage Overview

This document outlines all features that need testing before marketplace launch.

---

## 1. Authentication Flow

### Sign Up (NEW USER)
- [ ] Navigate to landing page at https://stackguide-inky.vercel.app
- [ ] Click "Get Started" or "Sign Up"
- [ ] Enter new email, password (8+ chars with uppercase, lowercase, number), and name
- [ ] Submit form
- [ ] Verify redirect to dashboard after successful signup
- [ ] Verify user session is created

### Sign In (EXISTING USER)
- [ ] Navigate to /auth/signin
- [ ] Enter valid email and password
- [ ] Click "Sign In"
- [ ] Verify redirect to dashboard
- [ ] Verify session persists after page refresh

### Sign Out
- [ ] From dashboard, click Settings icon (gear)
- [ ] Click "Log Out"
- [ ] Verify redirect to landing page
- [ ] Verify session is cleared (cannot access /dashboard)

### Protected Routes
- [ ] Try accessing /dashboard without authentication → should redirect to /auth/signin
- [ ] Try accessing /settings without authentication → should redirect to /auth/signin
- [ ] Landing page should be accessible without auth

---

## 2. Landing Page

### Visual Elements
- [ ] Hero section displays properly with gradient text
- [ ] Animated background blobs are visible and animating
- [ ] Navigation bar shows "Sign In" and "Get Started" buttons
- [ ] Three feature cards display correctly:
  - AI-Powered Suggestions
  - Ready-to-Use Prompts
  - Best Practices Built-In
- [ ] GitHub link works and opens in new tab
- [ ] Footer information displays correctly

### Responsive Design
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1920px)

---

## 3. Dashboard

### Layout
- [ ] Header displays "StackGuideR" logo and title
- [ ] User email displays in header
- [ ] Settings menu icon is visible and clickable
- [ ] Left sidebar shows "Recent Projects" section
- [ ] Main chat interface is visible
- [ ] Right sidebar shows "Tech Stack" panel

### Chat Interface
- [ ] Initial welcome message displays
- [ ] Input field is functional
- [ ] "New Chat" button works
- [ ] Empty state shows animated icon and helpful text

---

## 4. AI Chat Recommendations

### Basic Flow
- [ ] Type a project description (e.g., "I want to build a social media app")
- [ ] Click send or press Enter
- [ ] Verify loading spinner appears
- [ ] Verify AI response appears in chat
- [ ] Verify recommendations appear in right sidebar

### Recommendations Display
- [ ] Each recommendation shows:
  - Technology name
  - Category badge
  - Description
  - Icon (if available)
  - "Add to Stack" button
- [ ] Cost Estimate card displays at top of recommendations
- [ ] Technologies are grouped by category

### Tech Stack Selection
- [ ] Click "Add to Stack" on a technology
- [ ] Verify checkmark appears
- [ ] Verify technology is added to selected stack
- [ ] Verify Claude Code Prompt updates with selected technologies
- [ ] Verify "X selected" counter appears

### Claude Code Prompt
- [ ] Verify prompt generates after AI response
- [ ] Verify prompt is in purple/pink gradient box
- [ ] Verify copy button works
- [ ] Verify "Copied!" confirmation appears
- [ ] Verify customized prompt shows when technologies are selected

---

## 5. Recent Projects (Sidebar)

### Display
- [ ] Loading spinner shows while fetching
- [ ] Projects display after loading
- [ ] Each project shows:
  - Project name
  - Last message preview (or description)
  - Time stamp (Today, Yesterday, X days ago)
  - Delete button on hover

### Empty State
- [ ] If no projects, shows helpful empty state message

### Interactions
- [ ] Click project to load its chat history (TODO: not yet implemented)
- [ ] Hover shows delete button
- [ ] Click delete removes project from list

---

## 6. Export & Share

### Share Link Generation
- [ ] After getting recommendations, click "Export & Share"
- [ ] Click "Copy Share Link"
- [ ] Verify success toast/message appears
- [ ] Paste link in new incognito window
- [ ] Verify recommendations display without authentication

### Shared Page Display
- [ ] Project title and description show
- [ ] All recommendations display correctly
- [ ] Categories are properly grouped
- [ ] View counter increments
- [ ] CTA section encourages signup
- [ ] "Try StackGuideR" button links to landing page

### Export Features
- [ ] "Export as JSON" downloads proper file (if implemented)
- [ ] "Export as Markdown" downloads proper file (if implemented)

---

## 7. Profile Settings

### Navigation
- [ ] Click Settings icon in dashboard header
- [ ] Click "Profile Settings"
- [ ] Verify redirect to /settings page

### Visual Design
- [ ] Gradient background with animated blobs
- [ ] Glassmorphism header
- [ ] White card with good contrast (not too dark)
- [ ] All text is readable in both light and dark modes

### Form Fields
- [ ] Full Name input works
- [ ] Email input works (shows current email)
- [ ] Bio textarea works
- [ ] Company input works
- [ ] Location input works

### Actions
- [ ] "Save Changes" button shows loading state
- [ ] Back arrow returns to dashboard
- [ ] "Change Password" button exists
- [ ] "Delete Account" button exists (red styling)

---

## 8. Dark Mode

### Theme Toggle
- [ ] Find theme toggle in settings menu
- [ ] Switch between light and dark modes
- [ ] Verify all pages respect theme choice:
  - Landing page
  - Sign in/up pages
  - Dashboard
  - Settings page
  - Shared recommendation pages

### Visual Checks
- [ ] Text contrast is sufficient in both modes
- [ ] Backgrounds transition smoothly
- [ ] Icons are visible in both modes
- [ ] Gradients look good in both modes

---

## 9. Error Handling

### Authentication Errors
- [ ] Wrong password shows error message
- [ ] Invalid email format shows validation error
- [ ] Weak password shows validation error
- [ ] Duplicate email on signup shows error

### Chat Errors
- [ ] Network error shows friendly message
- [ ] API timeout shows error message
- [ ] Empty message doesn't send

### 404 Pages
- [ ] Invalid share link shows 404 or error
- [ ] Invalid route shows 404
- [ ] 404 page has way to return to app

---

## 10. Performance

### Load Times
- [ ] Landing page loads in < 2s
- [ ] Dashboard loads in < 2s
- [ ] Chat response appears in < 10s
- [ ] Share page loads in < 2s

### Animations
- [ ] Background blobs animate smoothly
- [ ] Hover effects are smooth (no jank)
- [ ] Loading spinners spin smoothly
- [ ] Page transitions are smooth

---

## 11. Database & Persistence

### User Data
- [ ] Sign up creates user in database
- [ ] User can sign in after signup
- [ ] User session persists across page refreshes
- [ ] Sign out clears session properly

### Projects
- [ ] Chat creates project in database (if implemented)
- [ ] Projects appear in sidebar after creation
- [ ] Projects sorted by most recent activity
- [ ] Delete removes project from database

### Shared Links
- [ ] Share link creates record in database
- [ ] Share link is accessible without auth
- [ ] View count increments on each visit
- [ ] Share link persists after creator logs out

---

## 12. Security

### Authentication
- [ ] Cannot access dashboard without login
- [ ] Cannot access settings without login
- [ ] JWT tokens are properly secured
- [ ] Session expires after appropriate time

### Data Privacy
- [ ] Users can only see their own projects
- [ ] Users can only access their own data
- [ ] Shared links are truly public (no auth required)
- [ ] API endpoints validate user authentication

### Input Validation
- [ ] XSS attempts are prevented
- [ ] SQL injection attempts are prevented
- [ ] All inputs are properly sanitized
- [ ] File uploads are validated (if any)

---

## 13. Accessibility

### Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Enter submits forms
- [ ] Escape closes modals (if any)
- [ ] Focus indicators are visible

### Screen Reader
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have descriptive text
- [ ] Landmarks are properly defined

### Color Contrast
- [ ] Text meets WCAG AA standards
- [ ] Interactive elements are distinguishable
- [ ] Focus states are visible
- [ ] Error messages are clear

---

## 14. Mobile Responsiveness

### Mobile Layout (375px - 768px)
- [ ] Landing page is fully responsive
- [ ] Sign in/up forms work on mobile
- [ ] Dashboard adapts to mobile
- [ ] Chat interface is usable on mobile
- [ ] Sidebar collapses or adapts
- [ ] Settings page works on mobile
- [ ] Share page is mobile-friendly

### Touch Interactions
- [ ] Buttons are large enough (44x44px min)
- [ ] Forms are easy to fill
- [ ] No horizontal scrolling
- [ ] Pinch-to-zoom works where appropriate

---

## 15. Browser Compatibility

### Chrome
- [ ] All features work correctly

### Firefox
- [ ] All features work correctly

### Safari
- [ ] All features work correctly

### Edge
- [ ] All features work correctly

### Mobile Browsers
- [ ] iOS Safari works correctly
- [ ] Chrome Mobile works correctly

---

## 16. API Endpoints

### POST /api/auth/signup
- [ ] Creates new user successfully
- [ ] Returns appropriate errors
- [ ] Password is hashed in database

### POST /api/chat
- [ ] Returns AI recommendations
- [ ] Handles errors gracefully
- [ ] Returns proper JSON format

### GET /api/projects
- [ ] Returns user's projects
- [ ] Requires authentication
- [ ] Returns empty array if no projects

### POST /api/share
- [ ] Creates share link
- [ ] Returns short ID
- [ ] Saves to database

---

## 17. Edge Cases

### Empty States
- [ ] No projects yet (sidebar)
- [ ] No recommendations yet (right panel)
- [ ] No chat history (main area)

### Long Content
- [ ] Very long project descriptions
- [ ] Many recommendations (20+)
- [ ] Long chat conversations
- [ ] Long technology names

### Network Issues
- [ ] Offline message handling
- [ ] Slow connection handling
- [ ] Request timeout handling

---

## 18. Final Checks Before Launch

### Code Quality
- [ ] Run `pnpm lint` - no errors
- [ ] Run `pnpm typecheck` - no errors
- [ ] Run `pnpm build` - builds successfully
- [ ] No console errors in production

### Environment Variables
- [ ] All production env vars are set in Vercel
- [ ] Database connection works
- [ ] API keys are valid
- [ ] NEXTAUTH_SECRET is secure

### Deployment
- [ ] Latest code is pushed to GitHub
- [ ] Vercel auto-deployed successfully
- [ ] Custom domain is configured (if any)
- [ ] SSL certificate is valid

### Documentation
- [ ] README is up to date
- [ ] API documentation exists
- [ ] User guide exists (if needed)
- [ ] Changelog is current

---

## Test Results Summary

**Date:** _____________

**Tester:** _____________

**Pass Rate:** _____ / _____ tests passed

**Critical Issues:** _____________

**Minor Issues:** _____________

**Ready for Launch:** ☐ Yes  ☐ No

---

## Notes & Observations

_Use this space to document any issues, suggestions, or observations during testing._

---

**Next Steps After Testing:**
1. Fix all critical issues
2. Address high-priority minor issues
3. Document known limitations
4. Prepare launch announcement
5. Monitor production after launch
