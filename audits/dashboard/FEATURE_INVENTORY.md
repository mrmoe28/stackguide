# Feature Inventory - Dashboard Page

**Page:** `/dashboard`
**URL:** `http://localhost:3002/dashboard`
**Generated:** 2025-10-07
**Framework:** Next.js 15.5.4 (App Router)

---

## Overview

The Dashboard page is the main application interface for authenticated users. It consists of a two-panel layout: a chat interface on the left and a recommendations panel on the right.

---

## Interactive Elements & Features

### 1. Header Section

#### 1.1 Application Title
- **Element:** `<h1>StackGuideR</h1>`
- **Location:** Top-left header
- **Selector:** `header h1`
- **Purpose:** Display application branding
- **Behavior:** Static text display
- **Dependencies:** None
- **Test Priority:** P3 (Low - display only)

#### 1.2 User Email Display
- **Element:** `<span>{session.user?.email || 'User'}</span>`
- **Location:** Top-right header
- **Selector:** `header span.text-sm`
- **Purpose:** Show currently logged-in user's email
- **Behavior:** Displays user's email from session
- **Dependencies:** NextAuth session
- **Test Priority:** P2 (Medium - should display correct email)

#### 1.3 Sign Out Button
- **Element:** `<SignOutButton />`
- **Location:** Top-right header
- **Selector:** `button` (contains "Sign Out")
- **Purpose:** Log out the current user
- **Expected Behavior:**
  - Calls `signOut({ callbackUrl: '/auth/signin' })`
  - Redirects to sign-in page
  - Clears session
- **Dependencies:** NextAuth
- **Test Priority:** P1 (High - critical auth function)

---

### 2. Chat Interface (Left Panel)

#### 2.1 Message Display Area
- **Element:** `<ScrollArea>` with messages
- **Location:** Main chat area
- **Selector:** `div.space-y-4` (contains messages)
- **Purpose:** Display conversation history
- **Behavior:**
  - Shows user and assistant messages
  - Auto-scrolls to bottom on new message
  - Different styling for user vs assistant messages
- **Dependencies:** None (static display)
- **Test Priority:** P1 (High - core functionality)

#### 2.2 Message Bubbles
- **User Messages:**
  - Blue background (`bg-blue-600`)
  - Right-aligned (`justify-end`)
  - Max width 80%
- **Assistant Messages:**
  - Gray background (`bg-gray-100 dark:bg-gray-800`)
  - Left-aligned (`justify-start`)
  - May include recommendations and boilerplate code
  - Max width 80%

#### 2.3 Chat Input Field
- **Element:** `<Input>` component
- **Location:** Bottom of chat panel
- **Selector:** `input[placeholder="Describe your project..."]`
- **Purpose:** Accept user input for chat messages
- **Expected Behavior:**
  - Accepts text input
  - Disabled when loading
  - Clears after message submission
- **Dependencies:** None
- **Test Priority:** P1 (High - required for core function)

#### 2.4 Send Button
- **Element:** `<Button>` with Send icon
- **Location:** Right of input field
- **Selector:** `button[type="submit"]`
- **Purpose:** Submit chat message
- **Expected Behavior:**
  - Disabled when input is empty or loading
  - Shows loading spinner during API call
  - Triggers POST to `/api/chat`
- **Dependencies:**
  - `/api/chat` API endpoint
  - `ANTHROPIC_API_KEY` environment variable
- **Test Priority:** P0 (Critical - primary action)

#### 2.5 Loading Indicator
- **Element:** Animated spinner
- **Location:** Below messages during loading
- **Selector:** `.animate-spin`
- **Purpose:** Indicate AI response in progress
- **Expected Behavior:**
  - Shows when `loading === true`
  - Disappears when response received
- **Dependencies:** None
- **Test Priority:** P2 (Medium - UX feedback)

