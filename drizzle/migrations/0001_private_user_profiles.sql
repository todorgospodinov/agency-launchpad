DROP POLICY IF EXISTS "Profiles are public" ON public.profiles;
REVOKE SELECT ON public.profiles FROM anon;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
ALTER POLICY "Users update own profile" ON public.profiles USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
