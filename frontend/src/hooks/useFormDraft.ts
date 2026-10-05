import { useCallback, useEffect, useRef, useState } from "react";

const TTL_MS = 24 * 60 * 60 * 1000; // drafts expire after 24h

export function useFormDraft<E extends object>({
  key,
  formRef,
  extra,
  onRestore,
}: {
  key: string;
  formRef: { current: HTMLFormElement | null };
  extra: E;
  onRestore: (extra: Partial<E>) => void;
}) {
  const [restored, setRestored] = useState(false);
  const extraRef = useRef(extra);
  extraRef.current = extra;
  const ready = useRef(false); // no saving until the restore attempt is done
  const timer = useRef<number | undefined>(undefined);

  const save = useCallback(() => {
    if (!ready.current) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const form = formRef.current;
      if (!form) return;
      const fields: Record<string, string> = {};
      new FormData(form).forEach((v, k) => {
        if (typeof v === "string" && k !== "declaration_signature")
          fields[k] = v;
      });
      if (!Object.entries(fields).some(([k, v]) => k !== "form_type" && v))
        return;
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            savedAt: Date.now(),
            fields,
            extra: extraRef.current,
          }),
        );
      } catch {
        /* storage full or unavailable */
      }
    }, 400);
  }, [key, formRef]);

  const clear = useCallback(() => {
    window.clearTimeout(timer.current);
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setRestored(false);
  }, [key]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      const draft = raw ? JSON.parse(raw) : null;
      if (draft && Date.now() - draft.savedAt < TTL_MS) {
        const form = formRef.current;
        Object.entries<string>(draft.fields).forEach(([name, value]) => {
          const el = form?.elements.namedItem(name) as HTMLInputElement | null;
          if (el && "value" in el && el.type !== "file") el.value = value;
        });
        onRestore(draft.extra ?? {});
        setRestored(true);
      } else if (draft) {
        localStorage.removeItem(key);
      }
    } catch {
      /* corrupt draft — ignore */
    }
    ready.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const extraKey = JSON.stringify(extra);
  useEffect(save, [extraKey, save]);

  return { save, clear, restored };
}
