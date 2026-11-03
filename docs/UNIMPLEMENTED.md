# Unimplemented and configuration-dependent features

This file tracks parts of Heartly that are intentionally incomplete, mocked for
the demo, or require external credentials. It is the single place to check before
assuming a feature works in production.

Nothing in the public UI uses placeholder copy for these items: the product
describes what it actually does, and this document records the gaps for the team.

## Demo-only or configuration-dependent

### Live payments

- The local and demo deployment use `PAYMENT_PROVIDER=mock` with
  `ALLOW_MOCK_PAYMENTS=true`.
- The mock checkout creates a pending payment and activates Premium through a
  simulated webhook so the full flow can be tested without real money.
- The ClickPesa integration is wired (`/api/payments/checkout` and
  `/api/payments/webhook/clickpesa`) but has not been verified against a live
  ClickPesa account in this repository.
- Before real sales: set `PAYMENT_PROVIDER=clickpesa`, provide
  `CLICKPESA_CLIENT_ID`, `CLICKPESA_API_KEY`, `CLICKPESA_CHECKSUM_KEY`, point the
  webhook at the deployment, and remove `ALLOW_MOCK_PAYMENTS`.

### Transactional email

- Email is sent through Resend only when `RESEND_API_KEY` is set.
- Without it, notifications are recorded in the app and delivery is skipped
  silently. The product never reports a delivery failure to the sender.
- There is no inbound email handling, reply parsing, or inbox sync.

### Notifications

- Notifications are in-app (the bell in the header and `/dashboard/notifications`).
- Optional email copies depend on Resend being configured.
- There is no SMS, WhatsApp, browser push, or mobile push delivery.

## Not implemented yet

### Media

- Gifts support image URLs and uploaded images only.
- There is no video upload, video background, or audio upload.
- Background music uses four generated ambient patterns (`none`, `dreamy`,
  `romantic`, `playful`) rather than licensed audio files.

### Analytics

- Analytics show aggregate views, unique visitors, daily counts, and replies.
- Recipients are never identified; only a salted visitor hash is stored.
- There is no CSV export, real-time dashboard, funnel analysis, or per-country
  breakdown.
- `advanced_analytics` is a plan entitlement, but the current analytics page does
  not gate individual charts behind it.

### Scheduled delivery and expiry

- `scheduled_at` and `expires_at` are enforced when a gift is read.
- There is no background cron worker sending an email at the scheduled moment;
  the gift becomes available on the first request after that time.
- Expired gifts are rejected on read, but no periodic cleanup job deletes old
  media or rows.

### Account data controls

- Account deletion and data export are handled manually through support.
- There is no self-service download or delete button yet.

### Language and currency

- `locale` (`en` / `sw`) and `currency` (`TZS` / `USD`) are stored on profiles.
- The interface is currently English-only; the locale preference does not
  translate the UI yet.
- Currency formatting uses the stored preference where prices are displayed, but
  there is no live exchange-rate conversion.

### Search and discovery

- Template search filters the catalogue in the browser after it is loaded.
- There is no database full-text search, saved searches, or personalised
  recommendations.

### Moderation and safety

- Admin moderation, reports, and audit logs are manual.
- There is no automated image scanning, text classification, or CSAM detection
  provider.

### Content and growth

- There is no blog, referral programme, embed widget, or native mobile app.
- Social sharing uses the browser share sheet and copyable links; there are no
  platform-specific SDK integrations.

## Adding to this list

When a feature is mocked, gated behind credentials, or deliberately deferred,
add it here with a short note about what works today and what is missing. When it
ships, remove the entry and update the relevant README section.
