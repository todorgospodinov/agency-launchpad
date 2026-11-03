import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, Field, Notice, SubmitButton } from "@/components/auth/AuthShell";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/profile")({ head: () => pageHead("Your profile", "Manage your Real News Agency profile."), component: Profile });
function Profile() { const { user, displayName, refreshRoles } = useAuth(); const [name, setName] = useState(displayName); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false); useEffect(() => setName(displayName), [displayName]);
return <AuthShell title="Your profile"><form className="space-y-5" onSubmit={async e => { e.preventDefault(); if (!user) return; setBusy(true); const { error } = await supabase.from("profiles").update({ display_name: name.trim() }).eq("id", user.id); setBusy(false); setNotice(error ? error.message : "Profile saved."); refreshRoles(); }}>{notice && <Notice tone={notice === "Profile saved." ? "success" : "error"}>{notice}</Notice>}<Field label="Display name" value={name} onChange={e => setName(e.target.value)} required maxLength={80} /><Field label="Email" value={user?.email || ""} disabled /><SubmitButton disabled={busy}>Save profile</SubmitButton></form></AuthShell>;
}