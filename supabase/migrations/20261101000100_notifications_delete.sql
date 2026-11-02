-- Let signed-in owners delete their own notifications.
-- The base grants only select/update, so deletes silently failed even though
-- the dashboard exposes a delete action.

grant delete on public.notifications to authenticated;

create policy "notifications_delete_own"
on public.notifications for delete
to authenticated
using (user_id = auth.uid());
