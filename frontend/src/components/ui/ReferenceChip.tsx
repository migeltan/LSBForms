interface Props {
  reference: string | null;
  error: boolean;
  onRetry: () => void;
}

export function ReferenceChip({ reference, error, onRetry }: Props) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <span className="form-eyebrow text-xs">Reference No.</span>
      {reference ? (
        <span className="font-mono text-sm font-bold text-[var(--smart-blue-dark)]">
          {reference}
        </span>
      ) : error ? (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-semibold text-red-600 underline"
        >
          Couldn't load, retry
        </button>
      ) : (
        <span className="h-4 w-24 animate-pulse rounded bg-slate-200" />
      )}
    </div>
  );
}
