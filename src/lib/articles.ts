export const CATEGORIES = [
  "World",
  "Politics",
  "Business",
  "Science",
  "Sports",
  "Culture",
] as const;

export type ArticleStatus = "review" | "published" | "rejected";

export type ArticleSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string;
  cover_url: string | null;
  author_name: string | null;
  published_at: string | null;
  created_at: string;
};

export type Article = ArticleSummary & { body: string };

export type OwnedArticle = Article & {
  status: ArticleStatus;
  featured: boolean;
  author_id: string | null;
};

export function slugify(title: string) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "article"}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
