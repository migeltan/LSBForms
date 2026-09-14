import { AccessPassForm } from "../modules/feat1-access-pass/access-pass-form";

export function AccessPass() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6">
      <div className="mb-2">
        <p className="text-xs font-medium tracking-wide text-blue-600">
          Application &middot; 01
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Access Pass / ID Application
        </h1>
        <p className="mt-2 text-sm text-[var(--smart-muted)]">
          Fields marked <span className="text-red-600">*</span> are required.
        </p>
      </div>

      <AccessPassForm />
    </div>
  );
}
