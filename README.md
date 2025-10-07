# StackGuideR

An AI-powered tech stack recommendation platform that helps developers find the perfect technologies for their projects.

## Features

- 🤖 **AI Chat Interface** - Describe your project and get instant tech stack recommendations from Claude AI
- 📚 **Knowledge Base** - Automatically scraped and analyzed GitHub repositories
- 💾 **Save & Organize** - Save recommended tools to your personal tech stack
- 🔐 **Authentication** - Secure email/password authentication with NextAuth
- 🎨 **Modern UI** - Built with Next.js 15, React 19, and Tailwind CSS
- 📊 **Admin Dashboard** - Manage knowledge base and view platform statistics

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **UI Components**: ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon Serverless) with Drizzle ORM
- **AI**: Claude API (Anthropic)
- **Storage**: Cloudflare R2
- **Authentication**: NextAuth v5
- **GitHub Integration**: Octokit

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm (or npm/yarn)
- PostgreSQL database (Neon recommended)
- Anthropic API key
- GitHub Personal Access Token (optional, for scraping)
- Cloudflare R2 bucket (optional, for README storage)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd StackGuideR
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add your credentials:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `ANTHROPIC_API_KEY` - Your Claude API key
- `GITHUB_TOKEN` - GitHub Personal Access Token (optional)
- R2 credentials (optional, for README storage)

4. Generate and run database migrations:
\`\`\`bash
pnpm db:generate
pnpm db:push
\`\`\`

5. Run the development server:
\`\`\`bash
pnpm dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### For Users

1. **Sign Up** - Create an account at `/auth/signup`
2. **Chat Interface** - Describe your project requirements in the chat
3. **Get Recommendations** - Claude AI analyzes your needs and suggests technologies
4. **Save Stack** - Click "Add to Stack" to save recommendations to your project
5. **View Dashboard** - Access your saved recommendations at `/dashboard`

### For Admins

1. **Admin Dashboard** - Access at `/admin`
2. **Scrape Repositories** - Add GitHub repos to the knowledge base
3. **Scrape by Topic** - Bulk scrape popular repos by topic (e.g., "react", "typescript")
4. **View Stats** - Monitor users, projects, recommendations, and knowledge entries

## Project Structure

\`\`\`
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── chat/          # Chat with AI
│   │   ├── recommendations/ # Save recommendations
│   │   └── scraper/       # GitHub scraping
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Auth pages (signin/signup)
│   └── dashboard/         # User dashboard
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── chat-interface.tsx
│   ├── stack-card.tsx
│   └── admin-dashboard.tsx
├── lib/                   # Utilities and configs
│   ├── db/               # Database schema and client
│   ├── auth.ts           # NextAuth configuration
│   ├── anthropic.ts      # Claude AI integration
│   ├── github-scraper.ts # GitHub scraping logic
│   └── r2-storage.ts     # Cloudflare R2 storage
└── types/                # TypeScript definitions
\`\`\`

## Database Schema

- **users** - User accounts with email/password
- **projects** - User projects containing saved stacks
- **recommendations** - Individual tech recommendations
- **knowledge** - Scraped GitHub repository data
- **chats** - Conversation history with AI

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Chat
- `POST /api/chat` - Send message and get AI recommendations

### Recommendations
- `POST /api/recommendations/save` - Save a recommendation to user's stack

### Scraper
- `POST /api/scraper` - Scrape GitHub repository or topic
- `GET /api/scraper` - Retrieve knowledge entries

## Development Commands

\`\`\`bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm typecheck        # Run TypeScript checks
pnpm check            # Run lint + typecheck
pnpm format           # Format code with Prettier
pnpm db:generate      # Generate database migrations
pnpm db:push          # Apply migrations to database
pnpm db:studio        # Open Drizzle Studio GUI
\`\`\`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables in Vercel settings
4. Deploy automatically on push to main branch

### Environment Variables on Vercel

Make sure to set all required environment variables:
- `DATABASE_URL`
- `NEXTAUTH_URL` (set to your production URL)
- `NEXTAUTH_SECRET`
- `ANTHROPIC_API_KEY`
- `GITHUB_TOKEN` (optional)
- R2 credentials (optional)

## Optional Features

### GitHub Scraping Worker

For production deployments, consider setting up a separate worker to scrape repositories:

1. Create a cron job or scheduled task
2. Call `/api/scraper` with topics to scrape
3. Store results in the knowledge base

### Cloudflare R2 Storage

If you don't need README storage:
1. Remove R2 configuration from `.env`
2. The scraper will still work, storing only metadata in the database

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the [Issues](https://github.com/your-repo/issues) page
- Review the documentation in `/docs`
- Check CLAUDE.md for development guidelines

---

Built with ❤️ using Next.js, Claude AI, and modern web technologies.
