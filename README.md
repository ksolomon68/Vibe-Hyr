# Vibe Hyr 2.0 — The Architecture of Reality

> A Next.js 14 membership platform combining the Law of Assumption with neuroscience. Courses, quizzes, daily journaling, and community — all branded in your bold orange & black identity.

---

## Tech Stack

| Layer        | Tool                    |
|-------------|-------------------------|
| Frontend    | Next.js 14 (App Router) |
| Styling     | Tailwind CSS + Framer Motion |
| Database    | Supabase (Postgres)     |
| Auth        | Supabase Auth           |
| Payments    | Stripe Subscriptions    |
| Video       | Cloudflare Stream       |
| Email       | Resend + React Email    |
| CMS (Blog)  | Sanity.io               |
| Deploy      | Vercel                  |

---

## Quick Start

### 1. Clone and Install

```bash
cd vibehyr
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open **SQL Editor** and run the full contents of:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. In **Authentication → Providers**, enable:
   - Email/Password (already on)
   - Google (add your OAuth credentials)
4. Copy your project URL and anon key

### 3. Set Up Stripe

1. Go to [stripe.com](https://stripe.com) and create an account
2. Create two **Subscription Products**:
   - **Architect** — $27/month
   - **Reality Master** — $67/month
3. Copy the Price IDs for each
4. Set up a webhook pointing to: `https://yourdomain.com/api/stripe/webhook`
   - Events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
5. Copy your webhook signing secret

### 4. Configure Environment

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=         # From Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # From Supabase → Settings → API
SUPABASE_SERVICE_ROLE_KEY=        # From Supabase → Settings → API (secret!)

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # From Stripe Dashboard
STRIPE_SECRET_KEY=                   # From Stripe Dashboard
STRIPE_WEBHOOK_SECRET=               # From Stripe Webhook endpoint
NEXT_PUBLIC_STRIPE_ARCHITECT_PRICE_ID=  # Price ID for $27/mo plan
NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID=      # Price ID for $67/mo plan

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Add Your Logo

Copy your logo file to:
```
public/images/vhlogo.png
```

### 6. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root layout (fonts, metadata)
│   ├── globals.css           # Global styles + brand tokens
│   ├── auth/
│   │   ├── login/page.tsx    # Login page
│   │   └── signup/page.tsx   # Signup with plan selection
│   ├── dashboard/page.tsx    # Member command center
│   ├── courses/
│   │   ├── page.tsx          # Course listing
│   │   └── [slug]/page.tsx   # Individual course (to build)
│   ├── journal/page.tsx      # Daily Revision Journal
│   ├── quizzes/page.tsx      # Quiz hub (to build)
│   ├── community/page.tsx    # Forum (to build)
│   └── api/
│       └── stripe/
│           ├── checkout/route.ts   # Create Stripe session
│           └── webhook/route.ts    # Sync subscription to Supabase
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   └── PricingSection.tsx
│   ├── courses/
│   │   └── CourseCard.tsx
│   ├── quiz/
│   │   └── AssumptionLab.tsx
│   └── journal/
│       └── JournalForm.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser Supabase client
│   │   ├── server.ts         # Server Supabase client
│   │   └── middleware.ts     # Auth middleware
│   ├── data/
│   │   └── courses.ts        # Course & quiz seed data
│   └── utils.ts              # cn(), hasAccess(), formatters
├── types/index.ts             # All TypeScript types
└── middleware.ts              # Route protection
```

---

## Phase 2 Build List (Weeks 5-8)

After Phase 1 is live and collecting revenue, build these:

- [ ] `/courses/[slug]/page.tsx` — Individual course page with video player
- [ ] `/courses/[slug]/[lesson]/page.tsx` — Lesson view with notes sidebar
- [ ] `/quizzes/page.tsx` — Quiz hub with all diagnostic tools
- [ ] `/quizzes/identity-audit/page.tsx` — Full 25-question Identity Audit
- [ ] `/quizzes/sats-diagnostic/page.tsx` — SATS Mastery Diagnostic
- [ ] Journal: vibrational graph (Recharts) in sidebar
- [ ] Journal: calendar/timeline view
- [ ] Member dashboard: Life Mastery Score radar chart
- [ ] Email sequences via Resend (welcome, streak reminders)

## Phase 3 Build List (Weeks 9-12)

- [ ] `/community/page.tsx` — Forum with category channels
- [ ] `/community/[postId]/page.tsx` — Post + comments
- [ ] Course 4 content (Elite tier)
- [ ] Assumption Library (save & mark manifested)
- [ ] Accountability partner matching
- [ ] Blog with Sanity.io CMS

## Phase 4 (Month 4+)

- [ ] Claude API integration for AI journal prompts
- [ ] AI-powered quiz feedback
- [ ] React Native mobile app
- [ ] Affiliate program

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Then set production domain: vibehyr.com
```

In your Vercel dashboard:
1. Add all `.env.local` variables to Project Settings → Environment Variables
2. Connect your domain `vibehyr.com` in Domains
3. Update `NEXT_PUBLIC_APP_URL` to `https://vibehyr.com`
4. Update your Stripe webhook URL to `https://vibehyr.com/api/stripe/webhook`

---

## Stripe Test Cards

During development, use these Stripe test cards:
- `4242 4242 4242 4242` — Successful payment
- `4000 0000 0000 9995` — Card declined

---

## Support

Built for vibehyr.com. Architecture by Claude (Anthropic).
