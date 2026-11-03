import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArticleForm } from "@/components/ArticleForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/edit/$id")({ head: () => pageHead("Edit a story", "Edit your Real News Agency story."), component: Edit });
function Edit() { const { id } = Route.useParams(); const { isAdmin, user } = useAuth(); const qc = useQueryClient(); const navigate = useNavigate(); const { data, isPending } = useQuery({ queryKey: ["owned-article", id, user?.id], queryFn: async () => { let q = supabase.from("articles").select("*").eq("id", id); if (!isAdmin && user) q = q.eq("author_id", user.id); const { data, error } = await q.maybeSingle(); if (error) throw error; return data; } });
return <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10"><h1 className="mb-8 font-display text-4xl font-semibold">Edit story</h1>{isPending ? <p>Loading…</p> : !data ? <p>Story unavailable.</p> : data.status === "published" && !isAdmin ? <p>Published stories can only be edited by the newsroom.</p> : <ArticleForm key={data.id} initial={{ ...data, summary: data.summary || "", cover_url: data.cover_url || "" }} submitLabel={isAdmin ? "Save changes" : "Resubmit for review"} onSubmit={async input => { const { error } = await supabase.from("articles").update({ ...input, ...(isAdmin ? {} : { status: "review" as const }) }).eq("id", id).select("id").single(); if (error) throw new Error("Could not save your story."); await qc.invalidateQueries(); navigate({ to: isAdmin ? "/admin" : "/my-articles" }); }} />}</main>;
}