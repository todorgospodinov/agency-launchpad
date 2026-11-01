import type { ArticleStatus } from "@/lib/articles";

const styles: Record<ArticleStatus, string> = {
  review: "bg-muted text-muted-foreground",
  published: "bg-success/10 text-success",
  rejected: "bg-signal/10 text-signal",
};
const labels: Record<ArticleStatus, string> = {
  review: "In review",
  published: "Published",
  rejected: "Rejected",
};

export function StatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <span className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>
  );
}