#### 2.6 Code Viewer Component (Conditional)
- **Element:** `<CodeViewer>`
- **Location:** Within assistant messages (when boilerplate provided)
- **Selector:** `div` containing file tabs and code display
- **Purpose:** Display generated boilerplate code
- **Expected Behavior:**
  - Shows file tabs for navigation
  - Displays syntax-highlighted code
  - Provides copy, download, and save actions
- **Dependencies:** `react-syntax-highlighter`
- **Test Priority:** P1 (High - key feature)
- **Sub-features:** See section 4 below

---

### 3. Recommendations Panel (Right Side)

#### 3.1 Panel Header
- **Element:** Section with title and count
- **Location:** Top of right panel
- **Selector:** `h2` containing "Recommended Stack"
- **Purpose:** Display recommendations count
- **Expected Behavior:**
  - Shows "0 recommendations" when empty
  - Shows "{count} recommendations" when populated
- **Dependencies:** Recommendations data from API
- **Test Priority:** P2 (Medium - informational)

#### 3.2 Empty State
- **Element:** Message when no recommendations
- **Location:** Center of recommendations panel
- **Selector:** `p.text-sm` (contains "Recommendations will appear here")
- **Purpose:** Guide user to start chat
- **Expected Behavior:** Shows when `recommendations.length === 0`
- **Dependencies:** None
- **Test Priority:** P3 (Low - informational)

#### 3.3 Stack Cards (Recommendation Items)
- **Element:** `<StackCard>` components
- **Location:** Scrollable list in right panel
- **Selector:** Individual cards in `div.space-y-3`
- **Purpose:** Display individual technology recommendations
- **Expected Behavior:**
  - Shows tech icon (if available)
  - Displays name, category, description
  - External link button
  - "Add to Stack" save button
- **Dependencies:** Recommendations data from `/api/chat`
- **Test Priority:** P1 (High - core feature)
- **Sub-features:** See section 3.4-3.6 below

#### 3.4 External Link Button (per card)
- **Element:** `<a>` with ExternalLink icon
- **Location:** Top-right of each stack card
- **Selector:** `a[target="_blank"]`
- **Purpose:** Open technology's official URL
- **Expected Behavior:**
  - Opens in new tab
  - Uses `rel="noopener noreferrer"` for security
- **Dependencies:** Valid URL in recommendation data
- **Test Priority:** P2 (Medium - should open correct URL)

#### 3.5 Add to Stack Button (per card)
- **Element:** `<Button>` with Plus/Check icon
- **Location:** Bottom of each stack card
- **Selector:** `button` (contains "Add to Stack" or "Saved")
- **Purpose:** Save recommendation to user's stack
- **Expected Behavior:**
  - POST to `/api/recommendations/save`
  - Changes to "Saved" state with checkmark
  - Disables after saving
- **Dependencies:**
  - `/api/recommendations/save` endpoint
  - Database connection (Neon)
- **Test Priority:** P1 (High - key user action)
- **Known Issue:** API endpoint may not be implemented

---

### 4. Code Viewer Features (Detailed)

#### 4.1 File Tab Navigation
- **Element:** Button tabs for each file
- **Location:** Top of code viewer card
- **Selector:** `button` elements with file paths
- **Purpose:** Switch between multiple code files
- **Expected Behavior:**
  - Highlights selected tab (blue styling)
  - Changes displayed code on click
  - Horizontal scrolling for many files
- **Dependencies:** Files array from boilerplate data
- **Test Priority:** P1 (High - required for multi-file navigation)

#### 4.2 Copy Code Button
- **Element:** `<Button>` with Copy/Check icon
- **Location:** Top-right of code display area
- **Selector:** `button` (contains "Copy" or "Copied!")
- **Purpose:** Copy current file's code to clipboard
- **Expected Behavior:**
  - Uses `navigator.clipboard.writeText()`
  - Shows "Copied!" feedback for 2 seconds
  - Reverts to "Copy" button text
