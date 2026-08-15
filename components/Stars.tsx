export default function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <span aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < rounded ? "text-ink dark:text-ink-dark" : "text-ink/20 dark:text-ink-dark/20"}
        >
          ★
        </span>
      ))}
    </span>
  );
}
