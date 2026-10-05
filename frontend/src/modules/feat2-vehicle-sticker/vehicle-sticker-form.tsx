import { useState, type FormEvent } from "react";
import { Car, FileUp, User } from "lucide-react";
import { FormStepper } from "../../components/ui/FormStepper";
import { StepNav } from "../../components/ui/StepNav";
import { useStepForm } from "../../hooks/useStepForm";
import axios from "axios";
import { api } from "../../api/client";
import {
  SubmitResultModal,
  type SubmitResultStatus,
} from "../../components/modals/SubmitResultModal";
import { UploadFileInput } from "../../components/ui/UploadFileInput";
import { TextFieldInput } from "../../components/ui/TextFieldInput";
import { useFileFields } from "../../hooks/useFormControls";
import { useFormDraft } from "../../hooks/useFormDraft";
import { ResetFormBar } from "../../components/ui/ResetFormBar";

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

const STEPS = [
  { label: "Personal Info", icon: User },
  { label: "Vehicle", icon: Car },
  { label: "Documents", icon: FileUp },
];

export function VehicleStickerForm({
  reference,
  onSubmitted,
}: {
  reference: string | null;
  onSubmitted: () => void;
}) {
  const [ownership, setOwnership] = useState<Ownership>("");
  const [formKey, setFormKey] = useState(0); // bump to remount (clear) the form

  // Same universal file-field handling used across the intake forms.
  const { files, handleFileChange, resetFiles } =
    useFileFields<DocumentFiles>(emptyDocumentFiles);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultStatus, setResultStatus] = useState<SubmitResultStatus>(null);
  const [resultMessage, setResultMessage] = useState<string | undefined>(
    undefined,
  );
  const [applicationId, setApplicationId] = useState<string | undefined>(
    undefined,
  );

  const showDeedOfSale = ownership === "Not Registered to Applicant";

  const {
    formProps,
    step,
    maxStep,
    message: stepMessage,
    lastStep,
    stepClass,
    goTo,
    goNext,
    reset: resetSteps,
    interceptSubmit,
  } = useStepForm({
    totalSteps: STEPS.length,
    getMissingFiles: (index) => {
      if (index !== 2) return [];
      const required: [keyof DocumentFiles, string][] = [
        ["doc_or_cr", "OR/CR"],
        ["doc_hrep_id", "HRep ID"],
      ];
      if (showDeedOfSale) required.push(["doc_deed_of_sale", "Deed of Sale"]);
      return required.filter(([k]) => !files[k]).map(([, label]) => label);
    },
  });

  const draft = useFormDraft({
    key: "smart_draft_vehicle_sticker",
    formRef: formProps.ref,
    extra: { ownership, step },
    onRestore: (d) => {
      if (d.ownership) setOwnership(d.ownership);
      if (d.step) goTo(d.step);
    },
  });

  function handleReset() {
    return;
    draft.clear();
    setFormKey((k) => k + 1);
    setOwnership("");
    resetFiles();
    resetSteps();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (interceptSubmit()) return;
    setResultStatus(null);
    setResultMessage(undefined);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      formData.set("form_type", "vehicle_sticker");
      if (reference) formData.set("reference_id", reference);

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
      draft.clear();
      resetFiles();
      onSubmitted(); // reserve a fresh number for the next application
      resetSteps();
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
      <ResetFormBar restored={draft.restored} onReset={handleReset} />
      <form
        key={formKey}
        {...formProps}
        onInput={(e) => {
          formProps.onInput(e);
          draft.save();
        }}
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
        noValidate
      >
        <input type="hidden" name="form_type" value="access_pass" />

        <FormStepper
          steps={STEPS}
          current={step}
          maxReached={maxStep}
          onSelect={goTo}
        />

        <div data-step="0" className={stepClass(0)}>
          {/* SECTION A: PERSONAL INFORMATION */}
          <section className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
            <p className="form-eyebrow text-sm">Section A</p>
            <h2 className="form-heading mt-1 text-xl">Personal Information</h2>

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
        </div>
        <div data-step="1" className={stepClass(1)}>
          {/* SECTION B: VEHICLE INFORMATION */}
          <section className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
            <p className="form-eyebrow text-sm">Section B</p>
            <h2 className="form-heading mt-1 text-xl">Vehicle Information</h2>

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
              <TextFieldInput
                label="Model"
                name="model"
                required
                color="amber"
              />
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
        </div>
        <div data-step="2" className={stepClass(2)}>
          {/* SECTION C: SUPPORTING DOCUMENTS */}
          <section className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
            <p className="form-eyebrow text-sm">Section C</p>
            <h2 className="form-heading mt-1 text-xl">Supporting Documents</h2>

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
        </div>

        <StepNav
          step={step}
          lastStep={lastStep}
          isSubmitting={isSubmitting}
          message={stepMessage}
          onBack={() => goTo(step - 1)}
          onNext={goNext}
          cancelHref="/"
        />
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
