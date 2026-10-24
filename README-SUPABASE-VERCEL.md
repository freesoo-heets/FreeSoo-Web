# FreeSoo: Supabase + Vercel migration
1. Create a Supabase project and run `supabase/schema.sql` in SQL Editor.
2. Run `supabase/seed-existing-content.sql` after the schema to import the 5 notices/events, 4 guides, and 38 skills from the existing `main` JSON snapshot. It updates only initially empty sections and will not overwrite already-populated ones.
3. In Supabase Auth create the administrator user, copy **Auth UID**, and execute `insert into public.site_admins(user_id) values ('YOUR_AUTH_USER_UUID');` in SQL Editor. Never store passwords in GitHub.
4. Add Vercel environment variables `SUPABASE_URL` and `SUPABASE_ANON_KEY` (public/publishable key, **not service role**). Redeploy.
5. Link GitHub FreeSoo-Web project to Vercel and select root directory `./` (static HTML with /api functions).
6. Open `/admin-console.html`, sign in, then **verify the seeded JSON** (or import manually if seed was not run): copy `notices.json`, `guides.json`, `data/skills.json` in their entirety into corresponding editor sections. Download a backup first. Do not save the initially empty seeded sections before importing.
7. Test `/api/content?section=notices`, `guides`, `skills` and compare counts with the GitHub JSON sources before switching public pages to Supabase.
8. Upload existing Cloudflare R2 media to Supabase Storage `freesoo-media` and replace URLs in JSON records. Existing R2 URLs will keep working only while the R2 service remains enabled; inventory and migrate them before decommissioning.
9. Set Supabase Auth URL configuration and redirect URLs to the real Vercel domain.
10. After verifying content and media, disable/retire Cloudflare Worker/R2 separately and rotate any previously exposed credentials.
Security: `site_admins` is managed through SQL Editor only. Storage write and table changes use authenticated admin RLS. Never put service_role keys in HTML or public environment variables.
Notes: Static JSON files remain as rollback backups. The public pages may fall back to those files during staged migration. The legacy admin pages are not part of the new system; use `admin-console.html`.

## Preview deployment checkpoint (2026-10-20)
The connected Vercel project uses `main` for production. Review this feature branch via a Vercel Preview deployment before merging PR #1. The source repository is `freesoo-heets/FreeSoo-Web`. Do not merge until environment variables, API and admin checks pass.

## Preview configuration validation
Vercel variables `SUPABASE_URL` and `SUPABASE_ANON_KEY` must target both Production and Preview. After changing targets, create a new Preview deployment because existing deployments do not inherit later environment changes.
