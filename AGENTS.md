<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Public news pages use TanStack Query loaders and route-specific metadata so stories are searchable and shareable.
- Personal pages live under the authenticated layout; database RLS enforces owner and newsroom access independently of the UI.
- Use the shared design-system Button for interactive actions and semantic stylesheet tokens for visuals.
- Store administrator privileges only in protected public.user_roles records and enforce them through has_role in RLS; client metadata must never authorize writes.
- Administrator provisioning is manual SQL only; no application RPC or UI may grant roles, preventing public privilege escalation.
- Social sign-in calls supabase.auth.signInWithOAuth directly (Google) because the app is deployed on Vercel against its own Supabase project; the Lovable OAuth broker module is not used and must not be reintroduced.
