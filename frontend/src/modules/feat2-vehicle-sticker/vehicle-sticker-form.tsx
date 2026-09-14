import { useState, type FormEvent } from "react";
import axios from "axios";
import { api } from "../../api/client";
import {
  SubmitResultModal,
  type SubmitResultStatus,
} from "../../components/modals/SubmitResultModal";
import { UploadFileInput } from "../../components/ui/UploadFileInput";
import { TextFieldInput } from "../../components/ui/TextFieldInput";
import { useFileFields } from "../../hooks/useFormControls";

type Ownership = "" | "Registered to Applicant" | "Not Registered to Applicant";

interface DocumentFiles {
  doc_or_cr: File | null;
  doc_deed_of_sale: File | null;
  doc_hrep_id: File | null;
  doc_chattel_mortgage: File | null;
  doc_company_certificate: File | null;
}

const emptyDocumentFiles = (): DocumentFiles => ({
  doc_or_cr: null,
  doc_deed_of_sale: null,
  doc_hrep_id: null,
  doc_chattel_mortgage: null,
  doc_company_certificate: null,
});

export function VehicleStickerForm() {
  const [ownership, setOwnership] = useState<Ownership>("");

  // Same universal file-field handling used across the intake forms.
  const { files, handleFileChange, resetFiles } =
    useFileFields<DocumentFiles>(emptyDocumentFiles);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultStatus, setResultStatus] = useState<SubmitResultStatus>(null);
  const [resultMessage, setResultMessage] = useState<string | undefined>(
    undefined
  );
  const [applicationId, setApplicationId] = useState<string | undefined>(
    undefined
  );

  const showDeedOfSale = ownership === "Not Registered to Applicant";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResultStatus(null);
    setResultMessage(undefined);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      formData.set("form_type", "vehicle_sticker");

      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.set(key, file);
      });

      const response = await api.post("/vehicle-sticker", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setApplicationId(response.data?.application_id);
      setResultStatus("success");
      form.reset();
      setOwnership("");
      resetFiles();
    } catch (err) {
      let message = "Something went wrong. Please try again.";
      if (axios.isAxiosError(err)) {
        const serverErrors = err.response?.data?.errors;
        if (serverErrors) {
          const firstMessage = Object.values(serverErrors)[0] as string[];
          message = firstMessage?.[0] ?? "Please check the form for errors.";
        } else {
          message =
            err.response?.data?.message ??
            `Submission failed (${err.response?.status ?? "network error"}).`;
        }
      }
      setResultMessage(message);
      setResultStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <input type="hidden" name="form_type" value="vehicle_sticker" />

        {/* SECTION A: PERSONAL INFORMATION */}
        <section className="p-6 bg-white border border-l-4 shadow-sm rounded-xl border-l-blue-500 border-slate-200">
          <p className="text-xs font-medium tracking-wide text-blue-600">
            Section A
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-3">
            <TextFieldInput
              label="First Name"
              name="first_name"
              required
              color="blue"
            />
            <TextFieldInput
              label="Middle Name"
              name="middle_name"
              color="blue"
            />
            <TextFieldInput
              label="Last Name"
              name="last_name"
              required
              color="blue"
            />

            <TextFieldInput
              label="HRep ID Number"
              name="hrep_id_number"
              placeholder="Field to be confirmed"
              color="blue"
            />
            <TextFieldInput
              label="Contact Number"
              name="contact_number"
              required
              color="blue"
            />
            <TextFieldInput
              label="Email Address"
              name="email"
              type="email"
              required
              color="blue"
            />
          </div>
        </section>

        {/* SECTION B: VEHICLE INFORMATION */}
        <section className="p-6 bg-white border border-l-4 shadow-sm rounded-xl border-l-amber-500 border-slate-200">
          <p className="text-xs font-medium tracking-wide text-amber-600">
            Section B
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Vehicle Information
          </h2>

          <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-3">
            <TextFieldInput
              label="Plate Number"
              name="plate_number"
              required
              color="amber"
            />
            <SelectField
              label="Vehicle Type"
              name="vehicle_type"
              options={["Sedan", "SUV", "Van", "Motorcycle", "Other"]}
            />
            <TextFieldInput label="Color" name="color" color="amber" />

            <TextFieldInput label="Make" name="make" required color="amber" />
            <TextFieldInput label="Model" name="model" required color="amber" />
            <TextFieldInput
              label="Year"
              name="year"
              placeholder="YYYY"
              color="amber"
            />

            <TextFieldInput
              label="Registration Information"
              name="registration_information"
              placeholder="Field to be confirmed"
              color="amber"
              containerClassName="sm:col-span-2"
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Vehicle Ownership <span className="text-red-600">*</span>
              </label>
              <select
                name="ownership"
                required
                value={ownership}
                onChange={(e) => setOwnership(e.target.value as Ownership)}
                className={selectClasses}
              >
                <option value="">Select&hellip;</option>
                <option value="Registered to Applicant">
                  Registered to Applicant
                </option>
                <option value="Not Registered to Applicant">
                  Not Registered to Applicant
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* SECTION C: SUPPORTING DOCUMENTS */}
        <section className="p-6 bg-white border border-l-4 shadow-sm rounded-xl border-l-red-500 border-slate-200">
          <p className="text-xs font-medium tracking-wide text-red-600">
            Section C
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Supporting Documents
          </h2>

          <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-2">
            <UploadFileInput
              label="OR/CR (Official Receipt / Certificate of Registration)"
              name="doc_or_cr"
              required
              color="red"
              onChange={(f) => handleFileChange("doc_or_cr", f)}
            />

            {showDeedOfSale && (
              <UploadFileInput
                label="Deed of Sale"
                hint="required if vehicle is not registered to applicant"
                name="doc_deed_of_sale"
                color="red"
                onChange={(f) => handleFileChange("doc_deed_of_sale", f)}
              />
            )}

            <UploadFileInput
              label="HRep ID"
              name="doc_hrep_id"
              required
              color="red"
              onChange={(f) => handleFileChange("doc_hrep_id", f)}
            />

            <UploadFileInput
              label="Chattel Mortgage"
              hint="if applicable"
              name="doc_chattel_mortgage"
              color="slate"
              onChange={(f) => handleFileChange("doc_chattel_mortgage", f)}
            />

            <UploadFileInput
              label="Company / Secretary's Certificate"
              hint="if applicable"
              name="doc_company_certificate"
              color="slate"
              onChange={(f) => handleFileChange("doc_company_certificate", f)}
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-between">
          <a
            href="/"
            className="inline-flex items-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && (
              <span className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
            )}
            {isSubmitting ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </form>

      <SubmitResultModal
        status={resultStatus}
        message={resultStatus === "error" ? resultMessage : undefined}
        referenceId={applicationId}
        onClose={() => setResultStatus(null)}
      />
    </>
  );
}

/* ---------- Remaining shared field primitive (select still uses static styling) ---------- */

const selectClasses =
  "w-full appearance-none rounded-lg border border-slate-300 bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2020%2020%27%20fill=%27%2364748b%27%3e%3cpath%20fill-rule=%27evenodd%27%20d=%27M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%27%20clip-rule=%27evenodd%27/%3e%3c/svg%3e')] bg-[length:1.1rem] bg-[right_0.65rem_center] bg-no-repeat px-3.5 py-2.5 pr-9 text-sm text-slate-900 shadow-sm transition-all duration-150 hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10";

function SelectField({
  label,
  name,
  options,
  className = "",
}: {
  label: string;
  name: string;
  options: string[];
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select name={name} className={selectClasses}>
        <option value="">Select&hellip;</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
