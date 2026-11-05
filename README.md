# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Manual administrator setup

There is no administrator-creation button or application endpoint. Register an ordinary account first. Administrator rights live only in protected `public.user_roles` records, never in a profile or user-editable metadata. Database policies check `public.has_role(auth.uid(), 'admin')` without selecting from `auth.users`.

**Architecture difference:** the project requires a separate role table, so the requested `app_metadata.is_admin` authorization model is not implemented. Setting that claim alone does not grant newsroom access.

On your own Supabase deployment, the project owner runs this exact script in the SQL editor after replacing `OWNER_EMAIL_HERE` with the registered account's email:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'OWNER_EMAIL_HERE'
ON CONFLICT (user_id, role) DO NOTHING;
```

No matching account means no administrator is added. Assign additional admins the same way. Sign out and sign in again to refresh the displayed role. On Lovable Cloud, direct SQL editor access is not available; ask the editor's assistant for an owner-authorized role assignment to a specific registered account. No application endpoint performs this assignment.

To revoke newsroom access on your own deployment:

```sql
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id IN (SELECT id FROM auth.users WHERE email = 'OWNER_EMAIL_HERE');
```

## Environment variables

| Variable | Where read | Required |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser client and rendering | Yes: browser-reachable backend URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser client and rendering | Yes: public publishable key |
| `SUPABASE_URL` | Server news queries, authenticated middleware, client SSR fallback | Yes: server-reachable backend URL |
| `SUPABASE_PUBLISHABLE_KEY` | Server news queries, authenticated middleware, client SSR fallback | Yes: public publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Generated privileged server client; read lazily only when used | Optional, unused by normal features; required only for future authorized privileged operations that use that client |
| `LOVABLE_CRON_SECRET` | Generated cron authorization helper | Optional; no current application endpoint uses it |
| `LOVABLE_CRON_SECRET_PREVIOUS` | Generated cron authorization helper for rotation | Optional; no current application endpoint uses it |

Public news, sign-in, profiles, personal stories and newsroom actions do not require `SUPABASE_SERVICE_ROLE_KEY`. Privileged credentials must remain server-only, must never use a `VITE_` prefix, and must never be committed. Lovable Cloud manages its credentials; obtaining a service-role key is not necessary for this app. Build and browser-check environment settings are tooling, not application configuration.

## Portable SQL migrations

The complete SQL history is committed in `drizzle/migrations/`: `0000_migration.sql` (initial schema and sample stories), `0001_private_user_profiles.sql` (private profiles), and `0002_manual_admin_only.sql` (removes public admin setup and locks role writes). These are ordinary PostgreSQL SQL files, not ORM-generated models.

**Platform limitation:** this project's migration tool writes to `drizzle/migrations/`; direct creation of `supabase/migrations/` is blocked. The requested timestamped location could not be added here. When preparing a separate local checkout for your own deployment, copy the files byte-for-byte into a fresh Supabase CLI project using these timestamped names:

| Committed source | Destination in your separate Supabase project |
| --- | --- |
| `drizzle/migrations/0000_migration.sql` | `supabase/migrations/20261105180000_initial_news.sql` |
| `drizzle/migrations/0001_private_user_profiles.sql` | `supabase/migrations/20261105181000_private_profiles.sql` |
| `drizzle/migrations/0002_manual_admin_only.sql` | `supabase/migrations/20261105182100_manual_admin_only.sql` |

Apply them in timestamp order on an empty database, or link that separate project and run `supabase db push`. Do not apply them over an existing copy of this schema. Keep Lovable's existing migration history intact. The initial historical migration contains the old setup function; the final migration removes it, so finish all migrations before making the deployment available.

Configure the variables above, sign-in providers, redirect URLs and email delivery in the new deployment. Schema migrations do not transfer existing accounts, edited stories or uploaded media; export and transfer those separately.