- **Dependencies:** Browser Clipboard API
- **Test Priority:** P1 (High - frequent user action)

#### 4.3 Download All Button
- **Element:** `<Button>` with Download icon
- **Location:** Top-right of code viewer header
- **Selector:** `button` (contains "Download")
- **Purpose:** Download all files as markdown
- **Expected Behavior:**
  - Creates markdown file with all code
  - Downloads as `{projectName}-boilerplate.md`
  - Uses Blob and URL.createObjectURL
- **Dependencies:** Browser download capability
- **Test Priority:** P1 (High - alternative to File System API)

#### 4.4 Save to Folder Button
- **Element:** `<Button>` with FolderOpen icon (blue background)
- **Location:** Top-right of code viewer header
- **Selector:** `button.bg-blue-600` (contains "Save to Folder")
- **Purpose:** Save all files directly to user's file system
- **Expected Behavior:**
  - Opens consent dialog first
  - After consent, opens native directory picker
  - Creates project folder and subdirectories
  - Writes all files with proper structure
  - Shows progress checklist during save
  - Creates SETUP.md with instructions
- **Dependencies:**
  - File System Access API (`showDirectoryPicker`)
  - Browser support (Chrome, Edge, Opera, Brave)
  - User permission grant
- **Test Priority:** P0 (Critical - main feature)
- **Known Limitations:** Not supported in Firefox or Safari

#### 4.5 File Access Consent Dialog
- **Element:** `<FileAccessConsentDialog>`
- **Location:** Modal overlay (appears when Save clicked)
- **Selector:** Dialog with consent message
- **Purpose:** Explain file system access before requesting permission
- **Expected Behavior:**
  - Shows project name and file count
  - Two buttons: Accept / Decline
  - Accept → proceeds to directory picker
  - Decline → closes dialog
- **Dependencies:** None
- **Test Priority:** P1 (High - required before file access)

#### 4.6 Progress Checklist (During Save)
- **Element:** `<ProgressChecklist>`
- **Location:** Full-screen overlay during file save
- **Selector:** Fixed positioned div with checklist
- **Purpose:** Show real-time progress of file creation
- **Expected Behavior:**
  - Shows each file being created
  - Three states: pending → in-progress → completed
  - Updates dynamically as files are written
  - Auto-dismisses 2s after completion
- **Dependencies:** File save operation in progress
- **Test Priority:** P2 (Medium - UX feedback)

#### 4.7 Syntax Highlighted Code Display
- **Element:** `<SyntaxHighlighter>` from react-syntax-highlighter
- **Location:** Main code display area
- **Selector:** Pre/code elements with syntax styling
- **Purpose:** Display code with proper syntax highlighting
- **Expected Behavior:**
  - Uses VS Code Dark Plus theme
  - Language detected from file metadata
  - Max height 400px with scroll
  - Proper padding and font size
- **Dependencies:** `react-syntax-highlighter` library
- **Test Priority:** P2 (Medium - visual enhancement)

#### 4.8 Setup Instructions Display
- **Element:** Numbered list with gradient background
- **Location:** Below code viewer
- **Selector:** `ol.space-y-4` in blue gradient card
- **Purpose:** Show step-by-step setup instructions
- **Expected Behavior:**
  - Displays when `setup` array exists
  - Numbered steps with icons
  - Beginner-friendly styling
  - Help text at bottom
- **Dependencies:** Setup data from boilerplate
- **Test Priority:** P2 (Medium - helpful guide)

---

## API Endpoints & Dependencies

### 1. `/api/chat` (POST)
- **Purpose:** Send user message and get AI recommendations
- **Request:**
  ```json
  {
    "message": "string (required)",
    "userId": "string (UUID, required)",
    "projectId": "string (UUID, optional)"
  }
  ```
- **Response:**
  ```json
  {
    "response": "string",
    "recommendations": "Recommendation[]",
    "boilerplate": "Boilerplate | null"
  }
  ```
