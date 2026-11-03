create or replace function public.heartly_remove_display_hyphens(value jsonb)
returns jsonb
language plpgsql
immutable
as $$
begin
  if jsonb_typeof(value) = 'string' then
    return to_jsonb(replace(value #>> '{}', '-', ' '));
  elsif jsonb_typeof(value) = 'array' then
    return (
      select coalesce(jsonb_agg(public.heartly_remove_display_hyphens(item)), '[]'::jsonb)
      from jsonb_array_elements(value) as item
    );
  elsif jsonb_typeof(value) = 'object' then
    return (
      select coalesce(jsonb_object_agg(key, public.heartly_remove_display_hyphens(item)), '{}'::jsonb)
      from jsonb_each(value) as entry(key, item)
    );
  end if;
  return value;
end;
$$;

update public.categories
set description = replace(description, '-', ' ')
where description like '%-%';

update public.templates
set description = replace(description, '-', ' '),
    default_content = public.heartly_remove_display_hyphens(default_content)
where description like '%-%'
   or default_content::text like '%-%';

drop function public.heartly_remove_display_hyphens(jsonb);
