// Two fixed local assets with different intrinsic aspect ratios (light vs
// dark exports), swapped by theme; next/image's required fixed width/height
// would fight that instead of scaling to the container.
export default function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-block ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-light.png" alt="No BS Courses" className="block h-7 w-auto dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-dark.png"
        alt="No BS Courses"
        className="hidden h-7 w-auto dark:block"
      />
    </span>
  );
}
