import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex-1">
      <section className="mx-auto flex max-w-md flex-col px-6 py-16">
        <div className="rule-double pt-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
        {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
      </section>
    </main>
  );
}

const inputCls =
  "mt-2 w-full rounded-sm border border-input bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-signal";

export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
      <input {...props} className={inputCls} />
    </label>
  );
}

export function TextArea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
      <textarea {...props} className={inputCls} />
    </label>
  );
}

export function SubmitButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <Button
      type="submit"
      disabled={disabled}
      className="inline-flex w-full items-center justify-center rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-signal disabled:opacity-60"
    >
      {children}
    </Button>
  );
}

export function Notice({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  return (
    <p className={`rounded-sm px-4 py-3 text-sm ${tone === "error" ? "bg-signal/10 text-signal" : "bg-success/10 text-success"}`}>
      {children}
    </p>
  );
}
