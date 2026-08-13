import Stars from "@/components/Stars";

export default function StarRating({
  score,
  reviewCount,
}: {
  score: string | null;
  reviewCount: number | null;
}) {
  const count = reviewCount ?? 0;

  if (!score || count === 0) {
    return <span className="text-sm text-zinc-500 dark:text-zinc-400">No reviews yet</span>;
  }

  const numericScore = Number(score);

  return (
    <div className="flex items-center gap-1.5">
      <Stars rating={numericScore} />
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        {numericScore.toFixed(1)} ({count} review{count === 1 ? "" : "s"})
      </span>
    </div>
  );
}
