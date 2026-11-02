-- Heartly RLS regression tests for local PostgreSQL.
-- Run after applying the bootstrap and all migrations:
--   psql -d heartly_test -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql

\set ON_ERROR_STOP on

create or replace function public.test_assert(p_condition boolean, p_message text)
returns void
language plpgsql
as $$
begin
  if p_condition is not true then
    raise exception 'ASSERTION FAILED: %', p_message;
  end if;
end;
$$;

-- Clean any previous fixture rows.
delete from public.gift_responses where gift_id in (
  select id from public.gifts where slug like 'rlstest%'
);
delete from public.gift_views where gift_id in (
  select id from public.gifts where slug like 'rlstest%'
);
delete from public.gifts where slug like 'rlstest%';
delete from public.profiles where id in (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03'
);
delete from auth.users where id in (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03'
);

insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', 'alice@example.test', '{"full_name":"Alice"}'::jsonb),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', 'bob@example.test', '{"full_name":"Bob"}'::jsonb),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03', 'admin@example.test', '{"full_name":"Admin"}'::jsonb);

select public.test_assert(
  (select count(*) from public.profiles where email in ('alice@example.test', 'bob@example.test', 'admin@example.test')) = 3,
  'auth trigger creates profiles'
);

update public.profiles set role = 'admin' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03';

-- ---------------------------------------------------------------------------
-- Alice creates a draft gift.
-- ---------------------------------------------------------------------------
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01';

insert into public.gifts (
  id, sender_id, template_id, category_id, recipient_name, sender_name,
  title, message, slug, content_data, status, visibility
) values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
  '22222222-2222-4222-8222-222222222201',
  '11111111-1111-4111-8111-111111111101',
  'Bob', 'Alice', 'Happy Birthday', 'A private draft', 'rlstestdraft01',
  '{"animation":{"type":"fade"},"music":{"enabled":false}}'::jsonb,
  'draft', 'unlisted'
);

select public.test_assert(
  (select count(*) from public.gifts where slug = 'rlstestdraft01') = 1,
  'owner can insert and read own draft'
);

-- Bob cannot see Alice's draft.
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02';
select public.test_assert(
  (select count(*) from public.gifts where slug = 'rlstestdraft01') = 0,
  'other user cannot read private draft'
);

-- Bob cannot modify it.
update public.gifts set title = 'Hijacked' where slug = 'rlstestdraft01';
select public.test_assert(
  (select title from public.gifts where slug = 'rlstestdraft01') is null,
  'other user cannot update private draft'
);

-- Bob cannot claim ownership.
do $$
begin
  begin
    insert into public.gifts (sender_id, template_id, category_id, slug, status)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
      '22222222-2222-4222-8222-222222222201',
      '11111111-1111-4111-8111-111111111101', 'rlstestforged1', 'draft');
    raise exception 'ASSERTION FAILED: forged sender_id was accepted';
  exception when others then
    if sqlerrm not like '%row-level security%' then
      raise;
    end if;
  end;
end;
$$;

-- Role escalation is blocked by the profile trigger even with a valid own-row update.
do $$
begin
  begin
    update public.profiles set role = 'admin'
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02';
    raise exception 'ASSERTION FAILED: role escalation was accepted';
  exception when others then
    if sqlerrm not like '%role_change_not_allowed%' then
      raise;
    end if;
  end;
end;
$$;

