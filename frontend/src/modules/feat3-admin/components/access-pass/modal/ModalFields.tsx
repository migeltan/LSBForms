import type { ReactNode } from "react";

export function Field({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-md border border-gray-200 border-l-4 border-l-[var(--smart-red,#c0392b)] px-3 py-2 bg-white">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className="text-sm font-semibold text-gray-800 mt-0.5">
        {value || "—"}
      </div>
    </div>
  );
}

export function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
      <span className="h-2 w-2 rotate-45 bg-[var(--smart-red,#c0392b)]" />
      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--smart-red,#c0392b)]">
        {children}
      </h3>
    </div>
  );
}
