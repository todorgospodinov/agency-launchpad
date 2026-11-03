import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell, Field, Notice, SubmitButton } from "./AuthShell";
import { Button } from "@/components/ui/button";
import "@lovable.dev/cloud-auth-js/styles.css";
export function AccountForm({ mode }: { mode: "login" | "register" | "forgot" }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [message, setMessage] = useState("");
  const navigate = useNavigate(); const { user } = useAuth();
  useEffect(() => { if (user && mode !== "forgot") navigate({ to: "/my-articles" }); }, [user, mode, navigate]);
  async function social(provider: "google" | "lovable") { setError(""); setBusy(true); try { const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin }); if (result.error) throw result.error; } catch (e) { setError(e instanceof Error ? e.message : "Sign-in failed."); } finally { setBusy(false); } }
  return <AuthShell title={mode === "register" ? "Join Real News" : mode === "forgot" ? "Reset your password" : "Welcome back"} footer={mode === "register" ? <Link to="/login">Already registered? Sign in</Link> : <Link to="/register">Create an account</Link>}>
    {error && <Notice>{error}</Notice>}{message && <Notice tone="success">{message}</Notice>}
    <form className="mt-4 space-y-5" onSubmit={async e => { e.preventDefault(); setBusy(true); setError(""); try {
      if (mode === "register") { const { error: err } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { display_name: name } } }); if (err) throw err; setMessage("Check your email to confirm your account before signing in."); }
      else if (mode === "forgot") { const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); if (err) throw err; setMessage("Check your email for a password reset link."); }
      else { const { error: err } = await supabase.auth.signInWithPassword({ email, password }); if (err) throw err; navigate({ to: "/my-articles" }); }
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); } finally { setBusy(false); } }}>
      {mode === "register" && <Field label="Display name" value={name} onChange={e => setName(e.target.value)} required maxLength={80} />}
      <Field label="Email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
      {mode !== "forgot" && <Field label="Password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />}
      <SubmitButton disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}</SubmitButton>
    </form>
    {mode === "login" && <Link to="/forgot-password" className="mt-4 block text-sm underline">Forgot password?</Link>}
    {mode !== "forgot" && <div className="mt-6 space-y-3 border-t pt-6"><Button variant="outline" className="w-full" disabled={busy} onClick={() => social("google")}>Continue with Google</Button><Button className="lovable-auth-button w-full" disabled={busy} onClick={() => social("lovable")}>Continue with Lovable</Button></div>}
  </AuthShell>;
}