import { Link } from "@tanstack/react-router";
import { formatDate, type ArticleSummary } from "@/lib/articles";

export function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <Link to="/articles/$slug" params={{ slug: article.slug }} className="group block">
      <div className="aspect-[3/2] overflow-hidden rounded-sm bg-muted">
        {article.cover_url && (
          <img
            src={article.cover_url}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <p className="kicker mt-4">{article.category}</p>
      <h3 className="font-display mt-1 text-xl leading-snug font-semibold group-hover:underline">
        {article.title}
      </h3>
      {article.summary && (
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.summary}</p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        {article.author_name && <>{article.author_name} · </>}
        {formatDate(article.published_at)}
      </p>
    </Link>
  );
}
