# Heartly

Heartly is a gift-page builder for birthdays, weddings, anniversaries, and other
milestones. Senders create a personalised page with photos, music, messages, and
interactive responses, then share it with a private link or QR code.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4 and Radix-based UI components
- Supabase Auth, Postgres, Row Level Security, and Storage
- ClickPesa payments with a local mock provider
- Vitest for unit tests and Playwright for end-to-end tests

## Requirements

- Node.js 20 or newer
- npm
- Docker Desktop and the Supabase CLI for the local database
- Playwright Chromium for browser tests

## Getting started

```bash
npm install
cp .env.example .env.local
npx playwright install chromium
```

Start the local Supabase stack and apply the migrations:

```bash
supabase start
supabase db reset
```

Fill in `.env.local` with the keys printed by `supabase status`, then run:

```bash
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical URL used for metadata and share links |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Yes | Support address shown on public pages |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon or publishable key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | No | New publishable key format, used when present |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only key for admin operations; never expose it |
| `GIFT_UNLOCK_SECRET` | Yes | Signs password-protected gift unlock cookies |
| `PAYMENT_PROVIDER` | Yes | `mock` locally, `clickpesa` in production |
| `PAYMENT_WEBHOOK_SECRET` | Mock only | Signs simulated webhook payloads |
| `ALLOW_MOCK_PAYMENTS` | No | Set to `true` to enable simulated payments in production; leave unset in production |
| `CLICKPESA_CLIENT_ID` | Production | ClickPesa application client ID |
| `CLICKPESA_API_KEY` | Production | ClickPesa API key |
| `CLICKPESA_CHECKSUM_KEY` | Production | Signs API payloads and webhook callbacks |
| `CLICKPESA_API_BASE_URL` | Production | ClickPesa API base URL |
| `RESEND_API_KEY` | No | Enables transactional email delivery |
| `EMAIL_FROM` | No | Sender identity for transactional email |

Generate an unlock secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database

Migrations live in `supabase/migrations`:

1. `20261031000100_init.sql` creates the schema and triggers.
2. `20261031000200_rls.sql` enables Row Level Security and grants.
3. `20261031000300_storage.sql` configures Storage buckets and policies.
4. `20261031000400_seed.sql` adds categories, templates, plans, and settings.

Reset the local database with `npm run db:reset`. The seed section in
`supabase/config.toml` is intentionally disabled because starter data is created
by the initial migration.

## Payments

Local development defaults to `PAYMENT_PROVIDER=mock`. The mock provider creates
a pending payment and exposes a simulated webhook that activates Premium. Use it
to exercise the checkout return flow at `/checkout/success?reference=...`.

Production should use ClickPesa and a strong `PAYMENT_WEBHOOK_SECRET` or checksum
key. Payment status is only granted after a verified webhook; never trust the
browser redirect alone.

## Access control

- `/dashboard` requires a signed-in user.
- `/admin` additionally requires `profiles.role = 'admin'`.
- Admin users moderate gifts and manage users, reports, and settings. They do not
  edit or publish user gifts.
- Public gifts are served through `/g/[slug]`, with password-protected pages
  unlocked by a signed cookie.
- Admin actions are recorded in `audit_logs`.

## Scripts

```bash
npm run dev          # start the development server
npm run build        # production build
npm run start        # serve the production build
npm run lint         # ESLint
npm run typecheck    # TypeScript, no emit
npm run test         # Vitest unit tests
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright browser tests
npm run test:rls     # database RLS assertions (requires Docker)
npm run db:reset     # reset local Supabase and reapply migrations
```

`npm run test:rls` starts the Supabase local stack if needed and executes
`supabase/tests/rls.test.sql` inside the database container.

## Deployment

1. Create a Supabase project and apply the migrations with `supabase db push`.
2. Configure Auth redirect URLs for the production domain, including
   `/auth/callback`.
3. Create the Storage bucket used for gift media and apply its policies.
4. Set every required environment variable in the hosting provider.
5. Build and deploy with `npm run build` and `npm run start`, or use Vercel.
6. Configure a ClickPesa webhook pointing at `/api/payments/webhook/clickpesa`.
7. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin.
8. In Supabase Auth, add the production domain to the Site URL and redirect
   allow list. For local development against a hosted project, also allow
   `http://localhost:3000/**` and `http://127.0.0.1:3000/**`.
9. Configure custom SMTP (Authentication → Emails → SMTP). The built-in email
   service is heavily rate limited and only reaches project team members, so it
   cannot deliver signup confirmation emails to real users. Until SMTP is set
   up, disable "Confirm email" for testing.
9. Promote the first administrator after signing up (the app never grants admin
   through the UI):

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

10. Optionally set `RESEND_API_KEY` and `EMAIL_FROM` to enable reply, publish,
    and payment notification emails. Delivery is best effort and never blocks
    the underlying action.

## Project layout

```text
src/app/(site)          Public marketing and legal pages
src/app/g/[slug]        Public gift experience
src/app/dashboard       Authenticated sender area
src/app/admin           Admin moderation and operations
src/app/api             Auth, gifts, payments, and webhook routes
src/components          Shared UI and feature components
src/lib                 Data access, actions, entitlements, and utilities
supabase/migrations     Database schema and RLS policies
supabase/tests          RLS test SQL
e2e                     Playwright tests
```
