# Deployment Guide for StackGuideR

This guide will walk you through deploying StackGuideR to Vercel with Neon PostgreSQL.

## Prerequisites

- GitHub account
- Vercel account ([vercel.com](https://vercel.com))
- Neon account ([neon.tech](https://neon.tech)) for PostgreSQL database
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
- (Optional) GitHub Personal Access Token for scraping
- (Optional) Cloudflare R2 account for README storage

## Step 1: Set Up Neon Database

1. Go to [neon.tech](https://neon.tech) and create a new project
2. Name it "StackGuideR" or similar
3. Copy your connection string (starts with `postgres://`)
4. Keep this handy for later

## Step 2: Get Anthropic API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Copy and save securely

## Step 3: Push Code to GitHub

```bash
# If you haven't already initialized git
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### Option A: Via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Click "Import" on your StackGuideR repository
4. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `pnpm build`
   - Output Directory: `.next`

5. Add Environment Variables (click "Environment Variables"):

```bash
# Required Variables
DATABASE_URL=<your-neon-connection-string>
NEXTAUTH_URL=https://<your-vercel-domain>.vercel.app
NEXTAUTH_SECRET=<generate-random-string>
ANTHROPIC_API_KEY=<your-anthropic-api-key>

# Optional Variables (for full functionality)
GITHUB_TOKEN=<your-github-token>
R2_ENDPOINT=<your-r2-endpoint>
R2_ACCESS_KEY_ID=<your-r2-access-key>
R2_SECRET_ACCESS_KEY=<your-r2-secret-key>
R2_BUCKET=stackguider
```

6. Click "Deploy"
7. Wait for build to complete (~2-5 minutes)

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

## Step 5: Generate NEXTAUTH_SECRET

Generate a random secret for NextAuth:

```bash
openssl rand -base64 32
```

Use this value for `NEXTAUTH_SECRET` environment variable.

## Step 6: Run Database Migrations

After first deployment, run migrations:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure `DATABASE_URL` is set correctly
3. Go to Deployments → Latest Deployment → ⋯ → Redeploy
4. Or, run locally then push schema:

```bash
# Create .env file locally with your DATABASE_URL
echo "DATABASE_URL=<your-neon-url>" > .env

# Generate migrations
pnpm db:push

# This will create all tables in your database
```

## Step 7: Verify Deployment

1. Visit your Vercel deployment URL
2. Click "Sign Up" to create an account
3. Test the chat interface
4. Visit `/admin` to access the admin dashboard

## Step 8: Set Up Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable to your custom domain

## Troubleshooting

### Build Failures

**Error: "Cannot find module"**
- Solution: Check package.json has all dependencies
- Run `pnpm install` locally to verify

**TypeScript Errors**
- Solution: Run `pnpm typecheck` locally
- Fix errors and push again

### Database Connection Issues

**Error: "Connection refused"**
- Solution: Verify DATABASE_URL is correct
- Ensure connection string includes `?sslmode=require`

**Error: "relation does not exist"**
- Solution: Run database migrations
- Execute `pnpm db:push` with DATABASE_URL set

### Authentication Issues

**Error: "Invalid callback URL"**
- Solution: Ensure `NEXTAUTH_URL` matches your deployment URL exactly
- No trailing slash

**Error: "CSRF token mismatch"**
- Solution: Clear browser cookies
- Regenerate `NEXTAUTH_SECRET`

### AI Integration Issues

**Error: "Invalid API key"**
- Solution: Verify `ANTHROPIC_API_KEY` is correct
- Check API key permissions in Anthropic Console

**Rate Limiting**
- Solution: Implement request throttling in chat interface
- Consider caching common responses

## Performance Optimization

### Edge Caching

Add ISR (Incremental Static Regeneration) to admin page:

```typescript
// src/app/admin/page.tsx
export const revalidate = 300 // Revalidate every 5 minutes
```

### Database Connection Pooling

Neon automatically handles connection pooling, but you can optimize:

```typescript
// src/lib/db/index.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Max pool size
})
```

## Monitoring

### Vercel Analytics

1. Go to Project Settings → Analytics
2. Enable Web Analytics
3. Monitor page views, performance

### Error Tracking

Consider adding error tracking:

```bash
pnpm add @sentry/nextjs
```

## Scaling Considerations

### Background Workers

For production scraping at scale:

1. Deploy separate worker to Fly.io or Railway
2. Use job queue (BullMQ, Quirrel)
3. Schedule periodic scrapes via Vercel Cron Jobs

### Caching Strategy

Implement Redis for:
- Chat response caching
- Knowledge base query results
- Session storage

## Security Checklist

- [ ] NEXTAUTH_SECRET is randomly generated
- [ ] DATABASE_URL uses SSL (`?sslmode=require`)
- [ ] API keys are in environment variables, not code
- [ ] CORS is configured correctly
- [ ] Rate limiting is implemented on API routes
- [ ] Input validation with Zod on all endpoints
- [ ] SQL injection protection via Drizzle ORM

## Maintenance

### Update Dependencies

```bash
pnpm update --latest
pnpm build
pnpm typecheck
pnpm lint
```

### Database Backups

Neon automatically backs up your database. To manually backup:

1. Go to Neon Dashboard
2. Select your project
3. Use "Branching" feature to create snapshot

### Monitor Costs

- **Vercel**: Free tier includes 100GB bandwidth
- **Neon**: Free tier includes 0.5GB storage, 191.9 compute hours
- **Anthropic**: Pay per API request
- **R2**: Pay per storage and requests (optional)

## Support

For issues:
- Check `/CLAUDE.md` for development guidelines
- Review `/README.md` for usage instructions
- Open GitHub issue with detailed error logs
- Check Vercel deployment logs

---

**Deployment Complete!** 🎉

Your StackGuideR instance should now be live and ready to help developers find their perfect tech stack.
