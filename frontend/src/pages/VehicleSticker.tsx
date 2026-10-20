import { VehicleStickerForm } from "../modules/feat2-vehicle-sticker/vehicle-sticker-form";
import { useReservedReference } from "../hooks/useReservedReference";
import { ReferenceChip } from "../components/ui/ReferenceChip";

export function VehicleSticker() {
  const { reference, error, reserve } = useReservedReference("vehicle-sticker");
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6">
      <div className="mb-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="form-eyebrow text-sm">Application &middot; 02</p>
          <h1 className="form-heading mt-1 text-2xl">
            Vehicle Sticker Application
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

      <VehicleStickerForm reference={reference} onSubmitted={reserve} />
    </div>
  );
}
