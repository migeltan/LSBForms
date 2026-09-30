import { ClipboardCheck, Pencil } from "lucide-react";

export interface ReviewRow {
  label: string;
  value: string;
  wide?: boolean;
}
export interface ReviewSection {
  title: string;
  step: number;
  rows: ReviewRow[];
}

interface Props {
  sections: ReviewSection[];
  reference?: string | null;
  onEdit: (step: number) => void;
}

export function ReviewSummary({ sections, reference, onEdit }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <h3 className="form-heading flex items-center gap-2 text-lg">
          <ClipboardCheck size={18} className="text-[var(--smart-blue)]" />
          Application Summary
        </h3>
        {reference && (
          <span className="font-mono text-sm font-bold text-[var(--smart-blue-dark)]">
            {reference}
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {sections.map((sec) => (
          <section key={sec.title} className="py-4 last:pb-0">
            <div className="mb-2 flex items-center justify-between">
              <p className="form-eyebrow text-sm">{sec.title}</p>
              <button
                type="button"
                onClick={() => onEdit(sec.step)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <Pencil size={12} /> Edit
              </button>
            </div>

            {sec.rows.length ? (
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                {sec.rows.map((r, i) => (
                  <div
                    key={`${r.label}-${i}`}
                    className={r.wide ? "sm:col-span-2" : ""}
                  >
                    <dt className="text-xs text-slate-400">{r.label}</dt>
                    <dd className="break-words font-semibold text-slate-800">
                      {r.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm italic text-slate-400">Nothing provided.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
