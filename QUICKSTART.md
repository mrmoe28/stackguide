# StackGuideR - Quick Start Guide

## ✅ Repository Status

**GitHub URL**: https://github.com/mrmoe28/stackguide
**Status**: ✓ Pushed and ready
**Branch**: main
**Commits**: 1 clean commit with all files

---

## 🚀 Quick Start (5 minutes)

### 1. Clone Repository (if on different machine)

```bash
git clone https://github.com/mrmoe28/stackguide.git
cd stackguide
```

Or if already in the directory:
```bash
cd /Users/ekodevapps/Desktop/StackGuideR
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```bash
# Required
DATABASE_URL=postgresql://user:pass@your-neon-db.neon.tech/stackguider?sslmode=require
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional (for full features)
GITHUB_TOKEN=ghp_your-token-here
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-key
R2_SECRET_ACCESS_KEY=your-secret
R2_BUCKET=stackguider
```

### 4. Set Up Database

```bash
pnpm db:push
```

This creates all tables in your Neon database.

### 5. Run Development Server

```bash
pnpm dev
```

Visit: http://localhost:3000

---

## 🎯 First Steps

1. **Create Account**: Go to http://localhost:3000/auth/signup
2. **Sign In**: Use your new account to sign in
3. **Test Chat**: Ask "I'm building a SaaS with authentication"
4. **Admin Panel**: Visit http://localhost:3000/admin
5. **Scrape Data**: Use admin to scrape GitHub repos

---

## 📦 Deploy to Vercel (10 minutes)

### Option 1: Via Dashboard

1. Go to https://vercel.com/new
2. Import from GitHub: `mrmoe28/stackguide`
3. Add all environment variables from `.env`
4. Update `NEXTAUTH_URL` to your Vercel URL
5. Click Deploy

### Option 2: Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables when prompted
```

---

## 🔑 Getting API Keys

### Neon Database (Required)
1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Add to `.env` as `DATABASE_URL`

### Anthropic API (Required)
1. Go to https://console.anthropic.com
2. Create API key
3. Add to `.env` as `ANTHROPIC_API_KEY`

### GitHub Token (Optional)
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scope: `public_repo`
4. Add to `.env` as `GITHUB_TOKEN`

### Cloudflare R2 (Optional)
1. Go to https://dash.cloudflare.com/
2. R2 → Create bucket → "stackguider"
3. Manage R2 API tokens → Create API token
4. Add credentials to `.env`

---

## 📁 Project Structure

```
stackguide/
├── src/
│   ├── app/              # Next.js pages & API routes
│   ├── components/       # React components
│   └── lib/              # Utilities & integrations
├── drizzle/              # Database migrations (auto-generated)
├── .env.example          # Environment template
├── README.md             # Full documentation
├── DEPLOYMENT.md         # Deployment guide
└── PROJECT_SUMMARY.md    # Feature list
```

---

## 🧪 Test Commands

```bash
# Type check
pnpm typecheck

# Lint
pnpm lint

# Format code
pnpm format

# All checks
pnpm check

# Database GUI
pnpm db:studio
```

---

## 🐛 Common Issues

### "Cannot find module" error
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Database connection error
- Verify `DATABASE_URL` in `.env`
- Ensure it includes `?sslmode=require`
- Check Neon project is active

### NextAuth error
- Generate new secret: `openssl rand -base64 32`
- Ensure `NEXTAUTH_URL` matches your domain
- No trailing slash in URL

### Build error
```bash
pnpm check
# Fix any errors shown
pnpm build
```

---

## 📚 Documentation

- **Full Guide**: See `README.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Features**: See `PROJECT_SUMMARY.md`
- **Development**: See `CLAUDE.md`

---

## 🎉 You're Ready!

Your StackGuideR instance is:
- ✅ Pushed to GitHub
- ✅ Ready to run locally
- ✅ Ready to deploy to Vercel
- ✅ Fully documented
- ✅ Production-ready

**Start building!** 🚀
