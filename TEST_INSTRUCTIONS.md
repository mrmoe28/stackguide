# 🧪 StackGuideR - Testing Instructions

## Quick Start

### Option 1: Run Automated E2E Tests

```bash
# Install dependencies if not already installed
pnpm install

# Run tests against production
TEST_URL=https://stackguide-inky.vercel.app pnpm playwright test

# Run tests against localhost
pnpm playwright test

# Run tests with UI (interactive mode)
pnpm playwright test --ui

# Run specific test file
pnpm playwright test e2e/pre-launch-tests.spec.ts

# Generate HTML report
pnpm playwright show-report
```

### Option 2: Manual Testing Checklist

Use the comprehensive `TEST_PLAN.md` file to manually test all features.

---

## 📋 Critical Tests to Run Before Launch

### 1. Authentication Flow (5 min)
```bash
# Test signup
✓ Visit /auth/signup
✓ Create new account
✓ Verify email validation
✓ Verify password strength validation
✓ Check redirect to dashboard

# Test signin
✓ Visit /auth/signin
✓ Login with existing account
✓ Verify wrong password shows error
✓ Check session persists on refresh

# Test signout
✓ Click settings menu
✓ Click "Log Out"
✓ Verify redirect to landing
✓ Verify cannot access /dashboard
```

### 2. Core Features (10 min)
```bash
# Test AI chat
✓ Login to dashboard
✓ Type project description
✓ Verify AI response appears
✓ Check recommendations in sidebar
✓ Verify Claude Code prompt generates

# Test tech stack selection
✓ Click "Add to Stack" on technologies
✓ Verify prompt updates with selection
✓ Test copy button functionality
✓ Verify "X selected" counter
```

### 3. Share Feature (5 min)
```bash
# Test share link
✓ Get AI recommendations
✓ Click "Export & Share"
✓ Click "Copy Share Link"
✓ Open link in incognito mode
✓ Verify recommendations display
✓ Check view counter increments
✓ Verify no auth required
```

### 4. Profile Settings (3 min)
```bash
# Test settings page
✓ Navigate to /settings
✓ Verify form fields are editable
✓ Check dark/light modes
✓ Verify "Save Changes" button
✓ Test back navigation
```

### 5. Mobile Responsiveness (5 min)
```bash
# Test mobile layout
✓ Open DevTools (F12)
✓ Toggle device toolbar
✓ Test iPhone 12 viewport
✓ Test Pixel 5 viewport
✓ Verify all features work
✓ Check touch interactions
```

---

## 🚨 Known Issues to Check

### High Priority
- [ ] Share links work in production
- [ ] Database connections are stable
- [ ] Authentication persists correctly
- [ ] AI responses are accurate

### Medium Priority
- [ ] Dark mode transitions smoothly
- [ ] Mobile navigation is intuitive
- [ ] Loading states are clear
- [ ] Error messages are helpful

### Low Priority
- [ ] Animations are smooth on all devices
- [ ] Hover effects work properly
- [ ] Empty states are informative

---

## 🔧 Test Environment Setup

### Local Testing
```bash
# 1. Start dev server
pnpm dev

# 2. Open browser to http://localhost:3000

# 3. Run tests in separate terminal
pnpm playwright test
```

### Production Testing
```bash
# Test against live site
TEST_URL=https://stackguide-inky.vercel.app pnpm playwright test

# Or manually test at:
https://stackguide-inky.vercel.app
```

---

## 📊 Test Results Interpretation

### Playwright Test Output
- **✓ Green**: Test passed
- **✗ Red**: Test failed (investigate immediately)
- **⊘ Yellow**: Test skipped

### Expected Pass Rate
- **Critical tests**: 100% must pass
- **Overall tests**: ≥95% should pass
- **Mobile tests**: ≥90% should pass

---

## 🐛 If Tests Fail

### Common Failures

**Authentication failures:**
```bash
# Check environment variables
echo $DATABASE_URL
echo $NEXTAUTH_SECRET

# Verify user exists in database
# Or create test user manually
```

**Timeout errors:**
```bash
# Increase timeout in playwright.config.ts
# Or check server response time
```

**Element not found:**
```bash
# Run test in UI mode to debug
pnpm playwright test --ui

# Check if selectors need updating
```

---

## 📝 Reporting Issues

### Template for Bug Reports
```markdown
**Test:** [Test name]
**Browser:** [Chrome/Firefox/Safari]
**URL:** [Page where issue occurred]
**Steps:**
1. [Step 1]
2. [Step 2]
3. [Expected vs Actual]

**Screenshots:** [Attach if available]
**Console Errors:** [Copy any errors]
```

---

## ✅ Pre-Launch Checklist

Before pushing to marketplace:

### Code Quality
- [ ] `pnpm lint` passes with 0 errors
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` completes successfully
- [ ] No console errors in production

### Functionality
- [ ] All auth flows work
- [ ] AI chat responds correctly
- [ ] Share links work
- [ ] Profile settings save
- [ ] Dark mode works

### Performance
- [ ] Pages load in < 3s
- [ ] No memory leaks
- [ ] Images are optimized
- [ ] APIs respond quickly

### Security
- [ ] Environment variables are secure
- [ ] Protected routes require auth
- [ ] No sensitive data exposed
- [ ] HTTPS enabled

### Accessibility
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus indicators visible

### Mobile
- [ ] Responsive on all devices
- [ ] Touch targets are 44x44px min
- [ ] No horizontal scroll
- [ ] Gestures work properly

---

## 🎯 Launch Day Testing Protocol

**1 hour before launch:**
- [ ] Run full automated test suite
- [ ] Manually test critical paths
- [ ] Check production environment variables
- [ ] Verify database connections
- [ ] Test from multiple devices

**Immediately after launch:**
- [ ] Monitor Vercel deployment logs
- [ ] Check error tracking (if configured)
- [ ] Test live URL from different locations
- [ ] Verify SSL certificate
- [ ] Check DNS propagation

**First 24 hours:**
- [ ] Monitor user signups
- [ ] Check for error spikes
- [ ] Review performance metrics
- [ ] Gather user feedback

---

## 🚀 Post-Launch Monitoring

### Key Metrics to Track
- User signups per hour
- Average response time
- Error rate
- API success rate
- Share link creation rate

### Tools
- Vercel Analytics (built-in)
- Browser console for errors
- Database query logs
- GitHub Issues for bug reports

---

## 📞 Support

If you encounter critical issues:
1. Stop automated deployments
2. Check Vercel logs: `vercel logs`
3. Roll back if necessary: `vercel rollback`
4. Fix issue locally and test
5. Deploy fix: `git push`

---

**Remember:** It's better to delay launch and fix issues than to launch with bugs!

**Good luck with your launch! 🎉**
