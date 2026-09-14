import { useCallback, useState } from "react";

/**
 * Every record needs a stable `id`.
 * That's how we find "the one row to update" without using its
 * position in the array (positions shift when rows are added/removed).
 */
export interface WithId {
  id: string;
}

export interface UseFormControlsResult<T extends WithId> {
  records: T[];
  setRecords: React.Dispatch<React.SetStateAction<T[]>>;
  updateRecord: <K extends keyof T>(id: string, field: K, value: T[K]) => void;
  addRecord: () => void;
  removeRecord: (id: string) => void;
  resetRecords: () => void;
}

/**
 * useFormControls
 * ----------------
 * Handles a "repeatable table" section of a form — a list of rows the
 * user can add to, remove from, and edit (Family Members, Education
 * Records, etc). Instead of writing separate add/remove/update
 * functions for every table, you call this hook once per table.
 *
 * How it works:
 * 1. You give it a factory function that creates one blank row
 *    (e.g. `() => ({ id: crypto.randomUUID(), name: "" })`).
 * 2. It stores the list of rows in state for you.
 * 3. It hands back 4 ready-made functions:
 *      - updateRecord(id, field, value) -> edits one field on one row
 *      - addRecord()                    -> adds a new blank row
 *      - removeRecord(id)               -> deletes one row
 *      - resetRecords()                 -> puts the table back to its
 *                                           starting state
 *
 * Because it's generic (`<T>`), the SAME hook works for any table
 * shape — FamilyMember, EducationRecord, or anything else with an id.
 */
export function useFormControls<T extends WithId>(
  createEmptyRecord: () => T,
  initialCount: number = 1
): UseFormControlsResult<T> {
  // Seed the table with `initialCount` blank rows on first render.
  const [records, setRecords] = useState<T[]>(() =>
    Array.from({ length: initialCount }, () => createEmptyRecord())
  );

  // Find the row with this id, and replace just the one field on it.
  // Every other row (and every other field) is left exactly as-is.
  const updateRecord = useCallback(
    <K extends keyof T>(id: string, field: K, value: T[K]) => {
      setRecords((prev) =>
        prev.map((record) =>
          record.id === id ? { ...record, [field]: value } : record
        )
      );
    },
    []
  );

  // Tack a brand-new blank row onto the end of the list.
  const addRecord = useCallback(() => {
    setRecords((prev) => [...prev, createEmptyRecord()]);
  }, [createEmptyRecord]);

  // Drop the row that matches this id, keep everything else.
  const removeRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  }, []);

  // Throw the whole table away and start over (used after submit).
  const resetRecords = useCallback(() => {
    setRecords(Array.from({ length: initialCount }, () => createEmptyRecord()));
  }, [createEmptyRecord, initialCount]);

  return {
    records,
    setRecords,
    updateRecord,
    addRecord,
    removeRecord,
    resetRecords,
  };
}

/* -------------------------------------------------------------------------- */
/*  useFileFields — same idea as above, but for file inputs                   */
/* -------------------------------------------------------------------------- */

export interface UseFileFieldsResult<T extends object> {
  files: T;
  setFiles: React.Dispatch<React.SetStateAction<T>>;
  handleFileChange: <K extends keyof T>(
    field: K,
    fileList: FileList | null
  ) => void;
  resetFiles: () => void;
}

/**
 * useFileFields
 * -------------
 * Handles a form's "pile of file upload fields" (doc_or_cr, doc_hrep_id,
 * applicant_photo, etc). Instead of writing `setFiles({...prev, x: file})`
 * by hand in every form, you call this hook once and use the function it
 * gives you.
 *
 * How it works:
 * 1. You give it a factory that returns the starting shape, with every
 *    field set to null (e.g. `() => ({ doc_or_cr: null, doc_hrep_id: null })`).
 * 2. It stores that object in state.
 * 3. It hands back:
 *      - handleFileChange(field, fileList) -> saves the picked file
 *        (grabs the first file from the browser's FileList, or null
 *        if the user cleared the input)
 *      - resetFiles()                      -> clears every field back
 *        to null (used after a successful submit)
 *
 * Works for any set of file fields — just change what the factory
 * function returns.
 *
 * Note: T is constrained to `object` (not `Record<string, File | null>`).
 * Named interfaces like `DocumentFiles` don't have an index signature,
 * and TypeScript won't let a type without one satisfy a `Record<string, X>`
 * constraint on a generic — even though the shape is really just a map
 * of File | null values. `object` sidesteps that and we cast the one
 * spot where it matters below.
 */
export function useFileFields<T extends object>(
  createInitialFiles: () => T
): UseFileFieldsResult<T> {
  const [files, setFiles] = useState<T>(createInitialFiles);

  // Update one file field, leave the rest of the object untouched.
  // <input type="file"> gives us a FileList; we only ever want the
  // first file the user picked (these are all single-file inputs).
  const handleFileChange = useCallback(
    <K extends keyof T>(field: K, fileList: FileList | null) => {
      setFiles((prev) => ({ ...prev, [field]: fileList?.[0] ?? null }) as T);
    },
    []
  );

  // Clear every field back to its starting (null) value.
  const resetFiles = useCallback(() => {
    setFiles(createInitialFiles());
  }, [createInitialFiles]);

  return { files, setFiles, handleFileChange, resetFiles };
}
