import { useEffect, useRef, useState, type FormEvent } from "react";
import { FileSignature, FileUp, User, Users } from "lucide-react";
import { FormStepper } from "../../components/ui/FormStepper";
import { StepNav } from "../../components/ui/StepNav";
import { useStepForm } from "../../hooks/useStepForm";
import { SignaturePad } from "../../components/ui/SignaturePad";
import {
  ReviewSummary,
  type ReviewSection,
} from "../../components/ui/ReviewSummary";
import axios from "axios";
import { api } from "../../api/client";
import {
  SubmitResultModal,
  type SubmitResultStatus,
} from "../../components/modals/SubmitResultModal";
import { UploadFileInput } from "../../components/ui/UploadFileInput";
import { TextFieldInput } from "../../components/ui/TextFieldInput";
import { useFormControls, useFileFields } from "../../hooks/useFormControls";
import { useFormDraft } from "../../hooks/useFormDraft";
import { ResetFormBar } from "../../components/ui/ResetFormBar";

// From GET /applicant-types (applicant_access_position + applicant_req_documents)
interface ApplicantTypeOption {
  id: string;
  name: string;
  documents: { code: string; name: string }[];
}

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

const STEPS = [
  { label: "Personal Info", icon: User },
  { label: "Background", icon: Users },
  { label: "Documents", icon: FileUp },
  { label: "Declaration", icon: FileSignature },
];

const emptyEducationRecord = (): EducationRecord => ({
  id: crypto.randomUUID(),
  level: "",
  schoolName: "",
  yearGraduated: "",
});

