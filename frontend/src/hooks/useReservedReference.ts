import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";

export function useReservedReference(
  endpoint: "access-pass" | "vehicle-sticker",
) {
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const asked = useRef(false);

  const reserve = async () => {
    setError(false);
    setReference(null);
    try {
      const { data } = await api.post(`/${endpoint}/reserve-reference`);
      setReference(data.application_id);
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    if (asked.current) return; // avoids a double reservation in React StrictMode
    asked.current = true;
    reserve();
  }, []);

  return { reference, error, reserve };
}
