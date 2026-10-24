-- Run in Supabase SQL Editor. Requires Supabase Auth users created beforehand.
create table if not exists public.site_content (
  section text primary key check (section in ('notices','guides','skills')),
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
alter table public.site_admins enable row level security;
drop policy if exists "Public site content read" on public.site_content;
create policy "Public site content read" on public.site_content for select to anon, authenticated using (true);
drop policy if exists "Admin read own membership" on public.site_admins;
create policy "Admin read own membership" on public.site_admins for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Admin insert site content" on public.site_content;
create policy "Admin insert site content" on public.site_content for insert to authenticated
  with check (exists (select 1 from public.site_admins a where a.user_id=(select auth.uid())) and updated_by=(select auth.uid()));
drop policy if exists "Admin update site content" on public.site_content;
create policy "Admin update site content" on public.site_content for update to authenticated
  using (exists (select 1 from public.site_admins a where a.user_id=(select auth.uid())))
  with check (exists (select 1 from public.site_admins a where a.user_id=(select auth.uid())) and updated_by=(select auth.uid()));
insert into public.site_content(section,payload) values
  ('notices','{"notices":[],"events":[]}'::jsonb),
  ('guides','[]'::jsonb),
  ('skills','{"jobs":[]}'::jsonb)
on conflict (section) do nothing;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('freesoo-media','freesoo-media',true,52428800, array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict (id) do nothing;
drop policy if exists "FreeSoo public media read" on storage.objects;
create policy "FreeSoo public media read" on storage.objects for select to anon, authenticated using (bucket_id='freesoo-media');
drop policy if exists "FreeSoo admin media upload" on storage.objects;
create policy "FreeSoo admin media upload" on storage.objects for insert to authenticated
  with check (bucket_id='freesoo-media' and exists(select 1 from public.site_admins a where a.user_id=(select auth.uid())));
drop policy if exists "FreeSoo admin media update" on storage.objects;
create policy "FreeSoo admin media update" on storage.objects for update to authenticated
  using (bucket_id='freesoo-media' and exists(select 1 from public.site_admins a where a.user_id=(select auth.uid())))
  with check (bucket_id='freesoo-media' and exists(select 1 from public.site_admins a where a.user_id=(select auth.uid())));
-- After creating your Auth account, grant admin privileges using your real Auth UID:
-- insert into public.site_admins(user_id) values ('YOUR_AUTH_USER_UUID');
