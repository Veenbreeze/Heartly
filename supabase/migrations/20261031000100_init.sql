-- Heartly core schema
-- All timestamps are stored in UTC. Presentation converts to Africa/Dar_es_Salaam.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('user', 'admin');
create type public.gift_status as enum ('draft', 'published', 'unpublished', 'expired');
create type public.gift_visibility as enum ('public', 'unlisted', 'password');
create type public.subscription_status as enum ('pending', 'active', 'past_due', 'canceled', 'expired');
create type public.payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

-- ---------------------------------------------------------------------------
-- Generic helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'user',
  locale text not null default 'en' check (locale in ('en', 'sw')),
  currency text not null default 'TZS' check (currency in ('TZS', 'USD')),
  bio text,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to anon, authenticated, service_role;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Create a profile for every auth user. Runs as definer because auth.users is protected.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Block self-service privilege escalation. Service role and admins may change roles.
create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.current_user_is_admin() then
    raise exception 'role_change_not_allowed' using errcode = '42501';
  end if;
  new.created_at = old.created_at;
  return new;
end;
$$;

revoke all on function public.prevent_profile_role_escalation() from public;

create trigger profiles_prevent_role_escalation
before update on public.profiles
for each row execute function public.prevent_profile_role_escalation();

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  name text not null,
  description text not null default '',
  thumbnail_url text,
  is_premium boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_active_order_idx on public.categories (is_active, sort_order);

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Templates
-- ---------------------------------------------------------------------------
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  name text not null,
  description text not null default '',
  category_id uuid not null references public.categories(id) on delete restrict,
  template_type text not null check (template_type in (
    'birthday', 'love_letter', 'anniversary', 'dinner_date', 'beach_date',
    'friendship', 'appreciation', 'valentine', 'question', 'surprise',
    'celebration', 'custom'
  )),
  thumbnail_url text,
  preview_url text,
  is_premium boolean not null default false,
  config_schema jsonb not null default '{}'::jsonb,
  default_content jsonb not null default '{}'::jsonb,
  default_colors jsonb not null default '{}'::jsonb,
  default_typography jsonb not null default '{}'::jsonb,
  animation_config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index templates_category_idx on public.templates (category_id);
create index templates_active_idx on public.templates (is_active, sort_order);

create trigger templates_set_updated_at
before update on public.templates
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Plans and subscriptions (created before gifts so entitlement functions can
-- reference them while being validated at creation time).
-- ---------------------------------------------------------------------------
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9_]{2,40}$'),
  name text not null,
  description text not null default '',
  price_tzs integer not null default 0 check (price_tzs >= 0),
  price_usd_cents integer not null default 0 check (price_usd_cents >= 0),
  billing_interval text not null default 'month' check (billing_interval in ('month', 'year', 'lifetime')),
  features jsonb not null default '[]'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger plans_set_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status public.subscription_status not null default 'pending',
  provider text not null default 'mock',
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index subscriptions_one_active_per_user
  on public.subscriptions (user_id)
  where status = 'active';

create index subscriptions_user_idx on public.subscriptions (user_id, created_at desc);
create index subscriptions_provider_idx on public.subscriptions (provider, provider_subscription_id);

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Gifts
-- ---------------------------------------------------------------------------
create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete cascade,
  guest_token_hash text,
  template_id uuid not null references public.templates(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  recipient_name text not null default '',
  sender_name text not null default '',
  title text not null default '',
  message text not null default '',
  slug text not null unique check (slug ~ '^[a-z0-9]{8,32}$'),
  content_data jsonb not null default '{}'::jsonb,
  status public.gift_status not null default 'draft',
  visibility public.gift_visibility not null default 'unlisted',
  password_hash text,
  expires_at timestamptz,
  scheduled_at timestamptz,
  published_at timestamptz,
  last_viewed_at timestamptz,
  view_count integer not null default 0 check (view_count >= 0),
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gifts_owner_present check (sender_id is not null or guest_token_hash is not null),
  constraint gifts_password_requires_hash check (
    (visibility = 'password' and password_hash is not null)
    or (visibility <> 'password')
  ),
  constraint gifts_expiry_after_creation check (expires_at is null or expires_at > created_at),
  constraint gifts_published_requires_date check (status <> 'published' or published_at is not null)
);

