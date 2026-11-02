-- Heartly Row Level Security and grants.
-- The application never relies on the UI for authorization: every policy below
-- is enforced by PostgreSQL for direct Supabase clients as well.

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.templates enable row level security;
alter table public.gifts enable row level security;
alter table public.gift_media enable row level security;
alter table public.gift_views enable row level security;
alter table public.gift_responses enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.saved_templates enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.platform_settings enable row level security;
alter table public.audit_logs enable row level security;

-- Security-definer helper so response inserts can validate the target gift even
-- when the caller cannot read unlisted rows directly.
create or replace function public.gift_accepts_public_responses(p_gift_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.gifts g
    where g.id = p_gift_id
      and g.status = 'published'
      and g.visibility in ('public', 'unlisted')
      and (g.expires_at is null or g.expires_at > now())
      and (g.scheduled_at is null or g.scheduled_at <= now())
  );
$$;

revoke all on function public.gift_accepts_public_responses(uuid) from public;
grant execute on function public.gift_accepts_public_responses(uuid) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Grants (new Supabase projects do not auto-expose tables)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

revoke all on public.profiles from anon, authenticated;
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

revoke all on public.categories from anon, authenticated;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;

revoke all on public.templates from anon, authenticated;
grant select on public.templates to anon, authenticated;
grant insert, update, delete on public.templates to authenticated;
grant all on public.templates to service_role;

revoke all on public.gifts from anon, authenticated;
-- Anonymous visitors may read public gift rows, but never ownership secrets.
grant select (
  id, template_id, category_id, recipient_name, sender_name, title, message,
  slug, content_data, status, visibility, expires_at, scheduled_at, published_at,
  last_viewed_at, view_count, revision, created_at, updated_at
) on public.gifts to anon;
grant select, insert, update, delete on public.gifts to authenticated;
grant all on public.gifts to service_role;

revoke all on public.gift_media from anon, authenticated;
grant select on public.gift_media to anon, authenticated;
grant insert, update, delete on public.gift_media to authenticated;
grant all on public.gift_media to service_role;

revoke all on public.gift_views from anon, authenticated;
grant select on public.gift_views to authenticated;
grant all on public.gift_views to service_role;

revoke all on public.gift_responses from anon, authenticated;
grant insert on public.gift_responses to anon, authenticated;
grant select on public.gift_responses to authenticated;
grant all on public.gift_responses to service_role;

revoke all on public.plans from anon, authenticated;
grant select on public.plans to anon, authenticated;
grant insert, update, delete on public.plans to authenticated;
grant all on public.plans to service_role;

revoke all on public.subscriptions from anon, authenticated;
grant select on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;

revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;
grant all on public.payments to service_role;

revoke all on public.payment_events from anon, authenticated;
grant select on public.payment_events to authenticated;
grant all on public.payment_events to service_role;

revoke all on public.saved_templates from anon, authenticated;
grant select, insert, delete on public.saved_templates to authenticated;
grant all on public.saved_templates to service_role;

revoke all on public.notifications from anon, authenticated;
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;

revoke all on public.reports from anon, authenticated;
grant select, insert, update on public.reports to authenticated;
grant all on public.reports to service_role;

revoke all on public.platform_settings from anon, authenticated;
grant select, insert, update, delete on public.platform_settings to authenticated;
grant all on public.platform_settings to service_role;

revoke all on public.audit_logs from anon, authenticated;
grant select on public.audit_logs to authenticated;
grant insert on public.audit_logs to service_role;
grant all on public.audit_logs to service_role;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.current_user_is_admin());

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_admin_update"
on public.profiles for update
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

-- Inserts happen through the auth trigger with definer rights. Only admins may
-- insert directly.
create policy "profiles_admin_insert"
on public.profiles for insert
to authenticated
with check (public.current_user_is_admin());

-- ---------------------------------------------------------------------------
-- Categories / templates / plans
-- ---------------------------------------------------------------------------
create policy "categories_read_active_or_admin"
on public.categories for select
to anon, authenticated
using (is_active or public.current_user_is_admin());

create policy "categories_admin_write"
on public.categories for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "templates_read_active_or_admin"
on public.templates for select
to anon, authenticated
using (is_active or public.current_user_is_admin());

create policy "templates_admin_write"
on public.templates for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "plans_read_active_or_admin"
on public.plans for select
to anon, authenticated
using (is_active or public.current_user_is_admin());

create policy "plans_admin_write"
on public.plans for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

-- ---------------------------------------------------------------------------
-- Gifts
-- ---------------------------------------------------------------------------
create policy "gifts_select_own_or_admin"
on public.gifts for select
to authenticated
using (sender_id = auth.uid() or public.current_user_is_admin());

