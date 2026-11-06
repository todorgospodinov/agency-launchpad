import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Copy, LoaderCircle, PenLine, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export function EditorialAssistant() {
  const [task, setTask] = useState("draft");
  const [text, setText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [output, setOutput] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  const { data: stories = [], error: storiesError } = useQuery({
    queryKey: ["editorial-source-stories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("id,title,summary,body").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  async function generate() {
    setBusy(true); setOutput(""); setMessage(""); setCopied(false);
    const controller = new AbortController(); abort.current = controller;
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("Sign in again to continue.");
      const response = await fetch("/api/editorial-assistant", {
        method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ task, text, instructions }),
      });
      if (!response.ok) { const error = await response.json(); throw new Error(error.message ?? "The assistant is unavailable."); }
      if (!response.body) throw new Error("The assistant returned no response.");
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let done = false;
      while (!done) {
        const chunk = await reader.read();
        buffer += decoder.decode(chunk.value, { stream: !chunk.done });
        const lines = buffer.split("\n"); buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          if (event.type === "text") setOutput(previous => previous + event.text);
          if (event.type === "error") throw new Error(event.message);
          if (event.type === "done") done = true;
        }
        if (chunk.done) { if (!done) throw new Error("The AI response was interrupted."); break; }
      }
    } catch (error) {
      setMessage(controller.signal.aborted ? "Generation stopped." : error instanceof Error ? error.message : "The assistant could not complete this request.");
    } finally { setBusy(false); abort.current = null; }
  }
  return <section className="mb-10 border-y border-foreground py-6" aria-labelledby="assistant-title">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="kicker">Editorial desk · ChatGPT</p><h2 id="assistant-title" className="mt-1 font-display text-3xl">AI assistant</h2></div><PenLine className="size-6 text-signal" /></div>
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={event => { event.preventDefault(); void generate(); }} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium"><span>Task</span><select aria-label="Assistant task" className="block h-10 w-full rounded-md border border-input bg-background px-3" value={task} disabled={busy} onChange={event => setTask(event.target.value)}><option value="draft">Draft a story</option><option value="rewrite">Rewrite and edit</option><option value="headlines">Suggest headlines</option><option value="summary">Summarize</option><option value="review">Editorial review</option></select></label>
          <label className="space-y-2 text-sm font-medium"><span>Source story</span><select aria-label="Source story" defaultValue="" disabled={busy} className="block h-10 w-full min-w-0 rounded-md border border-input bg-background px-3" onChange={event => { const story = stories.find(row => row.id === event.target.value); if (story) setText([story.title, story.summary, story.body].filter(Boolean).join("\n\n")); }}><option value="">Enter your own text</option>{stories.map(story => <option key={story.id} value={story.id}>{story.title}</option>)}</select></label>
        </div>
        {storiesError && <p role="alert" className="text-sm text-destructive">Stories could not be loaded.</p>}
        <label className="block space-y-2 text-sm font-medium"><span>Story or source notes</span><Textarea aria-label="Story or source notes" value={text} onChange={event => setText(event.target.value)} maxLength={40000} required disabled={busy} className="min-h-64 resize-y" /></label>
        <label className="block space-y-2 text-sm font-medium"><span>Editorial instructions <span className="font-normal text-muted-foreground">(optional)</span></span><Textarea aria-label="Editorial instructions" value={instructions} onChange={event => setInstructions(event.target.value)} maxLength={2000} disabled={busy} /></label>
        <div className="flex gap-2"><Button type="submit" disabled={busy || !text.trim()}>{busy ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : task === "review" ? <ClipboardCheck /> : <PenLine />}{busy ? "Working…" : task === "review" ? "Review story" : "Generate"}</Button>{busy && <Button type="button" variant="outline" onClick={() => abort.current?.abort()}><Square />Stop</Button>}</div>
      </form>
      <div className="min-w-0 border-t pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-2xl">Editorial suggestions</h3><Button variant="ghost" size="icon" title={copied ? "Copied" : "Copy suggestions"} aria-label={copied ? "Copied" : "Copy suggestions"} disabled={!output || busy} onClick={async () => { try { await navigator.clipboard.writeText(output); setCopied(true); } catch { setMessage("Copy was unavailable. Select the text to copy it."); } }}>{copied ? <ClipboardCheck /> : <Copy />}</Button></div>
        {message && <p role="alert" className="mb-4 text-sm text-destructive">{message}</p>}
        {busy && !output && <p role="status" className="text-sm text-muted-foreground">Preparing editorial suggestions…</p>}
        <div aria-live="polite" className="break-words text-sm leading-7 [&_h1]:mb-3 [&_h1]:font-display [&_h1]:text-2xl [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:font-display [&_h2]:text-xl [&_h3]:mt-4 [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc"><ReactMarkdown>{output}</ReactMarkdown></div>
      </div>
    </div>
  </section>;
}