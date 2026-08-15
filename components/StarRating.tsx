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
    return <span className="text-sm text-ink/50 dark:text-ink-dark/50">No reviews yet</span>;
  }

  const numericScore = Number(score);

  return (
    <div className="flex items-center gap-1.5">
      <Stars rating={numericScore} />
      <span className="text-sm tabular-nums text-ink/60 dark:text-ink-dark/60">
        {numericScore.toFixed(1)} ({count} review{count === 1 ? "" : "s"})
      </span>
    </div>
  );
}
