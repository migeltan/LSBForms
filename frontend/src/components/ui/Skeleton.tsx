import type { HTMLAttributes } from "react";

export function Skeleton({
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded bg-black/10 ${className}`}
      {...rest}
    />
  );
}

/** Generic detail-panel skeleton: header block + label/value rows. */
export function DetailSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-busy="true" className="space-y-4 p-6">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-6 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      ))}
    </div>
  );
}
