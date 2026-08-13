"use client";

export default function TrackedSection({
  courseId,
  sectionId,
  className,
  children,
}: {
  courseId: string;
  sectionId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const handleClick = () => {
    fetch("/api/track/section-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, sectionId }),
      keepalive: true,
    }).catch(() => {});
  };

  return (
    <section className={className} onClick={handleClick}>
      {children}
    </section>
  );
}