create index gifts_sender_idx on public.gifts (sender_id, status, updated_at desc);
create index gifts_template_idx on public.gifts (template_id);
create index gifts_category_idx on public.gifts (category_id);
create index gifts_public_idx on public.gifts (status, visibility, published_at desc)
  where status = 'published';
create index gifts_slug_idx on public.gifts (slug);

create trigger gifts_set_updated_at
before update on public.gifts
for each row execute function public.set_updated_at();

-- Published gifts must have a publication timestamp.
create or replace function public.set_gift_publish_timestamp()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  if new.status = 'draft' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

create trigger gifts_set_publish_timestamp
before insert or update on public.gifts
for each row execute function public.set_gift_publish_timestamp();

-- Effective plan limits. Used by the publish guard below and exposed to the app
-- through a separate server-side query (never via anon RPC).
create or replace function public.plan_limits_for_user(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select p.limits || jsonb_build_object('tier', p.code, 'plan_name', p.name)
      from public.subscriptions s
      join public.plans p on p.id = s.plan_id
      where s.user_id = p_user_id
        and s.status = 'active'
        and (s.current_period_end is null or s.current_period_end > now())
      order by s.created_at desc
      limit 1
    ),
    (
      select p.limits || jsonb_build_object('tier', p.code, 'plan_name', p.name)
      from public.plans p
      where p.code = 'free'
      limit 1
    ),
    '{}'::jsonb
  );
$$;

revoke all on function public.plan_limits_for_user(uuid) from public;
grant execute on function public.plan_limits_for_user(uuid) to service_role;

-- Enforce entitlements at the database boundary so UI bypasses cannot work.
create or replace function public.enforce_publish_entitlements()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limits jsonb;
  v_premium boolean;
  v_template_premium boolean;
  v_active_count integer;
  v_max_active integer;
  v_animation text;
