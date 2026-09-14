import type {
  EducationalBackgroundRow,
  EducationalBackgroundDraftRow,
} from "../../../../../hooks/types";

function RedSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="h-2 w-2 rotate-45 shrink-0 bg-red-600" />
      <h3 className="text-xs font-bold uppercase tracking-wide text-red-900">
        {children}
      </h3>
    </div>
  );
}

function RedField({
  label,
  value,
  shade,
}: {
  label: string;
  value: string | number | null | undefined;
  shade: "light" | "medium" | "dark";
}) {
  const borderShade =
    shade === "light"
      ? "border-l-red-300"
      : shade === "medium"
        ? "border-l-red-500"
        : "border-l-red-700";

  return (
    <div
      className={`rounded-md border border-red-100 border-l-4 ${borderShade} bg-red-50/40 px-3 py-2`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wide text-red-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-red-950">
        {value || value === 0 ? value : "—"}
      </div>
    </div>
  );
}

function RedInput({
  label,
  value,
  onChange,
  shade,
  required,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  shade: "light" | "medium" | "dark";
  required?: boolean;
}) {
  const borderShade =
    shade === "light"
      ? "border-l-red-300"
      : shade === "medium"
        ? "border-l-red-500"
        : "border-l-red-700";

  return (
    <div
      className={`rounded-md border border-red-100 border-l-4 ${borderShade} bg-white px-3 py-2`}
    >
      <label className="text-[10px] font-semibold uppercase tracking-wide text-red-400">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full text-sm font-semibold text-red-950 bg-transparent outline-none focus:ring-0 border-0 p-0"
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 ring-1 ring-red-200">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-red-600">
          <path d="M12 3 1 8l11 5 9-4.09V17h2V8L12 3Z" fill="currentColor" />
          <path
            d="M5 10.18v4.32c0 1.02.7 1.92 1.7 2.34C8.1 17.5 10 18 12 18s3.9-.5 5.3-1.16c1-.42 1.7-1.32 1.7-2.34v-4.32l-7 3.18-7-3.18Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p className="mt-3 text-sm font-semibold text-red-900">
        No educational background records
      </p>
      <p className="text-xs text-red-400 mt-1">
        This applicant hasn&apos;t submitted any school records yet.
      </p>
    </div>
  );
}

export function EducationalBackgroundModal({
  rows,
  editing,
  draftRows,
  onChange,
  onAdd,
  onRemove,
}: {
  rows: EducationalBackgroundRow[];
  editing: boolean;
  draftRows: EducationalBackgroundDraftRow[];
  onChange: (
    index: number,
    field: keyof EducationalBackgroundDraftRow,
    value: string
  ) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  if (editing) {
    return (
      <>
        <RedSectionHeader>
          Educational Background
          <span className="ml-2 normal-case tracking-normal font-medium text-red-300 text-xs">
            {draftRows.length} {draftRows.length === 1 ? "record" : "records"}
          </span>
        </RedSectionHeader>

        <div className="flex flex-col gap-4">
          {draftRows.map((e, idx) => (
            <div
              key={e.id ?? `new-${idx}`}
              className="rounded-lg border border-red-100 border-l-4 border-l-red-600 bg-white shadow-sm px-4 py-4"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold shadow-sm shadow-red-600/30">
                  {idx + 1}
                </span>
                <button
                  onClick={() => onRemove(idx)}
                  className="text-xs font-semibold text-[var(--smart-red,#c0392b)] hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <RedInput
                  label="School Name"
                  value={e.school}
                  onChange={(v) => onChange(idx, "school", v)}
                  shade="light"
                  required
                />
                <RedInput
                  label="Degree"
                  value={e.degree}
                  onChange={(v) => onChange(idx, "degree", v)}
                  shade="light"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <RedInput
                  label="Year Graduated"
                  value={e.year_graduated}
                  onChange={(v) => onChange(idx, "year_graduated", v)}
                  shade="medium"
                />
                <RedInput
                  label="Other Information"
                  value={e.other_information}
                  onChange={(v) => onChange(idx, "other_information", v)}
                  shade="dark"
                />
              </div>
            </div>
          ))}

          <button
            onClick={onAdd}
            className="rounded-lg border border-dashed border-red-300 text-red-700 hover:bg-red-50 text-sm font-semibold px-4 py-3 transition-colors"
          >
            + Add School Record
          </button>
        </div>
      </>
    );
  }

  if (rows.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <RedSectionHeader>
        Educational Background
        <span className="ml-2 normal-case tracking-normal font-medium text-red-300 text-xs">
          {rows.length} {rows.length === 1 ? "record" : "records"}
        </span>
      </RedSectionHeader>

      <div className="flex flex-col gap-4">
        {rows.map((e, idx) => (
          <div
            key={e.id}
            className="rounded-lg border border-red-100 border-l-4 border-l-red-600 bg-white shadow-sm hover:shadow-md hover:shadow-red-100 hover:-translate-y-0.5 transition-all duration-150 px-4 py-4"
          >
            <div className="flex items-start gap-2 mb-3 min-w-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold shadow-sm shadow-red-600/30">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-red-400">
                  School Name
                </div>
                <h4 className="text-sm sm:text-base font-bold text-red-900 leading-tight truncate">
                  {e.school}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RedField label="Degree" value={e.degree} shade="light" />
              <RedField
                label="Year Graduated"
                value={e.year_graduated}
                shade="medium"
              />
              <RedField
                label="Other Information"
                value={e.other_information}
                shade="dark"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