-- Direct anon reads are limited to truly public, live gifts. Unlisted and
-- password-protected gifts are only ever served by our server using the
-- service role after access checks.
create policy "gifts_select_public"
on public.gifts for select
to anon
using (
  status = 'published'
  and visibility = 'public'
  and (expires_at is null or expires_at > now())
  and (scheduled_at is null or scheduled_at <= now())
);

create policy "gifts_insert_own"
on public.gifts for insert
to authenticated
with check (sender_id = auth.uid());

create policy "gifts_update_own"
on public.gifts for update
to authenticated
using (sender_id = auth.uid())
with check (sender_id = auth.uid());

create policy "gifts_admin_update"
on public.gifts for update
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "gifts_delete_own"
on public.gifts for delete
to authenticated
using (sender_id = auth.uid());

create policy "gifts_admin_delete"
on public.gifts for delete
to authenticated
using (public.current_user_is_admin());

-- ---------------------------------------------------------------------------
-- Gift media
-- ---------------------------------------------------------------------------
create policy "gift_media_select_own_or_public"
on public.gift_media for select
to anon, authenticated
using (
  exists (
    select 1 from public.gifts g
    where g.id = gift_id
      and (
        g.sender_id = auth.uid()
        or public.current_user_is_admin()
        or (
          g.status = 'published'
          and g.visibility = 'public'
          and (g.expires_at is null or g.expires_at > now())
          and (g.scheduled_at is null or g.scheduled_at <= now())
        )
      )
  )
);

create policy "gift_media_write_own"
on public.gift_media for all
to authenticated
using (
  exists (select 1 from public.gifts g where g.id = gift_id and g.sender_id = auth.uid())
)
with check (
  exists (select 1 from public.gifts g where g.id = gift_id and g.sender_id = auth.uid())
);

create policy "gift_media_admin_write"
on public.gift_media for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

-- ---------------------------------------------------------------------------
-- Gift views (written by trusted server code with the service role only)
-- ---------------------------------------------------------------------------
create policy "gift_views_select_owner_or_admin"
on public.gift_views for select
to authenticated
using (
  exists (
    select 1 from public.gifts g
    where g.id = gift_id
      and (g.sender_id = auth.uid() or public.current_user_is_admin())
  )
);

-- ---------------------------------------------------------------------------
-- Gift responses
-- ---------------------------------------------------------------------------
create policy "gift_responses_insert_public_gifts"
on public.gift_responses for insert
to anon, authenticated
with check (
  public.gift_accepts_public_responses(gift_id)
  and length(coalesce(message, '')) <= 2000
  and length(coalesce(respondent_name, '')) <= 120
);

create policy "gift_responses_select_owner_or_admin"
on public.gift_responses for select
to authenticated
using (
  exists (
    select 1 from public.gifts g
    where g.id = gift_id
      and (g.sender_id = auth.uid() or public.current_user_is_admin())
  )
);

-- ---------------------------------------------------------------------------
-- Subscriptions / payments (read-only to owners; mutated by verified webhooks)
-- ---------------------------------------------------------------------------
create policy "subscriptions_select_own_or_admin"
on public.subscriptions for select
to authenticated
using (user_id = auth.uid() or public.current_user_is_admin());

create policy "payments_select_own_or_admin"
on public.payments for select
to authenticated
using (user_id = auth.uid() or public.current_user_is_admin());

create policy "payment_events_select_admin"
on public.payment_events for select
to authenticated
using (public.current_user_is_admin());

-- ---------------------------------------------------------------------------
-- Saved templates
-- ---------------------------------------------------------------------------
create policy "saved_templates_select_own"
on public.saved_templates for select
to authenticated
using (user_id = auth.uid());

create policy "saved_templates_insert_own"
on public.saved_templates for insert
to authenticated
with check (user_id = auth.uid());

create policy "saved_templates_delete_own"
on public.saved_templates for delete
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
create policy "notifications_select_own"
on public.notifications for select
to authenticated
using (user_id = auth.uid());

create policy "notifications_update_own"
on public.notifications for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Reports
-- ---------------------------------------------------------------------------
create policy "reports_insert_own"
on public.reports for insert
to authenticated
with check (reporter_id = auth.uid());

create policy "reports_select_own_or_admin"
on public.reports for select
to authenticated
using (reporter_id = auth.uid() or public.current_user_is_admin());

create policy "reports_admin_update"
on public.reports for update
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

-- ---------------------------------------------------------------------------
-- Platform settings / audit logs (admin only)
-- ---------------------------------------------------------------------------
create policy "platform_settings_admin_all"
on public.platform_settings for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "audit_logs_admin_select"
on public.audit_logs for select
to authenticated
using (public.current_user_is_admin());
