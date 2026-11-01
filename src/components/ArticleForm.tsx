import { useState } from "react";
import { CATEGORIES } from "@/lib/articles";
import { Field, Notice, SubmitButton, TextArea } from "@/components/auth/AuthShell";

export type ArticleInput = {
  title: string;
  summary: string;
  body: string;
  category: string;
  cover_url: string;
};

export function ArticleForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<ArticleInput>;
  submitLabel: string;
  onSubmit: (input: ArticleInput) => Promise<void>;
}) {
  const [form, setForm] = useState<ArticleInput>({
    title: initial?.title ?? "",
    summary: initial?.summary ?? "",
    body: initial?.body ?? "",
    category: initial?.category ?? CATEGORIES[0],
    cover_url: initial?.cover_url ?? "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof ArticleInput) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        if (form.title.trim().length < 5) return setError("Headline must be at least 5 characters.");
        if (form.body.trim().length < 20) return setError("Story text must be at least 20 characters.");
        if (form.cover_url && !/^https:\/\//.test(form.cover_url)) return setError("Image link must start with https://");
        setBusy(true);
        try {
          await onSubmit(form);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {error && <Notice>{error}</Notice>}
      <Field label="Headline" value={form.title} onChange={set("title")} maxLength={160} required />
      <TextArea label="Summary" value={form.summary} onChange={set("summary")} maxLength={400} rows={2} />
      <label className="block">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Section</span>
        <select
          value={form.category}
          onChange={set("category")}
          className="mt-2 w-full rounded-sm border border-input bg-card px-3 py-2.5 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <Field label="Photo link (https://…)" value={form.cover_url} onChange={set("cover_url")} />
      <TextArea label="Story" value={form.body} onChange={set("body")} rows={12} required />
      <SubmitButton disabled={busy}>{busy ? "Saving…" : submitLabel}</SubmitButton>
    </form>
  );
}
