import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, type ArticleSummary } from "@/lib/articles";
import { Button } from "@/components/ui/button";

export function NewsCarousel({ items }: { items: ArticleSummary[] }) {
  const [ref, api] = useEmblaCarousel({ loop: true });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    const timer = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? undefined : setInterval(() => api.scrollNext(), 6000);
    return () => {
      clearInterval(timer);
      api.off("select", onSelect);
    };
  }, [api]);

  if (items.length === 0) return null;

  return (
    <section aria-label="Latest news" className="relative">
      <div ref={ref} className="overflow-hidden rounded-md">
        <div className="flex">
          {items.map((a) => (
            <Link
              key={a.id}
              to="/articles/$slug"
              params={{ slug: a.slug }}
              className="relative block aspect-[16/9] min-w-0 flex-[0_0_100%] md:aspect-[21/9]"
            >
              {a.cover_url ? (
                <img src={a.cover_url} alt="" className="absolute inset-0 size-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-overlay via-overlay/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-on-overlay md:p-10">
                <span className="kicker">{a.category}</span>
                <h2 className="font-display mt-2 max-w-3xl text-2xl leading-tight font-semibold text-balance md:text-5xl">
                  {a.title}
                </h2>
                {a.summary && (
                  <p className="mt-3 hidden max-w-2xl text-on-overlay/85 md:block">{a.summary}</p>
                )}
                <p className="mt-3 text-xs text-on-overlay/70">{formatDate(a.published_at)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          type="button"
          aria-label="Previous story"
          onClick={() => api?.scrollPrev()}
          className="grid size-9 place-items-center rounded-full bg-overlay text-on-overlay hover:bg-signal"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          aria-label="Next story"
          onClick={() => api?.scrollNext()}
          className="grid size-9 place-items-center rounded-full bg-overlay text-on-overlay hover:bg-signal"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="mt-3 flex justify-center gap-2">
        {items.map((a, i) => (
          <Button
            key={a.id}
            type="button"
            aria-label={`Go to story ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={`h-1 p-0 rounded-full transition-all ${i === index ? "w-8 bg-signal" : "w-4 bg-border"}`}
          />
        ))}
      </div>
    </section>
  );
}
