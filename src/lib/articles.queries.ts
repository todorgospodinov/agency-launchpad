import { queryOptions } from "@tanstack/react-query";
import { getArticle, listArticles, listLatest } from "./articles.functions";

export const articlesQuery = (q: string, category: string) =>
  queryOptions({
    queryKey: ["articles", q, category],
    queryFn: () => listArticles({ data: { q: q || undefined, category: category || undefined } }),
  });

export const latestQuery = () =>
  queryOptions({ queryKey: ["articles", "latest"], queryFn: () => listLatest() });

export const articleQuery = (slug: string) =>
  queryOptions({ queryKey: ["article", slug], queryFn: () => getArticle({ data: { slug } }) });
