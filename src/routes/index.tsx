import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { articlesQuery, latestQuery } from "@/lib/articles.queries";
import { NewsCarousel } from "@/components/NewsCarousel";
import { ArticleCard } from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/metadata";

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { q?: string; category?: string } => ({ q: typeof s["q"] === "string" ? s["q"] : "", category: typeof s["category"] === "string" ? s["category"] : "" }),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => { await Promise.all([context.queryClient.ensureQueryData(articlesQuery(deps.q || "", deps.category || "")), context.queryClient.ensureQueryData(latestQuery())]); },
  head: () => pageHead("Latest news", "The latest world, politics, business, science, sports and culture stories from Real News Agency."),
  component: Index,
});

function Index() {
  const { q = "", category = "" } = Route.useSearch();
  const navigate = useNavigate();
  const [term, setTerm] = useState(q);
  useEffect(() => setTerm(q), [q]);
  const { data: articles } = useSuspenseQuery(articlesQuery(q, category));
  const { data: latest } = useSuspenseQuery(latestQuery());
  return <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
    {!q && !category && <><div className="mb-4 flex items-center justify-between"><p className="kicker">The latest briefing</p><span className="text-xs text-muted-foreground">Real News Agency</span></div><NewsCarousel items={latest} /></>}
    <section className="mt-8 border-t border-foreground pt-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h1 className="font-display text-3xl font-semibold">{category || (q ? "Search results" : "Around the world")}</h1>
        <form className="flex w-full items-center border-b border-foreground sm:w-72" onSubmit={e => { e.preventDefault(); navigate({ to: "/", search: { q: term.trim(), category } }); }}>
          <input aria-label="Search news" placeholder="Search the news" value={term} onChange={e => setTerm(e.target.value)} className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" />
          {term && <Button type="button" size="icon" variant="ghost" aria-label="Clear search" onClick={() => { setTerm(""); navigate({ to: "/", search: { category, q: "" } }); }}><X /></Button>}
          <Button type="submit" size="icon" variant="ghost" aria-label="Search"><Search /></Button>
        </form></div>
      {articles.length ? <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{articles.map(article => <ArticleCard key={article.id} article={article} />)}</div> : <p className="py-12 text-muted-foreground">No stories found{q ? ` for “${q}”` : " in this section"}.</p>}
    </section>
  </main>;
}
