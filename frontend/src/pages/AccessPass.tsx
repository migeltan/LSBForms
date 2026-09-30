import { useReservedReference } from "../hooks/useReservedReference";
import { ReferenceChip } from "../components/ui/ReferenceChip";
import { AccessPassForm } from "../modules/feat1-access-pass/access-pass-form";

export function AccessPass() {
  const { reference, error, reserve } = useReservedReference("access-pass");
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="form-eyebrow text-sm">Application &middot; 01</p>
          <h1 className="form-heading mt-1 text-2xl">
            Access Pass / ID Application
          </h1>
          <p className="mt-2 text-sm text-[var(--smart-muted)]">
            Fields marked <span className="text-red-600">*</span> are required.
          </p>
        </div>
        <ReferenceChip reference={reference} error={error} onRetry={reserve} />
      </div>

      <AccessPassForm reference={reference} onSubmitted={reserve} />
    </div>
  );
}
