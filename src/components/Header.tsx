import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/articles";

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, displayName, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function signOut() {
    setOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const linkCls = "text-sm text-muted-foreground transition-colors hover:text-foreground";

  return (
    <header className="border-b border-foreground bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-10 items-center justify-between border-b text-xs text-muted-foreground">
          <span className="hidden sm:block">{today}</span>
          <div className="ml-auto hidden items-center gap-5 sm:flex">
            {user ? (
              <>
                <Link to="/write" className={linkCls}>Write</Link>
                <Link to="/my-articles" className={linkCls}>My articles</Link>
                {isAdmin && <Link to="/admin" className={linkCls}>Newsroom</Link>}
                <Link to="/profile" className={`${linkCls} max-w-[16ch] truncate`}>
                  {displayName || user.email}
                </Link>
                <button type="button" onClick={signOut} className={linkCls}>Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className={linkCls}>Sign in</Link>
                <Link to="/register" className="text-sm font-semibold text-signal">Subscribe free</Link>
              </>
            )}
          </div>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
            className="ml-auto sm:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        <div className="py-6 text-center">
          <Link to="/" className="font-display text-5xl font-semibold tracking-tight md:text-7xl">
            Real News<span className="text-signal">.</span>
          </Link>
          <p className="mt-1 text-xs tracking-[0.25em] text-muted-foreground uppercase">
            Independent · Verified · Daily
          </p>
        </div>

        <nav className="flex gap-6 overflow-x-auto border-t py-3 text-sm font-medium sm:justify-center">
          <Link to="/" search={{}} activeOptions={{ exact: true, includeSearch: true }} activeProps={{ className: "text-signal" }}>
            Top stories
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/"
              search={{ category: c }}
              activeOptions={{ includeSearch: true }}
              activeProps={{ className: "text-signal" }}
              className="whitespace-nowrap hover:text-signal"
            >
              {c}
            </Link>
          ))}
          <Link to="/about" activeProps={{ className: "text-signal" }} className="hover:text-signal">
            About
          </Link>
        </nav>
      </div>

      {open && (
        <div className="border-t px-6 py-4 sm:hidden">
          <div className="flex flex-col gap-3" onClick={() => setOpen(false)}>
            {user ? (
              <>
                <Link to="/write" className={linkCls}>Write</Link>
                <Link to="/my-articles" className={linkCls}>My articles</Link>
                {isAdmin && <Link to="/admin" className={linkCls}>Newsroom</Link>}
                <Link to="/profile" className={linkCls}>{displayName || user.email}</Link>
                <button type="button" onClick={signOut} className={`${linkCls} text-left`}>Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className={linkCls}>Sign in</Link>
                <Link to="/register" className={linkCls}>Create account</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