- **Dependencies:**
  - `ANTHROPIC_API_KEY` env var
  - Anthropic SDK
  - Database connection (for chat history)
- **Error Handling:** 400 for validation errors, 500 for server errors

### 2. `/api/recommendations/save` (POST)
- **Purpose:** Save recommendation to user's stack
- **Request:**
  ```json
  {
    "userId": "string (UUID)",
    "recommendation": "Recommendation"
  }
  ```
- **Status:** Likely not implemented yet (needs verification)
- **Dependencies:**
  - Database connection (Neon)
  - Recommendations table

---

## Environment Variables Required

| Variable | Purpose | Location Used | Critical |
|----------|---------|---------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection | `/api/chat`, database layer | Yes |
| `NEXTAUTH_URL` | NextAuth base URL | Authentication | Yes |
| `NEXTAUTH_SECRET` | NextAuth encryption | Authentication | Yes |
| `ANTHROPIC_API_KEY` | AI recommendations | `/api/chat` | Yes |

---

## Browser API Dependencies

1. **Clipboard API**
   - Used by: Copy Code button
   - Browser support: All modern browsers
   - Fallback: None (button fails silently)

2. **File System Access API**
   - Used by: Save to Folder feature
   - Browser support: Chrome, Edge, Opera, Brave only
   - Fallback: Download button (works in all browsers)

3. **Blob & URL APIs**
   - Used by: Download All button
   - Browser support: Universal
   - Fallback: N/A (universal support)

---

## Accessibility Considerations

- **Keyboard Navigation:** Forms are keyboard accessible
- **Focus Management:** Modal dialogs should trap focus
- **ARIA Labels:** Some interactive elements may lack aria-labels
- **Color Contrast:** Uses Tailwind classes (should meet WCAG)
- **Screen Reader Support:** Text content is semantic

---

## Responsive Behavior

- **Desktop (>768px):** Two-panel layout side-by-side
- **Mobile (<768px):** Likely needs testing - panels may stack vertically
- **File Tabs:** Horizontal scroll on overflow
- **Code Display:** Fixed max-height with vertical scroll

---

## Known Technical Debts

1. **Missing API Endpoint:** `/api/recommendations/save` referenced but may not exist
2. **Error Handling:** Console.error used but no user-facing error UI beyond generic message
3. **Browser Support:** File System API limited to Chromium browsers
4. **Validation:** Chat API requires UUID for userId but dashboard passes `session.user?.id` which may not be UUID format
5. **Loading States:** No skeleton loaders, just spinners
6. **Accessibility:** Missing ARIA labels on interactive elements
7. **Type Safety:** Some type assertions (`as const`) in code viewer

---

## Test Data Requirements

To fully test dashboard features, need:
- Valid authenticated session
- User with UUID-format ID
- Active Anthropic API key
- Database with chat history support
- Test messages that trigger:
  - Text-only responses
  - Responses with recommendations
  - Responses with boilerplate code

---

## Feature Priority Matrix

| Priority | Feature | Reasoning |
|----------|---------|-----------|
| **P0** | Send chat message | Core functionality - app purpose |
| **P0** | Save to Folder | Main value proposition |
| **P1** | Display recommendations | Core output |
| **P1** | Sign out | Critical auth control |
| **P1** | Code viewer tabs | Required for multi-file navigation |
| **P1** | Copy code | High-frequency user action |
| **P1** | Add to Stack | Key persistence feature |
| **P2** | Loading indicators | Important UX feedback |
| **P2** | External links | Expected functionality |
| **P2** | Download All | Fallback for File API |
| **P3** | Empty states | Guidance, not critical |
| **P3** | Branding display | Static element |

---

## Next Steps

1. Verify all API endpoints are implemented
2. Test File System API across browsers
3. Add comprehensive error boundaries
4. Implement accessibility audit
5. Test responsive behavior on mobile devices
6. Validate userId format handling
