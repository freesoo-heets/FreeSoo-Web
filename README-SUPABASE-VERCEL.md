# FreeSoo: Supabase + Vercel migration
1. Create a Supabase project and run `supabase/schema.sql` in SQL Editor.
2. In Supabase Auth create the administrator user, copy **Auth UID**, and execute `insert into public.site_admins(user_id) values ('YOUR_AUTH_USER_UUID');` in SQL Editor. Never store passwords in GitHub.
3. Add Vercel environment variables `SUPABASE_URL` and `SUPABASE_ANON_KEY` (public/publishable key, **not service role**). Redeploy.
4. Link GitHub FreeSoo-Web project to Vercel and select root directory `./` (static HTML with /api functions).
5. Open `/admin-console.html`, sign in, then **import existing legacy JSON**: copy `notices.json`, `guides.json`, `data/skills.json` in their entirety into corresponding editor sections. Download a backup first. Do not save the initially empty seeded sections before importing.
6. Test `/api/content?section=notices`, `guides`, `skills` and compare counts with the GitHub JSON sources before switching public pages to Supabase.
7. Upload existing Cloudflare R2 media to Supabase Storage `freesoo-media` and replace URLs in JSON records. Existing R2 URLs will keep working only while the R2 service remains enabled; inventory and migrate them before decommissioning.
8. Set Supabase Auth URL configuration and redirect URLs to the real Vercel domain.
9. After verifying content and media, disable/retire Cloudflare Worker/R2 separately and rotate any previously exposed credentials.
Security: `site_admins` is managed through SQL Editor only. Storage write and table changes use authenticated admin RLS. Never put service_role keys in HTML or public environment variables.
Notes: Static JSON files remain as rollback backups. The public pages may fall back to those files during staged migration. The legacy admin pages are not part of the new system; use `admin-console.html`.
