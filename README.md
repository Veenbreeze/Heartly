# Heartly

[![CI](https://github.com/Veenbreeze/Heartly/actions/workflows/ci.yml/badge.svg)](https://github.com/Veenbreeze/Heartly/actions/workflows/ci.yml)

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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | One of | Public anon key; use the publishable key instead when available |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | One of | New publishable key format, preferred when present |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only key for admin operations; never expose it |
| `GIFT_UNLOCK_SECRET` | Yes | Signs password-protected gift unlock cookies |
| `PAYMENT_PROVIDER` | Yes | `mock` locally, `clickpesa` in production |
| `PAYMENT_WEBHOOK_SECRET` | Mock only | Signs simulated webhook payloads |
| `ALLOW_MOCK_PAYMENTS` | No | Set to `true` to enable simulated payments in production; leave unset in production |
| `CLICKPESA_CLIENT_ID` | Production | Hosted application client ID from ClickPesa Developers |
| `CLICKPESA_API_KEY` | Production | Hosted application API key from ClickPesa Developers |
| `CLICKPESA_CHECKSUM_KEY` | Production | Checksum secret configured for the ClickPesa application |
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
5. `20261103000100_more_templates.sql` adds the expanded animated template
   catalogue.

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

Heartly is deployed on Vercel at
<https://heartly-ashy.vercel.app>. GitHub `master` is connected
to the Vercel project, so every push to `master` creates a production
deployment. GitHub Pages is not suitable because the app relies on Next.js
server actions, API routes, middleware, and Supabase SSR.

1. Create a Supabase project and apply the migrations:
   `supabase db push` (or `supabase db query --linked --file <migration>`).
2. In Supabase Auth → URL Configuration, set the Site URL to the production
   origin and add these redirect URLs:
   - `https://heartly-ashy.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` and
     `http://127.0.0.1:3000/auth/callback` for local
     development against the hosted project
3. Set the environment variables in Vercel (Project → Settings → Environment
   Variables, or `vercel env add <name> production`) from the table above. Set
   `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin.
4. Deploy with `vercel deploy --prod`, or push to `master` if the Git
   integration is connected.
5. Configure the six digit confirmation email:
   - In EmailJS, connect a verified sender service and create an email template.
     Set **To Email** to `{{to_email}}`, **Subject** to `{{email_subject}}`, and
     include `{{otp_code}}`, `{{action_label}}`, and `{{action_url}}` in the body.
   - Copy `supabase/functions/.env.example` to
     `supabase/functions/.env`, then fill in `EMAILJS_SERVICE_ID`,
     `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`, and
     `SEND_EMAIL_HOOK_SECRET`.
   - In Supabase, enable email confirmation and keep the email OTP length at 6.
     Under **Authentication → Hooks**, configure **Send Email** to
     `https://<project-ref>.supabase.co/functions/v1/send-auth-email`. Generate
     a hook secret and use that same value for `SEND_EMAIL_HOOK_SECRET`.
   - Link the project, upload the Edge Function secrets, and deploy the
     function:

     ```bash
     supabase link --project-ref <project-ref>
     supabase secrets set --env-file supabase/functions/.env
     supabase functions deploy send-auth-email --no-verify-jwt
     ```

     The hook verifies Supabase's signed request before sending through EmailJS.
     EmailJS's private key stays in Edge Function secrets and is never sent to
     the browser. Local Supabase has six digit confirmations enabled in
     `supabase/config.toml` and captures email in its local inbox.
6. Enable Google sign in and sign up:
   - In Google Cloud, create an OAuth client with application type **Web**.
     Add `https://heartly-ashy.vercel.app` as an authorized JavaScript origin.
   - Copy the OAuth callback URL shown in Supabase Authentication under
     **Sign In Providers > Google** into Google's **Authorized redirect URIs**.
     It has the form `https://<project-ref>.supabase.co/auth/v1/callback`.
   - Enable Google in Supabase and save the Google Client ID and Client Secret
     there. Do not put the client secret in Vercel. The app already uses the
     Supabase Google OAuth flow for both login and registration.
   - In Supabase Authentication under **URL Configuration**, use
     `https://heartly-ashy.vercel.app` as the Site URL and allow
     `https://heartly-ashy.vercel.app/auth/callback`. Add
     `http://localhost:3000/auth/callback` when using the hosted Supabase
     project locally.
   - For local Supabase only, copy `supabase/.env.example` to the repository
     root as `.env`, add the Google Client ID and Secret, set
     `[auth.external.google].enabled = true` in `supabase/config.toml`, then
     restart Supabase with `supabase stop` and `supabase start`.
7. Promote the first administrator after signing up (the app never grants admin
   through the UI):

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

8. Optionally set `RESEND_API_KEY` and `EMAIL_FROM` to enable reply, publish,
   and payment notification emails. Delivery is best effort and never blocks
   the underlying action.
9. Configure ClickPesa mobile money:
   - Create and verify a ClickPesa merchant account. Complete KYC and enable
     the collection channels you want to offer.
   - In **Settings → Developers**, create an **API** application and enable the
     **Collection API** feature so Heartly can send mobile money prompts. Also
     enable **Hosted Checkout** as a fallback and set its Return URL to
     `https://<your-domain>/checkout/success`.
   - Copy the application **Client ID** and **API Key** into their server
     environment variables. Set `CLICKPESA_CHECKSUM_KEY` to the application's
     checksum secret. Keep these values private.
   - Configure the application's `PAYMENT RECEIVED` and `PAYMENT FAILED`
     webhooks as `https://<your-domain>/api/payments/webhook/clickpesa`.
     Each checkout also sends its success callback to this endpoint.
   - Set `PAYMENT_PROVIDER=clickpesa`, set `NEXT_PUBLIC_SITE_URL` to the
     deployed HTTPS origin, and remove `ALLOW_MOCK_PAYMENTS`. Mobile money
     prompts use the channels activated for the merchant, including M-Pesa,
     HaloPesa, Airtel Money, and Mixx by Yas when available. If the application
     does not have Collection API access, Heartly falls back to hosted checkout
     automatically, where the customer can pay with mobile money or card.
   - Test with a low value real payment after the account and channels are
     approved. ClickPesa documents production testing rather than a sandbox.

Local development defaults to mock payments. Production uses ClickPesa with
mock payments disabled.

## CI/CD

- **Continuous Integration** runs on every push and pull request to `master`
  via GitHub Actions: typecheck, lint, Vitest unit tests, production build, and
  Playwright (Chromium) end-to-end tests. See `.github/workflows/ci.yml`.
- **Continuous Deployment** is handled by Vercel. The `Veenbreeze/Heartly`
  repository is connected to the Vercel project, so every push to `master`
  triggers a production build and deployment. Pull requests get preview
  deployments automatically.
- **Live deployment**: <https://heartly-veenbreezes-projects.vercel.app>.
- **Dependabot** opens weekly pull requests for npm and GitHub Actions updates;
  those PRs run through CI and receive Vercel preview deployments.

Protect `master` in GitHub and require the `Typecheck, lint, unit tests`,
`Production build`, and `Playwright (chromium)` checks before merging. If you
later want deployments gated by CI, disable Vercel's automatic Git deployments
and add a `deploy` job that runs the Vercel CLI with `VERCEL_TOKEN`,
`VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` repository secrets.

## Known gaps

`docs/UNIMPLEMENTED.md` records features that are mocked, deferred, or require
external credentials (live ClickPesa payments, optional Resend email, video
uploads, self-service data export, and similar).

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
