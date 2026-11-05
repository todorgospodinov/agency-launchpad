DROP FUNCTION IF EXISTS public.claim_first_admin();
DROP FUNCTION IF EXISTS public.admin_exists();
REVOKE ALL ON public.user_roles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
COMMENT ON TABLE public.user_roles IS 'Application roles are assigned manually by the project owner; no public or authenticated endpoint may grant roles.';