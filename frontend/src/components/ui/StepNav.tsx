import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  step: number;
  lastStep: number;
  isSubmitting: boolean;
  message: string | null;
  onBack: () => void;
  onNext: () => void;
  /** If set, the Back button on step 1 becomes a Cancel link. */
  cancelHref?: string;
}

const btnBase =
  "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold";

export function StepNav({
  step,
  lastStep,
  isSubmitting,
  message,
  onBack,
  onNext,
  cancelHref,
}: Props) {
  return (
    <>
      {message && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
        >
          {message}
        </p>
      )}

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        {step === 0 && cancelHref ? (
          <a
            href={cancelHref}
            className={`${btnBase} border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-100`}
          >
            Cancel
          </a>
        ) : (
          <button
            type="button"
            onClick={onBack}
            disabled={step === 0}
            className={`${btnBase} border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        {step < lastStep ? (
          <button
            key="next"
            type="button"
            onClick={onNext}
            className={`${btnBase} bg-blue-600 text-white shadow-md hover:bg-blue-700`}
          >
            Next Step <ArrowRight size={16} />
          </button>
        ) : (
          <button
            key="submit"
            type="submit"
            disabled={isSubmitting}
            className={`${btnBase} bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isSubmitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isSubmitting ? "Submitting…" : "Submit Application"}
          </button>
        )}
      </div>
    </>
  );
}
