import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="font-display text-xl text-foreground">
          Real News<span className="text-signal">.</span>
        </span>
        <div className="flex gap-6">
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/write" className="hover:text-foreground">Send a story</Link>
        </div>
        <span>© {new Date().getFullYear()} Real News Agency</span>
      </div>
    </footer>
  );
}
