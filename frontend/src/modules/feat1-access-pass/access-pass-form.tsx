import { useState, type FormEvent } from "react";
import axios from "axios";
import { api } from "../../api/client";
import {
  SubmitResultModal,
  type SubmitResultStatus,
} from "../../components/modals/SubmitResultModal";
import { UploadFileInput } from "../../components/ui/UploadFileInput";
import { TextFieldInput } from "../../components/ui/TextFieldInput";
import { useFormControls, useFileFields } from "../../hooks/useFormControls";

type ApplicantType =
  | ""
  | "Plantilla"
  | "Non-Plantilla"
  | "Consultant"
  | "Other";

interface FamilyMember {
  id: string;
  relation: string;
  name: string;
  occupation: string;
  contactNumber: string;
}

interface EducationRecord {
  id: string;
  level: string;
  schoolName: string;
  yearGraduated: string;
}

interface DocumentFiles {
  doc_letter_request: File | null;
  doc_valid_id_1: File | null;
  doc_valid_id_2: File | null;
  doc_nbi_clearance: File | null;
  doc_consultancy_contract: File | null;
  doc_other: File | null;
  applicant_photo: File | null;
}

const emptyFamilyMember = (): FamilyMember => ({
  id: crypto.randomUUID(),
  relation: "",
  name: "",
  occupation: "",
  contactNumber: "",
});

const emptyEducationRecord = (): EducationRecord => ({
  id: crypto.randomUUID(),
  level: "",
  schoolName: "",
  yearGraduated: "",
});

