// src/data/forms.ts
//
// Single source of truth for "what application forms exist in the system".
// Used by:
//   - Header.tsx        -> the "Forms" nav dropdown
//   - pages/Home.tsx     -> the bento application cards + the landing search bar
//
// Adding a new form later (e.g. a third pass type) only requires adding an
// entry here — the header dropdown and the landing search pick it up
// automatically, no other files need to change.

export interface FormDefinition {
  id: string;
  index: string; // display order label, e.g. "01"
  title: string;
  shortLabel: string; // used in nav / compact contexts
  summary: string; // plain-text description, used for search matching
  href: string;
  accent: "blue" | "red";
  keywords: string[];
}

export const AVAILABLE_FORMS: FormDefinition[] = [
  {
    id: "access-pass",
    index: "01",
    title: "Access Pass Application",
    shortLabel: "Access Pass",
    summary:
      "For Congressional Staff, Consultant, Attached Agencies, Concessionaire, etc. Apply for an Access Pass.",
    href: "/access-pass",
    accent: "blue",
    keywords: [
      "access pass",
      "id",
      "congressional staff",
      "consultant",
      "attached agencies",
      "concessionaire",
    ],
  },
  {
    id: "vehicle-sticker",
    index: "02",
    title: "Vehicle Sticker Application",
    shortLabel: "Vehicle Sticker",
    summary:
      "For House Employees applying for a Vehicle Sticker for their private vehicles in the HRep Premises.",
    href: "/vehicle-sticker",
    accent: "red",
    keywords: ["vehicle sticker", "car", "vehicle", "sticker", "parking"],
  },
];

/** Case-insensitive match against title/summary/keywords. */
export function searchForms(query: string): FormDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return AVAILABLE_FORMS.filter((form) =>
    [form.title, form.summary, ...form.keywords].some((field) =>
      field.toLowerCase().includes(q),
    ),
  );
}
