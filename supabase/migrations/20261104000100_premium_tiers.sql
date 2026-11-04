insert into public.plans (
  id, code, name, description, price_tzs, price_usd_cents, billing_interval,
  features, limits, sort_order, is_active
)
values
  (
    '33333333-3333-4333-8333-333333333302', 'premium', 'Heartly Premium',
    'Every template, every detail, and every way to make someone feel special.',
    3000, 199, 'month',
    '["Up to 20 active gifts","All premium templates","Advanced animations","5 photos per gift","Background music","QR codes","Advanced analytics","Scheduled delivery","Password protection","Remove Heartly branding"]',
    '{"tier":"premium","max_active_gifts":20,"max_media":5,"premium_templates":true,"advanced_animation":true,"music":true,"custom_fonts":true,"qr_code":true,"advanced_analytics":true,"scheduled_delivery":true,"remove_branding":true,"gift_expiry":true,"password_protection":true}',
    20, true
  ),
  (
    '33333333-3333-4333-8333-333333333303', 'premium_plus', 'Heartly Premium Plus',
    'More room for the people and moments that matter most.',
    8000, 499, 'month',
    '["Up to 50 active gifts","All premium templates","Advanced animations","10 photos per gift","Background music","QR codes","Advanced analytics","Scheduled delivery","Password protection","Remove Heartly branding"]',
    '{"tier":"premium","max_active_gifts":50,"max_media":10,"premium_templates":true,"advanced_animation":true,"music":true,"custom_fonts":true,"qr_code":true,"advanced_analytics":true,"scheduled_delivery":true,"remove_branding":true,"gift_expiry":true,"password_protection":true}',
    30, true
  ),
  (
    '33333333-3333-4333-8333-333333333304', 'premium_max', 'Heartly Premium Max',
    'The full Heartly studio, with room for everything you want to create.',
    15000, 999, 'month',
    '["Up to 100 active gifts","All premium templates","Advanced animations","20 photos per gift","Background music","QR codes","Advanced analytics","Scheduled delivery","Password protection","Remove Heartly branding"]',
    '{"tier":"premium","max_active_gifts":100,"max_media":20,"premium_templates":true,"advanced_animation":true,"music":true,"custom_fonts":true,"qr_code":true,"advanced_analytics":true,"scheduled_delivery":true,"remove_branding":true,"gift_expiry":true,"password_protection":true}',
    40, true
  )
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  price_tzs = excluded.price_tzs,
  price_usd_cents = excluded.price_usd_cents,
  billing_interval = excluded.billing_interval,
  features = excluded.features,
  limits = excluded.limits,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
