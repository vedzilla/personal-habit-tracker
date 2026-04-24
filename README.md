# Habit Tracker

Personal habit tracker — works great on iPhone/iPad as a home-screen PWA.

- Add habits with emoji, color, and custom input type: **checkbox, counter, slider, or number**
- Custom units (glasses, min, km, pages, …) and optional daily targets
- Today view, manage page, and 60-day heatmap + streaks
- Single-password auth (no email/verification codes), cookie session
- Supabase Postgres for storage, Next.js App Router, deploy to Vercel

## 1. Set up Supabase (free tier)

1. Create a project at https://supabase.com (pick any region close to you).
2. In the SQL Editor, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and run it.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY`

(This app uses the service role key server-side only. It is never exposed to the browser.)

## 2. Fill in `.env.local`

Copy `.env.example` to `.env.local` and fill in:

```
APP_PASSWORD=<your chosen password>
SESSION_SECRET=<32+ random hex chars, generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000. Enter your password → add habits → start logging.

## 4. Deploy to Vercel

```bash
npx vercel              # first-time: link the project
npx vercel env add APP_PASSWORD
npx vercel env add SESSION_SECRET
npx vercel env add SUPABASE_URL
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel --prod
```

Or via the dashboard: import the repo, paste all four env vars in **Settings → Environment Variables**, then deploy.

## 5. Install on your phone/iPad

Open the deployed URL in Safari → Share → **Add to Home Screen**. It runs full-screen like a native app.

## Stack

- Next.js 16 (App Router, Node.js runtime)
- Tailwind CSS v4
- Supabase (Postgres + `@supabase/supabase-js`)
- iron-session (encrypted cookie)

## File map

```
src/
  app/
    api/{login,logout,habits,entries}/route.ts   API
    habits/{page,new/page,[id]/edit/page}.tsx    Manage
    stats/page.tsx                               Heatmap
    login/page.tsx                               Sign in
    page.tsx                                     Today
    layout.tsx  icon.tsx  apple-icon.tsx
  components/HabitForm.tsx
  lib/{supabase,session,types}.ts
  proxy.ts                                       Auth gate
public/manifest.json
supabase/schema.sql
```
