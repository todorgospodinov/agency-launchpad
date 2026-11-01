import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  displayName: string;
  isAdmin: boolean;
  refreshRoles: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  displayName: "",
  isAdmin: false,
  refreshRoles: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      setDisplayName("");
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .then(({ data }) => setIsAdmin((data ?? []).some((r) => r.role === "admin")));
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name ?? ""));
  }, [userId, tick]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      displayName,
      isAdmin,
      refreshRoles: () => setTick((t) => t + 1),
    }),
    [session, loading, displayName, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
