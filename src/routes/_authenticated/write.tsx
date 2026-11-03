import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArticleForm } from "@/components/ArticleForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/articles";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/_authenticated/write")({ head: () => pageHead("Write a story", "Submit a story to the Real News Agency newsroom."), component: Write });
function Write() { const { user, displayName } = useAuth(); const navigate = useNavigate(); const qc = useQueryClient(); return <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10"><h1 className="mb-8 font-display text-4xl font-semibold">Write a story</h1><ArticleForm submitLabel="Submit for review" onSubmit={async input => { if (!user) throw new Error("Please sign in."); const { error } = await supabase.from("articles").insert({ ...input, title: input.title.trim(), slug: slugify(input.title), author_id: user.id, author_name: displayName || "Contributor", status: "review" }); if (error) throw new Error("Could not submit your story."); await qc.invalidateQueries(); navigate({ to: "/my-articles" }); }} /></main>; }