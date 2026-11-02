-- Heartly storage buckets and object policies.
-- Gift photos are public-read because recipients open gifts without an account,
-- but writes are scoped to each sender's folder. Private uploads stay private.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('gift-images', 'gift-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('template-assets', 'template-assets', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('public-assets', 'public-assets', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('user-uploads', 'user-uploads', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

-- Public read access to public buckets.
create policy "heartly_public_bucket_read"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('gift-images', 'template-assets', 'public-assets'));

-- Authenticated senders can manage files under their own uid folder.
create policy "heartly_gift_images_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'gift-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "heartly_gift_images_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'gift-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'gift-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "heartly_gift_images_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'gift-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Private user uploads: only the owner can read or write.
create policy "heartly_private_uploads_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "heartly_private_uploads_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "heartly_private_uploads_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Template and marketing assets are managed by admins only.
create policy "heartly_admin_asset_write"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('template-assets', 'public-assets')
  and public.current_user_is_admin()
);

create policy "heartly_admin_asset_update"
on storage.objects for update
to authenticated
using (
  bucket_id in ('template-assets', 'public-assets')
  and public.current_user_is_admin()
)
with check (
  bucket_id in ('template-assets', 'public-assets')
  and public.current_user_is_admin()
);

create policy "heartly_admin_asset_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('template-assets', 'public-assets')
  and public.current_user_is_admin()
);