update public.profiles set full_name = 'Bobby' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02';
select public.test_assert(
  (select full_name from public.profiles where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02') = 'Bobby',
  'user can update own profile fields'
);

-- ---------------------------------------------------------------------------
-- Publishing and public access.
-- ---------------------------------------------------------------------------
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01';
update public.gifts
set status = 'published', visibility = 'public', message = 'Public message'
where slug = 'rlstestdraft01';

select public.test_assert(
  (select status from public.gifts where slug = 'rlstestdraft01') = 'published',
  'owner can publish a free gift'
);
select public.test_assert(
  (select published_at from public.gifts where slug = 'rlstestdraft01') is not null,
  'publishing sets published_at'
);

reset role;
set role anon;
select public.test_assert(
  (select count(*) from public.gifts where slug = 'rlstestdraft01') = 1,
  'anonymous user can read a public published gift'
);

-- Unlisted gifts are not directly enumerable by anon clients.
reset role;
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01';
update public.gifts set visibility = 'unlisted' where slug = 'rlstestdraft01';

reset role;
set role anon;
select public.test_assert(
  (select count(*) from public.gifts where slug = 'rlstestdraft01') = 0,
  'anonymous user cannot directly list an unlisted gift'
);
select public.test_assert(
  public.gift_accepts_public_responses('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01'),
  'unlisted live gift accepts public responses through controlled helper'
);

-- Anon cannot read owner secrets at all.
do $$
begin
  begin
    perform sender_id from public.gifts where slug = 'rlstestdraft01';
    raise exception 'ASSERTION FAILED: anon could read sender_id';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;

-- Expired gifts disappear from public reads.
reset role;
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01';
update public.gifts
set visibility = 'public', expires_at = now()
where slug = 'rlstestdraft01';
reset role;
set role anon;
select public.test_assert(
  (select count(*) from public.gifts where slug = 'rlstestdraft01') = 0,
  'expired gifts are not visible to anon'
);

-- Restore for response tests.
reset role;
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01';
update public.gifts
set expires_at = null, visibility = 'unlisted'
where slug = 'rlstestdraft01';

reset role;
set role anon;
insert into public.gift_responses (gift_id, response_type, response_data, message, respondent_name)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01', 'accept',
  '{"answer":"Yes"}'::jsonb, 'I would love to.', 'Bob'
);
reset role;
select public.test_assert(
  (select count(*) from public.gift_responses where gift_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01') = 1,
  'anon can submit a response to a live unlisted gift via controlled policy'
);

set role anon;
do $$
begin
  begin
    perform count(*) from public.gift_responses
    where gift_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01';
    raise exception 'ASSERTION FAILED: anon could read gift responses';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;

-- ---------------------------------------------------------------------------
-- Analytics isolation.
-- ---------------------------------------------------------------------------
reset role;
insert into public.gift_views (gift_id, visitor_hash)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01', 'visitor-hash-1');

set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02';
select public.test_assert(
  (select count(*) from public.gift_views where gift_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01') = 0,
  'non-owner cannot read gift analytics'
);

set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01';
select public.test_assert(
  (select count(*) from public.gift_views where gift_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01') = 1,
  'owner can read gift analytics'
);

-- ---------------------------------------------------------------------------
-- Password-protected gifts and admin.
-- ---------------------------------------------------------------------------
reset role;
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01';
update public.gifts
set visibility = 'password', password_hash = 'fake-hash', status = 'published'
where slug = 'rlstestdraft01';

reset role;
set role anon;
select public.test_assert(
  (select count(*) from public.gifts where slug = 'rlstestdraft01') = 0,
  'password-protected gift is not exposed directly to anon'
);
select public.test_assert(
  not public.gift_accepts_public_responses('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01'),
  'password-protected gift responses go through server access check only'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03';
select public.test_assert(
  (select count(*) from public.gifts where slug = 'rlstestdraft01') = 1,
  'admin can read any gift'
);
select public.test_assert(
  (select count(*) from public.profiles where email = 'alice@example.test') = 1,
  'admin can read profiles'
);

-- Regular user cannot read platform settings or audit logs.
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02';
select public.test_assert(
  (select count(*) from public.platform_settings) = 0,
  'regular user cannot read platform settings'
);
select public.test_assert(
  (select count(*) from public.audit_logs) = 0,
  'regular user cannot read audit logs'
);

-- Payment records are not writable by ordinary users.
do $$
begin
  begin
    insert into public.payments (
      user_id, plan_id, provider, provider_reference, amount, currency, status
    ) values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02',
      '33333333-3333-4333-8333-333333333302',
      'mock', 'forged-payment', 15000, 'TZS', 'succeeded'
    );
    raise exception 'ASSERTION FAILED: user could insert payment';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;

-- ---------------------------------------------------------------------------
-- Entitlement guard: free plans cannot publish premium content or exceed limits.
-- ---------------------------------------------------------------------------
reset role;
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02';

insert into public.gifts (sender_id, template_id, category_id, recipient_name, title, slug, status, visibility, content_data)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', '22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111101', 'A', 'Gift A', 'rlstestlimit01', 'published', 'unlisted', '{"animation":{"type":"fade"},"music":{"enabled":false}}'::jsonb),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', '22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111101', 'B', 'Gift B', 'rlstestlimit02', 'published', 'unlisted', '{"animation":{"type":"fade"},"music":{"enabled":false}}'::jsonb),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', '22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111101', 'C', 'Gift C', 'rlstestlimit03', 'published', 'unlisted', '{"animation":{"type":"fade"},"music":{"enabled":false}}'::jsonb);

do $$
begin
  begin
    insert into public.gifts (sender_id, template_id, category_id, recipient_name, title, slug, status, visibility, content_data)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', '22222222-2222-4222-8222-222222222201',
      '11111111-1111-4111-8111-111111111101', 'D', 'Gift D', 'rlstestlimit04', 'published', 'unlisted',
      '{"animation":{"type":"fade"},"music":{"enabled":false}}'::jsonb);
    raise exception 'ASSERTION FAILED: free active gift limit was not enforced';
  exception when others then
    if sqlerrm not like '%limit_reached:max_active_gifts%' then
      raise;
    end if;
  end;
end;
$$;

do $$
begin
  begin
    insert into public.gifts (sender_id, template_id, category_id, recipient_name, title, slug, status, visibility, content_data)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', '22222222-2222-4222-8222-222222222202',
      '11111111-1111-4111-8111-111111111101', 'E', 'Premium template', 'rlstestprem01', 'published', 'unlisted',
      '{"animation":{"type":"fade"},"music":{"enabled":false}}'::jsonb);
    raise exception 'ASSERTION FAILED: premium template was published on free plan';
  exception when others then
    if sqlerrm not like '%premium_required:premium_templates%' then
      raise;
    end if;
  end;
