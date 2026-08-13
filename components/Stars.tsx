export default function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <span aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < rounded ? "text-amber-500" : "text-zinc-300 dark:text-zinc-700"}
        >
          ★
        </span>
      ))}
    </span>
  );
}
