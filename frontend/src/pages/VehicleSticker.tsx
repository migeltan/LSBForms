import { VehicleStickerForm } from "../modules/feat2-vehicle-sticker/vehicle-sticker-form";

export function VehicleSticker() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6">
      <div className="mb-2">
        <p className="text-xs font-medium tracking-wide text-red-600">
          Application &middot; 02
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Vehicle Sticker Application
        </h1>
        <p className="mt-2 text-sm text-[var(--smart-muted)]">
          Fields marked <span className="text-red-600">*</span> are required.
        </p>
      </div>

      <VehicleStickerForm />
    </div>
  );
}
