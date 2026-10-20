import { useReservedReference } from "../hooks/useReservedReference";
import { ReferenceChip } from "../components/ui/ReferenceChip";
import { AccessPassForm } from "../modules/feat1-access-pass/access-pass-form";

export function AccessPass() {
  const { reference, error, reserve } = useReservedReference("access-pass");
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6">
      <div className="mb-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="form-eyebrow text-sm">Application &middot; 01</p>
          <h1 className="form-heading mt-1 text-2xl">
            Access Pass / ID Application
          </h1>
        </div>
        <div className="sm:col-span-1 sm:col-start-2 sm:row-span-2 sm:row-start-1">
          <ReferenceChip
            reference={reference}
            error={error}
            onRetry={reserve}
          />
        </div>
        <p className="text-sm text-[var(--smart-muted)] sm:col-start-1">
          Fields marked <span className="text-red-600">*</span> are required.
        </p>
      </div>

      <AccessPassForm reference={reference} onSubmitted={reserve} />
    </div>
  );
}