end;
$$;

do $$
begin
  begin
    insert into public.gifts (sender_id, template_id, category_id, recipient_name, title, slug, status, visibility, content_data)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', '22222222-2222-4222-8222-222222222201',
      '11111111-1111-4111-8111-111111111101', 'F', 'Music gift', 'rlstestmusic1', 'published', 'unlisted',
      '{"animation":{"type":"fade"},"music":{"enabled":true}}'::jsonb);
    raise exception 'ASSERTION FAILED: music was published on free plan';
  exception when others then
    if sqlerrm not like '%premium_required:music%' then
      raise;
    end if;
  end;
end;
$$;

reset role;
insert into public.subscriptions (
  user_id, plan_id, status, provider, current_period_start, current_period_end
) values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02',
  '33333333-3333-4333-8333-333333333302',
  'active', 'test', now(), now() + interval '30 days'
);

set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02';
insert into public.gifts (sender_id, template_id, category_id, recipient_name, title, slug, status, visibility, content_data)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', '22222222-2222-4222-8222-222222222202',
  '11111111-1111-4111-8111-111111111101', 'E', 'Premium template', 'rlstestprem01', 'published', 'unlisted',
  '{"animation":{"type":"confetti"},"music":{"enabled":true}}'::jsonb);

select public.test_assert(
  (select count(*) from public.gifts where slug = 'rlstestprem01' and status = 'published') = 1,
  'premium subscriber can publish premium template with music and advanced animation'
);

reset role;
delete from public.gifts where slug like 'rlstest%';
delete from public.subscriptions where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02';
delete from public.profiles where id in (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03'
);
delete from auth.users where id in (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03'
);

select 'RLS TESTS PASSED' as result;