export function AccessPassForm({
  reference,
  onSubmitted,
}: {
  reference: string | null;
  onSubmitted: () => void;
}) {
  const [applicantType, setApplicantType] = useState("");
  const [applicantTypes, setApplicantTypes] = useState<ApplicantTypeOption[]>(
    [],
  );
  const [typesError, setTypesError] = useState(false);
  // Applicant-specific uploads, keyed by "req_{doc_code}"
  const [reqFiles, setReqFiles] = useState<Record<string, File | null>>({});
  const [signature, setSignature] = useState("");
  const [formKey, setFormKey] = useState(0); // bump to remount (clear) the form

  // Both repeatable tables now share the same universal update/add/remove
  // logic via useFormControls, instead of each having its own copy.
  const {
    records: familyMembers,
    updateRecord: updateFamilyMember,
    addRecord: addFamilyMember,
    removeRecord: removeFamilyMember,
    resetRecords: resetFamilyMembers,
    setRecords: setFamilyMembers,
  } = useFormControls<FamilyMember>(emptyFamilyMember);

  const {
    records: educationRecords,
    updateRecord: updateEducationRecord,
    addRecord: addEducationRecord,
    removeRecord: removeEducationRecord,
    resetRecords: resetEducationRecords,
    setRecords: setEducationRecords,
  } = useFormControls<EducationRecord>(emptyEducationRecord);

  const { files, handleFileChange, resetFiles } = useFileFields<DocumentFiles>(
    () => ({
      doc_letter_request: null,
      doc_valid_id_1: null,
      doc_valid_id_2: null,
      doc_other: null,
      applicant_photo: null,
    }),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultStatus, setResultStatus] = useState<SubmitResultStatus>(null);
  const [resultMessage, setResultMessage] = useState<string | undefined>(
    undefined,
  );
  const [applicationId, setApplicationId] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    api
      .get<ApplicantTypeOption[]>("/applicant-types")
      .then((res) => setApplicantTypes(res.data))
      .catch(() => setTypesError(true));
  }, []);

  const requiredDocs =
    applicantTypes.find((t) => t.name === applicantType)?.documents ?? [];
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
      if (index === 3) return signature ? [] : ["Signature"];
      if (index !== 2) return [];
      const required: [keyof DocumentFiles, string][] = [
        ["doc_letter_request", "Letter Request"],
        ["doc_valid_id_1", "Valid ID (Front)"],
        ["doc_valid_id_2", "Valid ID (Back)"],
        ["applicant_photo", "Applicant photo"],
      ];
      return [
        ...required.filter(([k]) => !files[k]).map(([, label]) => label),
        ...requiredDocs
          .filter((d) => !reqFiles[`req_${d.code}`])
          .map((d) => d.name),
      ];
    },
  });
  const draft = useFormDraft({
    key: "smart_draft_access_pass",
    formRef: formProps.ref,
    extra: { applicantType, familyMembers, educationRecords, signature, step },
    onRestore: (d) => {
      if (d.applicantType) setApplicantType(d.applicantType);
      if (d.familyMembers?.length) setFamilyMembers(d.familyMembers);
      if (d.educationRecords?.length) setEducationRecords(d.educationRecords);
      if (d.signature) setSignature(d.signature);
      if (d.step) goTo(d.step);
    },
  });

  function handleReset() {
    draft.clear();
    setFormKey((k) => k + 1);
    resetFamilyMembers();
    resetEducationRecords();
    setApplicantType("");
    setReqFiles({});
    resetFiles();
    resetSteps();
    setSignature("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Step 4: snapshot the (uncontrolled) personal fields for the summary and
  // pre-fill the declaration's printed name + date.
  const [personal, setPersonal] = useState<Record<string, string>>({});
  const autoName = useRef("");

  useEffect(() => {
    if (step !== lastStep) return;
    const form = formProps.ref.current;
    if (!form) return;

    const fd = new FormData(form);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const fullName = [
      get("first_name"),
      get("middle_name"),
      get("last_name"),
      get("suffix"),
    ]
      .filter(Boolean)
      .join(" ");

    const nameEl = form.elements.namedItem(
      "declaration_name",
    ) as HTMLInputElement | null;
    if (nameEl && (!nameEl.value || nameEl.value === autoName.current)) {
      nameEl.value = fullName;
      autoName.current = fullName;
    }
    const dateEl = form.elements.namedItem(
      "declaration_date",
    ) as HTMLInputElement | null;
    if (dateEl && !dateEl.value)
      dateEl.value = new Date().toLocaleDateString("en-CA");

    const snap: Record<string, string> = { full_name: fullName };
    [
      "applicant_type",
      "date_of_birth",
      "place_of_birth",
      "sex",
      "civil_status",
      "address",
      "contact_number",
      "email",
    ].forEach((k) => (snap[k] = get(k)));
    setPersonal(snap);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (interceptSubmit()) return;
    setResultStatus(null);
    setResultMessage(undefined);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      formData.set("form_type", "access_pass");
      if (reference) formData.set("reference_id", reference);
      formData.set("declaration_signature", signature);
      formData.set("family_background", JSON.stringify(familyMembers));
      formData.set("educational_background", JSON.stringify(educationRecords));

      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.set(key, file);
      });
      requiredDocs.forEach((d) => {
        const f = reqFiles[`req_${d.code}`];
        if (f) formData.set(`req_${d.code}`, f);
      });

      const response = await api.post("/access-pass", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setApplicationId(response.data?.application_id);
      setResultStatus("success");
      setFormKey((k) => k + 1);
      resetFamilyMembers();
      resetEducationRecords();
      setApplicantType("");
      setReqFiles({});
      draft.clear();
      resetFiles();
      onSubmitted(); // reserve a fresh number for the next application
      resetSteps();
      setSignature("");
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

  const dash = (v?: string) => (v && v.trim() ? v : "—");

  const docRows: [keyof DocumentFiles, string, boolean][] = [
    ["doc_letter_request", "Letter Request", true],
    ["doc_valid_id_1", "Valid ID (Front)", true],
    ["doc_valid_id_2", "Valid ID (Back)", true],
    ["doc_other", "Other document", !!files.doc_other],
    ["applicant_photo", "Applicant photo", true],
  ];

  const reviewSections: ReviewSection[] = [
    {
      title: "Personal Information",
      step: 0,
      rows: [
        { label: "Full name", value: dash(personal.full_name) },
        { label: "Applicant type", value: dash(personal.applicant_type) },
        { label: "Date of birth", value: dash(personal.date_of_birth) },
        { label: "Place of birth", value: dash(personal.place_of_birth) },
        { label: "Sex", value: dash(personal.sex) },
        { label: "Civil status", value: dash(personal.civil_status) },
        { label: "Contact number", value: dash(personal.contact_number) },
        { label: "Email", value: dash(personal.email) },
        { label: "Home address", value: dash(personal.address), wide: true },
      ],
    },
    {
      title: "Family Background",
      step: 1,
      rows: familyMembers
        .filter((m) => m.name || m.relation)
        .map((m) => ({
          label: m.relation || "Family member",
          value: dash(
            [m.name, m.occupation && `(${m.occupation})`]
              .filter(Boolean)
              .join(" "),
          ),
          wide: true,
        })),
    },
    {
      title: "Educational Background",
      step: 1,
      rows: educationRecords
        .filter((r) => r.schoolName || r.level)
        .map((r) => ({
          label: r.level || "Education",
          value: dash(
            [r.schoolName, r.yearGraduated && `(${r.yearGraduated})`]
              .filter(Boolean)
              .join(" "),
          ),
          wide: true,
        })),
    },
    {
      title: "Documents",
      step: 2,
      rows: docRows
        .filter(([, , show]) => show)
        .map(([key, label]) => ({
          label,
          value: files[key]?.name ?? "Not uploaded",
        }))
        .concat(
          requiredDocs.map((d) => ({
            label: d.name,
            value: reqFiles[`req_${d.code}`]?.name ?? "Not uploaded",
          })),
        ),
    },
  ];

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
                  onChange={(e) => {
                    setApplicantType(e.target.value);
                    setReqFiles({}); // drop uploads from the previous type
                  }}
                  className={selectClasses}
                >
                  <option value="">
                    {applicantTypes.length || typesError
                      ? "Select\u2026"
                      : "Loading\u2026"}
                  </option>
                  {applicantTypes.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {typesError && (
                  <p className="mt-1 text-sm text-red-600">
                    Couldn&apos;t load applicant types. Please refresh the page.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
        <div data-step="1" className={stepClass(1)}>
          {/* SECTION B: FAMILY BACKGROUND */}
          <section className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
            <p className="form-eyebrow text-sm">Section B</p>
            <h2 className="form-heading mt-1 text-xl">Family Background</h2>

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
                        updateFamilyMember(
                          member.id,
                          "relation",
                          e.target.value,
                        )
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
                          e.target.value,
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
                          e.target.value,
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
          <section className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
            <p className="form-eyebrow text-sm">Section C</p>
            <h2 className="form-heading mt-1 text-xl">
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
                        updateEducationRecord(
                          record.id,
                          "level",
                          e.target.value,
                        )
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
                          e.target.value,
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
                          e.target.value,
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
        </div>
        <div data-step="2" className={stepClass(2)}>
          {/* SECTION D: SUPPORTING DOCUMENTS */}
          <section className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
            <p className="form-eyebrow text-sm">Section D</p>
            <h2 className="form-heading mt-1 text-xl">Supporting Documents</h2>
            <p className="mt-1 text-sm text-slate-500">
              Required documents depend on the applicant type selected in
              Section A.
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
                label="Valid ID (Front)"
                hint="front side of one valid government-issued ID"
                name="doc_valid_id_1"
                required
                color="blue"
                onChange={(f) => handleFileChange("doc_valid_id_1", f)}
              />
              <UploadFileInput
                label="Valid ID (Back)"
                hint="back side of the same ID"
                name="doc_valid_id_2"
                required
                color="blue"
                onChange={(f) => handleFileChange("doc_valid_id_2", f)}
              />

              {requiredDocs.map((d) => (
                <UploadFileInput
                  key={d.code}
                  label={d.name}
                  hint={`required for ${applicantType}`}
                  name={`req_${d.code}`}
                  color="amber"
                  onChange={(f) =>
                    setReqFiles((prev) => ({
                      ...prev,
                      [`req_${d.code}`]: f?.[0] ?? null,
                    }))
                  }
                />
              ))}

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
          <section className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
            <p className="form-eyebrow text-sm">Section E</p>
            <h2 className="form-heading mt-1 text-xl">Applicant Photograph</h2>

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
        </div>
        <div data-step="3" className={stepClass(3)}>
          <ReviewSummary
            sections={reviewSections}
            reference={reference}
            onEdit={goTo}
          />

          {/* SECTION F: DECLARATION */}
          <section className="p-6 border border-slate-200 shadow-sm rounded-xl bg-slate-50">
            <p className="form-eyebrow text-sm">Section F</p>
            <h2 className="form-heading mt-1 text-xl">Declaration</h2>
            <p className="mt-2 text-sm text-slate-600">
              I certify that the information provided in this application is
              true and correct to the best of my knowledge. I understand that
              any false statement may be grounds for denial or revocation of my
              access pass.
            </p>

            <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-12">
              <TextFieldInput
                label="Printed Name"
                name="declaration_name"
                required
                color="red"
                containerClassName="sm:col-span-8"
              />
              <TextFieldInput
                label="Date Signed"
                name="declaration_date"
                type="date"
                required
                color="red"
                containerClassName="sm:col-span-4"
              />
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Signature <span className="text-red-600">*</span>
              </label>
              <SignaturePad value={signature} onChange={setSignature} />
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
