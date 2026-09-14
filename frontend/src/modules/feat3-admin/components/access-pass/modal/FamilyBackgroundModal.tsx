import type {
  FamilyBackgroundRow,
  FamilyBackgroundDraftRow,
} from "../../../../../hooks/types";

function AmberSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="h-2 w-2 rotate-45 shrink-0 bg-amber-600" />
      <h3 className="text-xs font-bold uppercase tracking-wide text-amber-900">
        {children}
      </h3>
    </div>
  );
}

function AmberField({
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
      ? "border-l-amber-300"
      : shade === "medium"
        ? "border-l-amber-500"
        : "border-l-amber-700";

  return (
    <div
      className={`rounded-md border border-amber-100 border-l-4 ${borderShade} bg-amber-50/50 px-3 py-2`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-amber-950">
        {value || value === 0 ? value : "—"}
      </div>
    </div>
  );
}

function AmberInput({
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
      ? "border-l-amber-300"
      : shade === "medium"
        ? "border-l-amber-500"
        : "border-l-amber-700";

  return (
    <div
      className={`rounded-md border border-amber-100 border-l-4 ${borderShade} bg-white px-3 py-2`}
    >
      <label className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full text-sm font-semibold text-amber-950 bg-transparent outline-none focus:ring-0 border-0 p-0"
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 ring-1 ring-amber-200">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-amber-700">
          <path
            d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM15 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            fill="currentColor"
          />
          <path
            d="M2 19c0-3 3.1-5 7-5s7 2 7 5v1H2v-1ZM16.5 14.3c2.9.4 5.5 2.2 5.5 4.7v1h-4v-1c0-1.8-.6-3.3-1.5-4.7Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p className="mt-3 text-sm font-semibold text-amber-900">
        No family background records
      </p>
      <p className="text-xs text-amber-600 mt-1">
        This applicant hasn&apos;t submitted any family records yet.
      </p>
    </div>
  );
}

export function FamilyBackgroundModal({
  rows,
  editing,
  draftRows,
  onChange,
  onAdd,
  onRemove,
}: {
  rows: FamilyBackgroundRow[];
  editing: boolean;
  draftRows: FamilyBackgroundDraftRow[];
  onChange: (
    index: number,
    field: keyof FamilyBackgroundDraftRow,
    value: string
  ) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  if (editing) {
    return (
      <>
        <AmberSectionHeader>
          Family Background
          <span className="ml-2 normal-case tracking-normal font-medium text-amber-600 text-xs">
            {draftRows.length} {draftRows.length === 1 ? "record" : "records"}
          </span>
        </AmberSectionHeader>

        <div className="flex flex-col gap-4">
          {draftRows.map((f, idx) => (
            <div
              key={f.id ?? `new-${idx}`}
              className="rounded-lg border border-amber-100 border-l-4 border-l-amber-600 bg-white shadow-sm px-4 py-4"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold shadow-sm shadow-amber-600/30">
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
                <AmberInput
                  label="Full Name"
                  value={f.name}
                  onChange={(v) => onChange(idx, "name", v)}
                  shade="light"
                  required
                />
                <AmberInput
                  label="Relationship"
                  value={f.relationship}
                  onChange={(v) => onChange(idx, "relationship", v)}
                  shade="light"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <AmberInput
                  label="Occupation"
                  value={f.occupation}
                  onChange={(v) => onChange(idx, "occupation", v)}
                  shade="medium"
                />
                <AmberInput
                  label="Other Information"
                  value={f.other_information}
                  onChange={(v) => onChange(idx, "other_information", v)}
                  shade="dark"
                />
              </div>
            </div>
          ))}

          <button
            onClick={onAdd}
            className="rounded-lg border border-dashed border-amber-300 text-amber-700 hover:bg-amber-50 text-sm font-semibold px-4 py-3 transition-colors"
          >
            + Add Family Member
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
      <AmberSectionHeader>
        Family Background
        <span className="ml-2 normal-case tracking-normal font-medium text-amber-600 text-xs">
          {rows.length} {rows.length === 1 ? "record" : "records"}
        </span>
      </AmberSectionHeader>

      <div className="flex flex-col gap-4">
        {rows.map((f, idx) => (
          <div
            key={f.id}
            className="rounded-lg border border-amber-100 border-l-4 border-l-amber-600 bg-white shadow-sm hover:shadow-md hover:shadow-amber-100 hover:-translate-y-0.5 transition-all duration-150 px-4 py-4"
          >
            <div className="flex items-start gap-2 mb-3 min-w-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold shadow-sm shadow-amber-600/30">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  Full Name
                </div>
                <h4 className="text-sm sm:text-base font-bold text-amber-950 leading-tight truncate">
                  {f.name}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <AmberField
                label="Relationship"
                value={f.relationship}
                shade="light"
              />
              <AmberField
                label="Occupation"
                value={f.occupation}
                shade="medium"
              />
              <AmberField
                label="Other Information"
                value={f.other_information}
                shade="dark"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
