import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { articleQuery } from "@/lib/articles.queries";
import { formatDate } from "@/lib/articles";
import { pageHead } from "@/lib/metadata";
export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ context, params }) => { const article = await context.queryClient.ensureQueryData(articleQuery(params.slug)); if (!article) throw notFound(); return article; },
  head: ({ loaderData }) => { const head = pageHead(loaderData?.title ?? "Story unavailable", loaderData?.summary ?? "Read the full story at Real News Agency."); const image = loaderData?.cover_url; return { ...head, meta: [...head.meta, ...(image?.startsWith("https://") ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : [])] }; },
  component: Story,
});
function Story() {
  const { slug } = Route.useParams(); const { data: article } = useSuspenseQuery(articleQuery(slug)); if (!article) return null;
  return <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10"><Link to="/" className="text-sm text-muted-foreground">← Front page</Link><p className="kicker mt-8">{article.category}</p><h1 className="mt-3 font-display text-4xl leading-tight font-semibold md:text-6xl">{article.title}</h1><p className="mt-5 text-lg text-muted-foreground">{article.summary}</p><p className="my-6 border-y py-4 text-xs">{article.author_name || "Newsroom"} · {formatDate(article.published_at)}</p>{article.cover_url && <img src={article.cover_url} alt={article.title} className="mb-8 aspect-[16/9] w-full object-cover" />}<div className="mx-auto max-w-2xl space-y-6 font-display text-xl leading-relaxed">{article.body.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}</div></main>;
}