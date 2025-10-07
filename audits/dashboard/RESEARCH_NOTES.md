# Research Notes - Fix Approaches for Dashboard Issues

**Generated:** 2025-10-07
**Research Date:** 2025-10-07
**Focus:** Next.js 15 + React 19 + Drizzle ORM + Neon Database

---

## 1. Next.js Webpack Chunk Module Not Found Errors

**Error**: `Cannot find module './chunks/vendor-chunks/formdata-node@4.4.1.js'`

### Sources:
- [Next.js ChunkLoadError - Stack Overflow](https://stackoverflow.com/questions/67652612/chunkloaderror-loading-chunk-node-modules-next-dist-client-dev-noop-js-failed)
- [Next.js vendor-chunks error - GitHub pino issue #2028](https://github.com/pinojs/pino/issues/2028)
- [Clearing Next.js cache - Medium article](https://azzamjiul.medium.com/how-to-clear-cache-and-ensure-a-fresh-build-for-your-next-js-application-4994cb085a18)
- [Next.js cache discussion - GitHub #70442](https://github.com/vercel/next.js/discussions/70442)

### Fix Approaches:

1. **Delete .next folder and rebuild** (Most common fix)
   - Remove the entire `.next` directory which stores build artifacts and cache
   - Regenerate cache and build artifacts with fresh build
   ```bash
   rm -rf .next
   pnpm build
   # or for development
   rm -rf .next && pnpm dev
   ```

2. **Clear webpack cache specifically**
   - Target the webpack cache directory within `.next`
   - Less aggressive than full .next deletion
   ```bash
   rm -rf .next/cache/webpack
   ```

3. **Full dependency reinstall**
   - Delete both node_modules and .next
   - Reinstall all dependencies to resolve version mismatches
   ```bash
   rm -rf node_modules .next
   pnpm install
   pnpm build
   ```

4. **Add clean build script to package.json**
   - Create a reusable command for cache clearing
   ```json
   "scripts": {
     "clean": "rm -rf .next",
     "clean-build": "pnpm run clean && pnpm run build",
     "clean-dev": "pnpm run clean && pnpm run dev"
   }
   ```

5. **Check next.config.ts configuration**
   - Remove problematic `assetPrefix: "."` if present
   - Verify dynamic route configurations
   - Ensure no custom webpack configuration is conflicting

6. **Disable cache for troubleshooting** (temporary)
   - Add cache configuration to next.config.ts
   ```typescript
   const nextConfig: NextConfig = {
     webpack: (config) => {
       config.cache = false
       return config
     }
   }
   ```

---

## 2. NextAuth UUID Validation for User IDs

**Issue**: Ensuring user IDs are UUIDs or adjusting validation in NextAuth v5

### Sources:
- [NextAuth v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [NextAuth numeric user ID discussion - GitHub #7966](https://github.com/nextauthjs/next-auth/issues/7966)
- [Extending the Session - Auth.js Guide](https://authjs.dev/guides/extending-the-session)
- [NextAuth TypeScript - Stack Overflow](https://stackoverflow.com/questions/74147383/how-to-use-numeric-user-id-with-next-auth)

### Fix Approaches:

1. **Use UUID in database schema** (Recommended default)
   - NextAuth v5 defaults to UUID strings for user IDs
   - Drizzle schema with UUID:
   ```typescript
   import { pgTable, uuid, text } from 'drizzle-orm/pg-core'

   export const users = pgTable('users', {
     id: uuid('id').primaryKey().defaultRandom(),
     email: text('email').notNull().unique(),
     // other fields...
   })
   ```

2. **Extend TypeScript types for session**
   - Create `types/next-auth.d.ts` to add user ID to session
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

3. **Implement session callback to expose user ID**
   - Add user ID from token or database to session object
   ```typescript
   import NextAuth from "next-auth"

   export const { auth, handlers } = NextAuth({
     callbacks: {
       session({ session, token, user }) {
         return {
           ...session,
           user: {
             ...session.user,
             id: token.sub, // JWT token subject (user ID)
           },
         }
       },
     },
   })
   ```

4. **Use Adapter with UUID support**
   - Use Drizzle adapter for NextAuth with UUID configuration
   ```typescript
   import { DrizzleAdapter } from "@auth/drizzle-adapter"
   import { db } from "@/lib/db"

   export const { auth, handlers } = NextAuth({
     adapter: DrizzleAdapter(db),
     // ... other config
   })
   ```

5. **Validate UUID format in callbacks** (optional)
   - Add runtime validation using Zod or regex
   ```typescript
   import { z } from 'zod'

   const uuidSchema = z.string().uuid()

   callbacks: {
     session({ session, token }) {
       const userId = token.sub
       if (userId && uuidSchema.safeParse(userId).success) {
         session.user.id = userId
       }
       return session
     }
   }
   ```

6. **Configure tsconfig.json to include type definitions**
   ```json
   {
     "include": [
       "next-env.d.ts",
       "types/next-auth.d.ts",
       "**/*.ts",
       "**/*.tsx"
     ]
   }
   ```

---

## 3. Implementing /api/recommendations/save Endpoint

**Issue**: Creating a POST endpoint with Drizzle ORM and Neon database

### Sources:
- [Next.js 15 + Drizzle CRUD Guide - Medium](https://medium.com/@aslandjc7/next-js-15-drizzle-orm-a-beginners-guide-to-crud-operations-ae7f2701a8c3)
- [Drizzle ORM Insert Documentation](https://orm.drizzle.team/docs/insert)
- [Drizzle with Next.js 15 - Strapi Blog](https://strapi.io/blog/how-to-use-drizzle-orm-with-postgresql-in-a-nextjs-15-project)
- [Working with Drizzle and PostgreSQL - Refine](https://refine.dev/blog/drizzle-react/)

### Fix Approaches:

1. **Create API route with validation using Zod**
   ```typescript
   // app/api/recommendations/save/route.ts
   import { NextRequest, NextResponse } from 'next/server'
   import { z } from 'zod'
   import { db, recommendations } from '@/lib/db'

   const recommendationSchema = z.object({
     projectId: z.string().uuid(),
     technologies: z.array(z.string()),
     reasoning: z.string().optional(),
   })

   export async function POST(request: NextRequest) {
     try {
       const body = await request.json()
       const validatedData = recommendationSchema.parse(body)

       const result = await db.insert(recommendations)
         .values(validatedData)
         .returning()

       return NextResponse.json({ success: true, data: result[0] })
     } catch (error) {
       if (error instanceof z.ZodError) {
         return NextResponse.json(
           { error: 'Validation failed', details: error.errors },
           { status: 400 }
         )
       }
       return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
       )
     }
   }
   ```

2. **Use drizzle-zod for schema validation**
   - Generate Zod schemas from Drizzle schema
   ```typescript
   import { createInsertSchema } from 'drizzle-zod'
   import { recommendations } from '@/lib/db/schema'

   export const insertRecommendationSchema = createInsertSchema(recommendations, {
     technologies: (schema) => schema.technologies.min(1),
     projectId: (schema) => schema.projectId.uuid(),
   })
   ```

3. **Implement with transaction for data integrity**
   - Wrap multiple operations in a transaction
   ```typescript
   const result = await db.transaction(async (tx) => {
     const recommendation = await tx.insert(recommendations)
       .values(validatedData)
       .returning()

     await tx.insert(chats).values({
       projectId: validatedData.projectId,
       message: 'Recommendation saved'
     })

     return recommendation[0]
   })
   ```

4. **Add authentication middleware check**
   - Verify user session before allowing insert
   ```typescript
   import { auth } from '@/lib/auth'

   export async function POST(request: NextRequest) {
     const session = await auth()

     if (!session?.user) {
       return NextResponse.json(
         { error: 'Unauthorized' },
         { status: 401 }
       )
     }

     // Continue with insert...
   }
   ```

5. **Return typed response with all inserted fields**
   - Use `.returning()` to get the complete inserted record
   ```typescript
   const [newRecommendation] = await db.insert(recommendations)
     .values({
       projectId: validatedData.projectId,
       technologies: validatedData.technologies,
       reasoning: validatedData.reasoning,
       createdAt: new Date(),
     })
     .returning()

   return NextResponse.json(newRecommendation)
   ```

6. **Handle Neon serverless connection properly**
   - Ensure connection configuration in db client
   ```typescript
   import { drizzle } from 'drizzle-orm/neon-serverless'
   import { Pool } from '@neondatabase/serverless'
   import ws from 'ws'

   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     webSocketConstructor: ws
   })

   export const db = drizzle(pool)
   ```

---

## 4. React Accessibility - Adding ARIA Labels

**Issue**: Properly implementing ARIA labels for form inputs and buttons

### Sources:
- [React Accessibility Documentation](https://react.dev/learn/accessibility)
- [ARIA label attribute - MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label)
- [ARIA Labels Guide - A11Y Collective](https://www.a11y-collective.com/blog/aria-labels/)
- [React 19 ARIA with ShadCN](https://marketeer.snowdon.dev/blog/2025/05/11/aria-descriptions-in-react-19-with-shadcn/)

### Fix Approaches:

1. **Use semantic HTML labels first** (Best practice)
   - Associate label with input using `htmlFor` attribute
   ```tsx
   <label htmlFor="email" className="block text-sm font-medium">
     Email Address
   </label>
   <input id="email" type="email" name="email" />
   ```

2. **Use aria-label for icon-only buttons**
   - When no visible text label exists
   ```tsx
   <button type="submit" aria-label="Save recommendation">
     <SaveIcon className="w-5 h-5" />
   </button>
   ```

3. **Use aria-labelledby to reference existing text**
   - When descriptive text already exists in the DOM
   ```tsx
   <div id="section-title">Project Details</div>
   <form aria-labelledby="section-title">
     {/* form fields */}
   </form>
   ```

4. **Combine visible labels with aria-describedby**
   - Add additional context for screen readers
   ```tsx
   <label htmlFor="password">Password</label>
   <input
     id="password"
     type="password"
     aria-describedby="password-requirements"
   />
   <span id="password-requirements">
     Must be at least 8 characters
   </span>
   ```

5. **Use ShadCN Form components with built-in accessibility**
   - ShadCN automatically handles ARIA attributes
   ```tsx
   import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'

   <FormField
     control={form.control}
     name="email"
     render={({ field }) => (
       <FormItem>
         <FormLabel>Email</FormLabel>
         <FormControl>
           <Input placeholder="Enter email" {...field} />
         </FormControl>
       </FormItem>
     )}
   />
   ```

6. **Avoid redundant ARIA labels**
   - Don't use both aria-label and visible text
   ```tsx
   {/* ❌ Bad - redundant */}
   <button aria-label="Submit form">Submit</button>

   {/* ✅ Good - visible text is sufficient */}
   <button>Submit</button>

   {/* ✅ Good - icon only needs aria-label */}
   <button aria-label="Close dialog">
     <XIcon />
   </button>
   ```

---

## 5. File System Access API Browser Detection and Fallback

**Issue**: Detecting support and providing fallback for `showDirectoryPicker()`

### Sources:
- [File System Access API - Chrome Developers](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access)
- [browser-fs-access GitHub - GoogleChromeLabs](https://github.com/GoogleChromeLabs/browser-fs-access)
- [File System Access API detection - Stack Overflow](https://stackoverflow.com/questions/74988054/how-to-check-if-file-system-access-api-is-available)
- [Can I Use - File System Access API](https://caniuse.com/native-filesystem-api)

### Fix Approaches:

1. **Simple feature detection**
   - Check if method exists before using
   ```typescript
   const saveFile = async (blob: Blob, filename: string) => {
     if ('showSaveFilePicker' in window) {
       // Use File System Access API
       try {
         const handle = await window.showSaveFilePicker({
           suggestedName: filename,
         })
         const writable = await handle.createWritable()
         await writable.write(blob)
         await writable.close()
       } catch (err) {
         console.error(err)
       }
     } else {
       // Fallback
       downloadFileFallback(blob, filename)
     }
   }
   ```

2. **Fallback using download link**
   - Create invisible anchor element
   ```typescript
   const downloadFileFallback = (blob: Blob, filename: string) => {
     const url = URL.createObjectURL(blob)
     const a = document.createElement('a')
     a.href = url
     a.download = filename
     a.style.display = 'none'
     document.body.appendChild(a)
     a.click()

     setTimeout(() => {
       document.body.removeChild(a)
       URL.revokeObjectURL(url)
     }, 100)
   }
   ```

3. **Use browser-fs-access library** (Recommended)
   - Handles detection and fallback automatically
   ```bash
   pnpm add browser-fs-access
   ```
   ```typescript
   import { fileSave } from 'browser-fs-access'

   const saveFile = async (blob: Blob, filename: string) => {
     try {
       await fileSave(blob, {
         fileName: filename,
         description: 'Export file',
       })
     } catch (err) {
       console.error('Save cancelled:', err)
     }
   }
   ```

4. **Check for required user gesture**
   - Must be called in response to user interaction
   ```tsx
   'use client'

   export function ExportButton() {
     const handleExport = async () => {
       // Must be in user event handler
       const data = generateExportData()
       const blob = new Blob([JSON.stringify(data)])

       if ('showSaveFilePicker' in window) {
         // Use API
       } else {
         downloadFileFallback(blob, 'export.json')
       }
     }

     return <button onClick={handleExport}>Export</button>
   }
   ```

5. **Display appropriate UI based on support**
   - Show different messages for different browsers
   ```tsx
   const [hasFileSystemAccess, setHasFileSystemAccess] = useState(false)

   useEffect(() => {
     setHasFileSystemAccess('showSaveFilePicker' in window)
   }, [])

   return (
     <div>
       <button onClick={handleSave}>
         {hasFileSystemAccess ? 'Save File' : 'Download File'}
       </button>
       {!hasFileSystemAccess && (
         <p>File will download to your Downloads folder</p>
       )}
     </div>
   )
   ```

6. **Add TypeScript declarations**
   - Add types for File System Access API
   ```typescript
   // types/file-system.d.ts
   interface FilePickerOptions {
     types?: Array<{
       description?: string
       accept: Record<string, string[]>
     }>
     suggestedName?: string
   }

   interface Window {
     showSaveFilePicker(options?: FilePickerOptions): Promise<FileSystemFileHandle>
   }
   ```

---

## 6. React Error Boundaries in Next.js 15 App Router

**Issue**: Implementing error boundaries with React 19 in Next.js 15

### Sources:
- [Next.js Error Handling Documentation](https://nextjs.org/docs/app/getting-started/error-handling)
- [Next.js error.js File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- [Error Boundaries in React](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js 15 Error Handling Best Practices](https://devanddeliver.com/blog/frontend/next-js-15-error-handling-best-practices-for-code-and-routes)

### Fix Approaches:

1. **Create error.tsx in route segment**
   - Automatically wraps route in error boundary
   ```tsx
   // app/dashboard/error.tsx
   'use client'

   export default function Error({
     error,
     reset,
   }: {
     error: Error & { digest?: string }
     reset: () => void
   }) {
     return (
       <div>
         <h2>Something went wrong!</h2>
         <p>{error.message}</p>
         <button onClick={reset}>Try again</button>
       </div>
     )
   }
   ```

2. **Create global-error.tsx for root errors**
   - Handles errors in root layout
   ```tsx
   // app/global-error.tsx
   'use client'

   export default function GlobalError({
     error,
     reset,
   }: {
     error: Error & { digest?: string }
     reset: () => void
   }) {
     return (
       <html>
         <body>
           <h2>Application Error</h2>
           <button onClick={reset}>Try again</button>
         </body>
       </html>
     )
   }
   ```

3. **Handle specific error types**
   - Check error properties
   ```tsx
   'use client'

   import { useEffect } from 'react'

   export default function Error({ error, reset }) {
     useEffect(() => {
       console.error(error)
     }, [error])

     const isAuthError = error.message.includes('Unauthorized')

     return (
       <div>
         {isAuthError ? (
           <><h2>Authentication Required</h2><a href="/login">Login</a></>
         ) : (
           <><h2>Error occurred</h2><button onClick={reset}>Try again</button></>
         )}
       </div>
     )
   }
   ```

4. **Create custom ErrorBoundary component**
   - For non-route-based error handling
   ```tsx
   'use client'

   import { Component, ReactNode } from 'react'

   interface Props {
     children: ReactNode
     fallback: (error: Error, reset: () => void) => ReactNode
   }

   interface State {
     hasError: boolean
     error: Error | null
   }

   export class ErrorBoundary extends Component<Props, State> {
     constructor(props: Props) {
       super(props)
       this.state = { hasError: false, error: null }
     }

     static getDerivedStateFromError(error: Error): State {
       return { hasError: true, error }
     }

     componentDidCatch(error: Error, errorInfo: any) {
       console.error('ErrorBoundary caught:', error, errorInfo)
     }

     reset = () => {
       this.setState({ hasError: false, error: null })
     }

     render() {
       if (this.state.hasError && this.state.error) {
         return this.props.fallback(this.state.error, this.reset)
       }

       return this.props.children
     }
   }
   ```

5. **Combine with loading.tsx**
   - Create loading states alongside error states
   ```tsx
   // app/dashboard/loading.tsx
   export default function Loading() {
     return (
       <div className="flex items-center justify-center min-h-screen">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2" />
       </div>
     )
   }
   ```

6. **Handle errors in Server Actions**
   - Catch errors and return meaningful messages
   ```typescript
   'use server'

   export async function saveRecommendation(formData: FormData) {
     try {
       const data = validateFormData(formData)
       await db.insert(recommendations).values(data)
       return { success: true }
     } catch (error) {
       if (error instanceof ValidationError) {
         return { error: error.message }
       }
       throw new Error('Failed to save recommendation')
     }
   }
   ```

---

## Additional Research Topics

### Testing Recommendations
- Use Playwright for E2E testing (already implemented)
- Use axe-core for accessibility testing (already implemented)
- Use React Testing Library for component testing
- Use Vitest for unit testing

### Performance Optimization
- Implement React Suspense boundaries
- Use dynamic imports for code splitting
- Optimize images with next/image
- Consider using React Server Components where appropriate

### Security Best Practices
- Validate all user inputs with Zod
- Use environment variables for secrets
- Implement rate limiting on API routes
- Use CSRF tokens for forms
- Sanitize user-generated content

---

**Report Generated:** 2025-10-07
**Research Quality:** High (Official docs + Community sources)
**Implementation Ready:** Yes
