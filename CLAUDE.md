# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**StackGuideR** is an AI-powered tech stack recommendation platform built with Next.js 15, React 19, and PostgreSQL (Neon). The application helps users find optimal technology stacks for their projects through intelligent recommendations.

## Tech Stack

- **Framework**: Next.js 15.5.4 with App Router (TypeScript)
- **React**: 19.2.0 with Server Components
- **Database**: PostgreSQL via Neon Serverless (`@neondatabase/serverless`)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Authentication**: NextAuth v5 (beta)
- **Styling**: Tailwind CSS 4.1.14
- **Forms**: React Hook Form + Zod validation
- **AI Integration**: Anthropic SDK
- **Package Manager**: pnpm

## Database Architecture

The database schema (`src/lib/db/schema.ts`) defines five main tables:

1. **users** - User accounts with email/password authentication
2. **projects** - User projects with descriptions and metadata
3. **recommendations** - AI-generated tech stack recommendations per project
4. **knowledge** - Curated knowledge base of technologies (tags, categories, features)
5. **chats** - Conversation history between users and the AI recommendation system

### Key Relationships
- Users → Projects (one-to-many)
- Projects → Recommendations (one-to-many)
- Projects → Chats (one-to-many)
- Users → Chats (one-to-many)

All foreign keys use cascade deletion for data integrity.

### Database Connection
- Connection configured in `src/lib/db/index.ts` via `DATABASE_URL` environment variable
- Uses WebSocket connection for Neon serverless with `ws` package
- Exports typed Drizzle client and schema

## Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Home page (redirects based on auth)
│   └── globals.css        # Global styles with Tailwind
├── components/            # React components
│   └── theme-provider.tsx # Dark/light mode provider
└── lib/                   # Utilities and configurations
    ├── db/               # Database layer
    │   ├── index.ts      # Drizzle client initialization
    │   └── schema.ts     # Database schema and types
    └── utils.ts          # Shared utilities
```

## Common Development Commands

### Development
```bash
pnpm dev              # Start Next.js dev server (port 3000)
pnpm build            # Production build (must pass without errors)
pnpm start            # Start production server
```

### Code Quality
```bash
pnpm lint             # Run ESLint (must fix all errors before committing)
pnpm typecheck        # Run TypeScript compiler check
pnpm check            # Run both lint and typecheck
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting without changes
```

### Database Operations
```bash
pnpm db:generate      # Generate migrations from schema changes
pnpm db:migrate       # Run pending migrations
pnpm db:push          # Push schema directly to database (dev only)
pnpm db:studio        # Open Drizzle Studio GUI
```

## Configuration Files

### next.config.ts
- TypeScript-based configuration
- `ignoreBuildErrors: false` - All TS errors must be fixed
- `ignoreDuringBuilds: false` - All ESLint errors must be fixed
- Remote image patterns allow all HTTPS sources

### drizzle.config.ts
- Output directory: `./drizzle`
- Schema location: `./src/lib/db/schema.ts`
- Database: PostgreSQL via `DATABASE_URL`

### tsconfig.json
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- Target: ES2017

### eslint.config.mjs
- Extends Next.js core-web-vitals and TypeScript configs
- Ignores build directories and generated files

## Authentication Flow

The application uses NextAuth v5 (beta) with the following flow:

1. Unauthenticated users are redirected to `/auth/signin` (from `src/app/page.tsx`)
2. Authenticated users are redirected to `/dashboard`
3. Session validation uses `getServerSession(authOptions)` from `@/lib/auth`

**Note**: The `authOptions` configuration is referenced but not yet in the codebase - it should be created in `src/lib/auth.ts`.

## Environment Variables Required

```bash
DATABASE_URL=          # Neon PostgreSQL connection string
NEXTAUTH_URL=          # Base URL for NextAuth (e.g., http://localhost:3000)
NEXTAUTH_SECRET=       # Secret for NextAuth session encryption
ANTHROPIC_API_KEY=     # API key for Anthropic AI integration
```

## Development Workflow

1. **Before coding**: Check database schema and types in `src/lib/db/schema.ts`
2. **Server Components**: Default in App Router - use for data fetching
3. **Client Components**: Add `'use client'` directive for interactivity
4. **Database queries**: Import `db` from `@/lib/db` and use Drizzle ORM queries
5. **Types**: Use inferred types from schema (e.g., `User`, `Project`, `Recommendation`)
6. **After changes**: Always run `pnpm check` before committing

## Important Patterns

### Database Client Usage
```typescript
import { db, users, projects } from '@/lib/db'

// Query example
const allUsers = await db.select().from(users)

// Insert with typed data
const newUser = await db.insert(users).values({
  email: 'user@example.com',
  passwordHash: '...',
  name: 'User Name'
}).returning()
```

### Type Safety
All database operations are fully typed through Drizzle ORM. Use exported types:
- `User`, `NewUser` (for inserts)
- `Project`, `NewProject`
- `Recommendation`, `NewRecommendation`
- `Knowledge`, `NewKnowledge`
- `Chat`, `NewChat`

### Theme Support
The app supports dark/light mode via `next-themes`. The `ThemeProvider` is configured in the root layout with system preference detection.

## Testing Approach

Currently no test suite is configured. When adding tests:
- Use Vitest for unit tests
- Use Playwright for E2E tests
- Follow the patterns from global `.claude/CLAUDE.md` guidelines

## Build Requirements

- **Zero TypeScript errors**: Build fails on type errors
- **Zero ESLint errors**: Build fails on linting errors
- **All environment variables**: Must be set for build to succeed

## Dependencies of Note

- **@anthropic-ai/sdk**: AI integration for recommendations
- **@octokit/rest**: GitHub API integration (purpose TBD)
- **@aws-sdk/client-s3**: S3 integration (purpose TBD)
- **bcryptjs**: Password hashing for authentication
- **zod**: Runtime validation with React Hook Form
- **lucide-react**: Icon library

## Next Steps for Development

Based on the current codebase state, these components need implementation:
1. Authentication setup (`src/lib/auth.ts` with NextAuth configuration)
2. Dashboard page (`src/app/dashboard/page.tsx`)
3. Sign-in page (`src/app/auth/signin/page.tsx`)
4. API routes for AI recommendations
5. UI components for project management and recommendations
