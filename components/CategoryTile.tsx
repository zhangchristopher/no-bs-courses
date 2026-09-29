import Link from "next/link";
import Image from "next/image";
import { categorySlug, type CategoryShowcase } from "@/lib/courses";

const CATEGORY_BLURBS: Record<string, string> = {
  "AI Automation": "Build and sell AI automation systems, not just prompt-engineer for fun.",
  "AI Business": "Turn AI tools into an actual offer, client base, or content engine.",
  "Business Coaching": "Structured systems and coaching for running a real business.",
  Ecommerce: "Dropshipping, product research, and store builds that actually convert.",
  "Vibe Coding": "Build real software with AI, without a CS degree.",
};

export default function CategoryTile({ category }: { category: CategoryShowcase }) {
  return (
    <Link
      href={`/courses/category/${categorySlug(category.category)}`}
      className="group flex flex-col border border-hairline-dark bg-cream-dark transition-colors hover:border-ink-dark"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-ink-dark/10">
        {category.thumbnail_url ? (
          <Image
            src={category.thumbnail_url}
            alt=""
            fill
            sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-center font-headline text-xl font-black uppercase leading-tight tracking-tight text-ink-dark/80">
              {category.category}
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold uppercase tracking-tight text-ink-dark group-hover:underline">
          {category.category}
        </h3>
        <p className="mt-1 text-sm text-ink-dark/50">
          {CATEGORY_BLURBS[category.category] ?? "Compare courses side by side."}
        </p>
        <p className="mt-auto pt-3 text-[11px] font-medium uppercase tracking-label tabular-nums text-ink-dark/40">
          {category.count} course{category.count === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}
