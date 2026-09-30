import { VehicleStickerForm } from "../modules/feat2-vehicle-sticker/vehicle-sticker-form";
import { useReservedReference } from "../hooks/useReservedReference";
import { ReferenceChip } from "../components/ui/ReferenceChip";

export function VehicleSticker() {
  const { reference, error, reserve } = useReservedReference("vehicle-sticker");
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="form-eyebrow text-sm">Application &middot; 02</p>
          <h1 className="form-heading mt-1 text-2xl">
            Vehicle Sticker Application
          </h1>
          <p className="mt-2 text-sm text-[var(--smart-muted)]">
            Fields marked <span className="text-red-600">*</span> are required.
          </p>
        </div>
        <ReferenceChip reference={reference} error={error} onRetry={reserve} />
      </div>

      <VehicleStickerForm reference={reference} onSubmitted={reserve} />
    </div>
  );
}
