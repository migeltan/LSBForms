import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";

export function useReservedReference(
  endpoint: "access-pass" | "vehicle-sticker",
) {
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const asked = useRef(false);

  const storageKey = `smart_ref_${endpoint}`;

  const reserve = async () => {
    setError(false);
    setReference(null);
    localStorage.removeItem(storageKey);
    try {
      const { data } = await api.post(`/${endpoint}/reserve-reference`);
      setReference(data.application_id);
      localStorage.setItem(storageKey, data.application_id);
    } catch (e) {
      console.error(`reserve-reference (${endpoint}) failed:`, e);
      setError(true);
    }
  };

  useEffect(() => {
    if (asked.current) return; // avoids a double reservation in React StrictMode
    asked.current = true;
    // Reuse the number reserved earlier so a refresh doesn't burn a new one.
    const saved = localStorage.getItem(storageKey);
    if (saved) setReference(saved);
    else reserve();
  }, []);

  return { reference, error, reserve };
}