export function AccessPassForm() {
  const [applicantType, setApplicantType] = useState<ApplicantType>("");

  // Both repeatable tables now share the same universal update/add/remove
  // logic via useFormControls, instead of each having its own copy.
  const {
    records: familyMembers,
    updateRecord: updateFamilyMember,
    addRecord: addFamilyMember,
    removeRecord: removeFamilyMember,
    resetRecords: resetFamilyMembers,
  } = useFormControls<FamilyMember>(emptyFamilyMember);

  const {
    records: educationRecords,
    updateRecord: updateEducationRecord,
    addRecord: addEducationRecord,
    removeRecord: removeEducationRecord,
    resetRecords: resetEducationRecords,
  } = useFormControls<EducationRecord>(emptyEducationRecord);

  const { files, handleFileChange, resetFiles } = useFileFields<DocumentFiles>(
    () => ({
      doc_letter_request: null,
      doc_valid_id_1: null,
      doc_valid_id_2: null,
      doc_nbi_clearance: null,
      doc_consultancy_contract: null,
      doc_other: null,
      applicant_photo: null,
    })
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultStatus, setResultStatus] = useState<SubmitResultStatus>(null);
  const [resultMessage, setResultMessage] = useState<string | undefined>(
    undefined
  );
  const [applicationId, setApplicationId] = useState<string | undefined>(
    undefined
  );

  const showNbi = applicantType === "Non-Plantilla";
  const showConsultancy = applicantType === "Consultant";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResultStatus(null);
    setResultMessage(undefined);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      formData.set("form_type", "access_pass");
      formData.set("family_background", JSON.stringify(familyMembers));
      formData.set("educational_background", JSON.stringify(educationRecords));

      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.set(key, file);
      });

      const response = await api.post("/access-pass", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setApplicationId(response.data?.application_id);
      setResultStatus("success");
      form.reset();
      resetFamilyMembers();
      resetEducationRecords();
      setApplicantType("");
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
        <input type="hidden" name="form_type" value="access_pass" />

        {/* SECTION A: PERSONAL INFORMATION */}
        <section className="p-6 bg-white border border-l-4 shadow-sm rounded-xl border-l-blue-500 border-slate-200">
          <p className="text-xs font-medium tracking-wide text-blue-600">
            Section A
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-5">
            <div className="grid grid-cols-1 gap-4 sm:col-span-4 sm:grid-cols-12">
              <TextFieldInput
                label="First Name"
                name="first_name"
                required
                color="blue"
                containerClassName="sm:col-span-4"
              />
              <TextFieldInput
                label="Middle Name"
                name="middle_name"
                color="blue"
                containerClassName="sm:col-span-3"
              />
              <TextFieldInput
                label="Last Name"
                name="last_name"
                required
                color="blue"
                containerClassName="sm:col-span-3"
              />
              <TextFieldInput
                label="Suffix"
                name="suffix"
                placeholder="Jr."
                color="blue"
                containerClassName="sm:col-span-2"
              />
            </div>

            <TextFieldInput
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              required
              color="blue"
              containerClassName="sm:col-span-2"
            />
            <TextFieldInput
              label="Place of Birth"
              name="place_of_birth"
              color="blue"
              containerClassName="sm:col-span-2"
            />

            <SelectField
              label="Sex"
              name="sex"
              className="sm:col-span-2"
              options={["Male", "Female", "Prefer not to say"]}
            />
            <SelectField
              label="Civil Status"
              name="civil_status"
              className="sm:col-span-2"
              options={["Single", "Married", "Widowed", "Separated", "Other"]}
            />

            <TextFieldInput
              label="Home Address"
              name="address"
              color="blue"
              containerClassName="sm:col-span-4"
            />

            <TextFieldInput
              label="Contact Number"
              name="contact_number"
              required
              color="blue"
              containerClassName="sm:col-span-2"
            />
            <TextFieldInput
              label="Email Address"
              name="email"
              type="email"
              required
              color="blue"
              containerClassName="sm:col-span-2"
            />

            <div className="sm:col-span-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Applicant Type <span className="text-red-600">*</span>
              </label>
              <select
                name="applicant_type"
                required
                value={applicantType}
                onChange={(e) =>
                  setApplicantType(e.target.value as ApplicantType)
                }
                className={selectClasses}
              >
                <option value="">Select&hellip;</option>
                <option value="Plantilla">Plantilla</option>
                <option value="Non-Plantilla">Non-Plantilla</option>
                <option value="Consultant">Consultant</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* SECTION B: FAMILY BACKGROUND */}
        <section className="p-6 bg-white border border-l-4 shadow-sm rounded-xl border-l-amber-500 border-slate-200">
          <p className="text-xs font-medium tracking-wide text-amber-600">
            Section B
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Family Background
          </h2>

          <div className="flex flex-col gap-4 mt-5">
            {familyMembers.map((member, index) => (
              <div
                key={member.id}
                className="p-4 border rounded-lg border-slate-200 bg-slate-50/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500">
                    Family Member {index + 1}
                  </span>
                  {familyMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFamilyMember(member.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <TextFieldInput
                    label="Relation"
                    size="compact"
                    color="amber"
                    value={member.relation}
                    onChange={(e) =>
                      updateFamilyMember(member.id, "relation", e.target.value)
                    }
                  />
                  <TextFieldInput
                    label="Full Name"
                    size="compact"
                    color="amber"
                    value={member.name}
                    onChange={(e) =>
                      updateFamilyMember(member.id, "name", e.target.value)
                    }
                    containerClassName="sm:col-span-2"
                  />
                  <TextFieldInput
                    label="Occupation"
                    size="compact"
                    color="amber"
                    value={member.occupation}
                    onChange={(e) =>
                      updateFamilyMember(
                        member.id,
                        "occupation",
                        e.target.value
                      )
                    }
                  />
                  <TextFieldInput
                    label="Contact Number"
                    size="compact"
                    color="amber"
                    value={member.contactNumber}
                    onChange={(e) =>
                      updateFamilyMember(
                        member.id,
                        "contactNumber",
                        e.target.value
                      )
                    }
                    containerClassName="sm:col-span-2"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addFamilyMember}
            className="mt-4 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            + Add Family Member
          </button>
        </section>

        {/* SECTION C: EDUCATIONAL BACKGROUND */}
        <section className="p-6 bg-white border border-l-4 shadow-sm rounded-xl border-l-red-500 border-slate-200">
          <p className="text-xs font-medium tracking-wide text-red-600">
            Section C
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Educational Background
          </h2>

          <div className="flex flex-col gap-4 mt-5">
            {educationRecords.map((record, index) => (
              <div
                key={record.id}
                className="p-4 border rounded-lg border-slate-200 bg-slate-50/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500">
                    Record {index + 1}
                  </span>
                  {educationRecords.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducationRecord(record.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <TextFieldInput
                    label="Level"
                    size="compact"
                    color="red"
                    value={record.level}
                    onChange={(e) =>
                      updateEducationRecord(record.id, "level", e.target.value)
                    }
                    placeholder="Elementary / Secondary / College"
                    containerClassName="sm:col-span-2"
                  />
                  <TextFieldInput
                    label="School Name"
                    size="compact"
                    color="red"
                    value={record.schoolName}
                    onChange={(e) =>
                      updateEducationRecord(
                        record.id,
                        "schoolName",
                        e.target.value
                      )
                    }
                    containerClassName="sm:col-span-1"
                  />
                  <TextFieldInput
                    label="Year Graduated"
                    size="compact"
                    color="red"
                    value={record.yearGraduated}
                    onChange={(e) =>
                      updateEducationRecord(
                        record.id,
                        "yearGraduated",
                        e.target.value
                      )
                    }
                    containerClassName="sm:col-span-1"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addEducationRecord}
            className="mt-4 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            + Add Educational Record
          </button>
        </section>

        {/* SECTION D: SUPPORTING DOCUMENTS */}
        <section className="p-6 bg-white border border-l-4 shadow-sm rounded-xl border-l-blue-500 border-slate-200">
          <p className="text-xs font-medium tracking-wide text-blue-600">
            Section D
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Supporting Documents
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Required documents depend on the applicant type selected in Section
            A.
          </p>

          <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-2">
            <UploadFileInput
              label="Letter Request addressed to the Sergeant-at-Arms"
              name="doc_letter_request"
              required
              color="blue"
              onChange={(f) => handleFileChange("doc_letter_request", f)}
            />
            <UploadFileInput
              label="Valid ID (Copy 1)"
              name="doc_valid_id_1"
              required
              color="blue"
              onChange={(f) => handleFileChange("doc_valid_id_1", f)}
            />
            <UploadFileInput
              label="Valid ID (Copy 2)"
              name="doc_valid_id_2"
              required
              color="blue"
              onChange={(f) => handleFileChange("doc_valid_id_2", f)}
            />

            {showNbi && (
              <UploadFileInput
                label="NBI Clearance"
                hint="required for Non-Plantilla"
                name="doc_nbi_clearance"
                color="amber"
                onChange={(f) => handleFileChange("doc_nbi_clearance", f)}
              />
            )}

            {showConsultancy && (
              <UploadFileInput
                label="Contract of Consultancy"
                hint="required for Consultants"
                name="doc_consultancy_contract"
                color="amber"
                onChange={(f) =>
                  handleFileChange("doc_consultancy_contract", f)
                }
              />
            )}

            <UploadFileInput
              label="Other Supporting Document"
              hint="optional"
              name="doc_other"
              color="slate"
              onChange={(f) => handleFileChange("doc_other", f)}
            />
          </div>
        </section>

        {/* SECTION E: PHOTO */}
        <section className="p-6 bg-white border border-l-4 shadow-sm rounded-xl border-l-amber-500 border-slate-200">
          <p className="text-xs font-medium tracking-wide text-amber-600">
            Section E
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Applicant Photograph
          </h2>

          <div className="mt-5 sm:max-w-sm">
            <UploadFileInput
              label="Upload Photo"
              name="applicant_photo"
              accept=".jpg,.jpeg,.png"
              required
              color="amber"
              onChange={(f) => handleFileChange("applicant_photo", f)}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Accepted formats: JPG, JPEG, PNG. This photo will be used on the
              generated access pass.
            </p>
          </div>
        </section>

        {/* SECTION F: DECLARATION */}
        <section className="p-6 border border-l-4 shadow-sm rounded-xl border-l-red-500 border-slate-200 bg-slate-50">
          <p className="text-xs font-medium tracking-wide text-red-600">
            Section F
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Declaration
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            I certify that the information provided in this application is true
            and correct to the best of my knowledge. I understand that any false
            statement may be grounds for denial or revocation of my access pass.
          </p>

          <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-12">
            <TextFieldInput
              label="Printed Name"
              name="declaration_name"
              required
              color="red"
              containerClassName="sm:col-span-5"
            />
            <TextFieldInput
              label="Signature"
              name="declaration_signature"
              placeholder="Signature capture method to be confirmed"
              color="red"
              containerClassName="sm:col-span-4"
            />
            <TextFieldInput
              label="Date Signed"
              name="declaration_date"
              type="date"
              required
              color="red"
              containerClassName="sm:col-span-3"
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end">
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