begin
  if new.status <> 'published' or new.sender_id is null then
    return new;
  end if;

  v_limits := public.plan_limits_for_user(new.sender_id);
  v_premium := coalesce((v_limits ->> 'premium_templates')::boolean, false)
    or coalesce((v_limits ->> 'tier') = 'premium', false);

  select is_premium into v_template_premium
  from public.templates where id = new.template_id;

  if v_template_premium and not v_premium then
    raise exception 'premium_required:premium_templates' using errcode = 'P0001';
  end if;

  if coalesce((new.content_data #>> '{music,enabled}')::boolean, false)
     and not coalesce((v_limits ->> 'music')::boolean, false) then
    raise exception 'premium_required:music' using errcode = 'P0001';
  end if;

  v_animation := coalesce(new.content_data #>> '{animation,type}', 'none');
  if v_animation not in ('none', 'fade', 'float')
     and not coalesce((v_limits ->> 'advanced_animation')::boolean, false) then
    raise exception 'premium_required:advanced_animation' using errcode = 'P0001';
  end if;

  if new.scheduled_at is not null and new.scheduled_at > now()
     and not coalesce((v_limits ->> 'scheduled_delivery')::boolean, false) then
    raise exception 'premium_required:scheduled_delivery' using errcode = 'P0001';
  end if;

  v_max_active := coalesce((v_limits ->> 'max_active_gifts')::integer, 3);
  select count(*) into v_active_count
  from public.gifts g
  where g.sender_id = new.sender_id
    and g.status = 'published'
    and g.id <> new.id
    and (g.expires_at is null or g.expires_at > now());

  if v_active_count >= v_max_active then
    raise exception 'limit_reached:max_active_gifts' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_publish_entitlements() from public;

create trigger gifts_enforce_entitlements
before insert or update of status, template_id, content_data, scheduled_at
on public.gifts
for each row execute function public.enforce_publish_entitlements();

-- ---------------------------------------------------------------------------
-- Gift media / views / responses
-- ---------------------------------------------------------------------------
create table public.gift_media (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references public.gifts(id) on delete cascade,
  storage_path text not null,
  public_url text,
  media_type text not null default 'image' check (media_type in ('image', 'audio', 'video')),
  alt_text text,
  sort_order integer not null default 0,
  size_bytes integer check (size_bytes is null or size_bytes >= 0),
  created_at timestamptz not null default now()
);

create index gift_media_gift_idx on public.gift_media (gift_id, sort_order);

create table public.gift_views (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references public.gifts(id) on delete cascade,
  visitor_hash text not null,
  view_date date not null default (now() at time zone 'utc')::date,
  referrer text,
  created_at timestamptz not null default now(),
  unique (gift_id, visitor_hash, view_date)
);

create index gift_views_gift_idx on public.gift_views (gift_id, created_at desc);

create table public.gift_responses (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references public.gifts(id) on delete cascade,
  response_type text not null check (response_type in (
    'accept', 'decline', 'answer', 'message', 'reaction'
  )),
  response_data jsonb not null default '{}'::jsonb,
  message text,
  respondent_name text,
  visitor_hash text,
  created_at timestamptz not null default now()
);

create index gift_responses_gift_idx on public.gift_responses (gift_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  plan_id uuid not null references public.plans(id) on delete restrict,
  provider text not null,
  provider_reference text not null,
  amount integer not null check (amount >= 0),
  currency text not null check (currency in ('TZS', 'USD')),
  status public.payment_status not null default 'pending',
  checkout_url text,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_reference)
);

create index payments_user_idx on public.payments (user_id, created_at desc);
create index payments_status_idx on public.payments (status, created_at desc);

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  payment_id uuid references public.payments(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create index payment_events_payment_idx on public.payment_events (payment_id);

-- ---------------------------------------------------------------------------
-- Engagement tables
-- ---------------------------------------------------------------------------
create table public.saved_templates (
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, template_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, read_at, created_at desc);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  gift_id uuid references public.gifts(id) on delete set null,
  reason text not null check (reason in (
    'spam', 'harassment', 'copyright', 'explicit', 'impersonation', 'other'
  )),
  details text,
  status public.report_status not null default 'open',
  resolution_notes text,
  resolved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reports_status_idx on public.reports (status, created_at desc);

create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

create table public.platform_settings (
  key text primary key check (key ~ '^[a-z0-9_.-]{2,80}$'),
  value jsonb not null,
  description text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create trigger platform_settings_set_updated_at
before update on public.platform_settings
for each row execute function public.set_updated_at();

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);

-- Notify the sender when a gift goes live. Guest gifts have no account to notify.
create or replace function public.notify_gift_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' and old.status is distinct from 'published' and new.sender_id is not null then
    insert into public.notifications (user_id, type, title, body, metadata)
    values (
      new.sender_id,
      'gift_published',
      'Your gift is ready to share',
      coalesce(nullif(new.title, ''), 'Your gift') || ' for ' || coalesce(nullif(new.recipient_name, ''), 'someone special') || ' is live.',
      jsonb_build_object('gift_id', new.id, 'slug', new.slug)
    );
  end if;
  return new;
end;
$$;

revoke all on function public.notify_gift_published() from public;

create trigger gifts_notify_published
after update on public.gifts
for each row execute function public.notify_gift_published();

-- Keep aggregate view counters in sync with individual, de-duplicated views.
create or replace function public.bump_gift_view_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.gifts
  set view_count = view_count + 1,
      last_viewed_at = now()
  where id = new.gift_id;
  return new;
end;
$$;

revoke all on function public.bump_gift_view_count() from public;

create trigger gift_views_bump_count
after insert on public.gift_views
for each row execute function public.bump_gift_view_count();

-- Notify signed-in senders when someone replies to their gift.
create or replace function public.notify_gift_response()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender uuid;
  v_title text;
  v_slug text;
begin
  select sender_id, coalesce(nullif(title, ''), 'Your gift'), slug
  into v_sender, v_title, v_slug
  from public.gifts where id = new.gift_id;

  if v_sender is not null then
    insert into public.notifications (user_id, type, title, body, metadata)
    values (
      v_sender,
      'gift_response',
      'Someone replied to your gift',
      v_title || ' received a new ' || new.response_type || ' response.',
      jsonb_build_object('gift_id', new.gift_id, 'slug', v_slug, 'response_id', new.id)
    );
  end if;
  return new;
end;
$$;

revoke all on function public.notify_gift_response() from public;

create trigger gift_responses_notify_sender
after insert on public.gift_responses
for each row execute function public.notify_gift_response();
