import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import type { Article, ArticleSummary } from "./articles";

const SUMMARY_COLUMNS =
  "id, slug, title, summary, category, cover_url, author_name, published_at, created_at";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

function backendError(error: { message: string }): Error {
  console.error("News backend error:", error.message.slice(0, 300));
  return new Error("News is temporarily unavailable. Please try again in a moment.");
}

const listInput = z.object({
  q: z.string().max(100).optional(),
  category: z.string().max(40).optional(),
});

export const listArticles = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => listInput.parse(data ?? {}))
  .handler(async ({ data }): Promise<ArticleSummary[]> => {
    let query = publicClient()
      .from("articles")
      .select(SUMMARY_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(60);

    if (data.category) query = query.eq("category", data.category);
    const term = (data.q ?? "").replace(/[%_,()]/g, " ").trim();
    if (term) query = query.or(`title.ilike.%${term}%,summary.ilike.%${term}%`);

    const { data: rows, error } = await query;
    if (error) throw backendError(error);
    return rows ?? [];
  });

export const listLatest = createServerFn({ method: "GET" }).handler(
  async (): Promise<ArticleSummary[]> => {
    const { data: rows, error } = await publicClient()
      .from("articles")
      .select(SUMMARY_COLUMNS)
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(5);
    if (error) throw backendError(error);
    return rows ?? [];
  }
);

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }): Promise<Article | null> => {
    const { data: row, error } = await publicClient()
      .from("articles")
      .select(`${SUMMARY_COLUMNS}, body`)
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw backendError(error);
    return row;
  });
