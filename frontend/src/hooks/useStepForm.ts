import { useRef, useState, type FormEvent } from "react";

interface Options {
  totalSteps: number;
  /** Required uploads still missing on a step (files live in state, not the DOM). */
  getMissingFiles?: (step: number) => string[];
}

export function useStepForm({ totalSteps, getMissingFiles }: Options) {
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const lastStep = totalSteps - 1;

  // Hidden steps stay mounted so FormData still collects their values.
  const stepClass = (i: number) =>
    `flex flex-col gap-6 ${step === i ? "" : "hidden"}`;

  function validateStep(index: number): boolean {
    const root = formRef.current?.querySelector(`[data-step="${index}"]`);
    if (!root) return true;

    const invalid: HTMLElement[] = [];
    root
      .querySelectorAll<
        HTMLInputElement | HTMLSelectElement
      >("input[required]:not([type=file]), select[required]")
      .forEach((el) => {
        const bad = !el.value.trim() || !el.checkValidity();
        el.classList.toggle("!border-red-500", bad);
        if (bad) invalid.push(el);
      });

    let msg: string | null = invalid.length
      ? "Please complete the highlighted required fields."
      : null;
    const missing = getMissingFiles?.(index) ?? [];
    if (missing.length) msg = `Please provide: ${missing.join(", ")}.`;

    setMessage(msg);
    invalid[0]?.focus();
    return !msg;
  }

  function goTo(i: number) {
    setStep(i);
    setMaxStep((m) => Math.max(m, i));
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext() {
    if (validateStep(step)) goTo(Math.min(step + 1, lastStep));
  }

  function reset() {
    setStep(0);
    setMaxStep(0);
    setMessage(null);
  }

  /** Call right after preventDefault() in handleSubmit; returns true if submit should stop. */
  function interceptSubmit(): boolean {
    if (step < lastStep) {
      goNext();
      return true;
    }
    for (let s = 0; s <= lastStep; s++) {
      if (!validateStep(s)) {
        setStep(s);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return true;
      }
    }
    return false;
  }

  const formProps = {
    ref: formRef,
    onInput: (e: FormEvent<HTMLFormElement>) =>
      (e.target as HTMLElement).classList.remove("!border-red-500"),
  };

  return {
    formProps,
    step,
    maxStep,
    message,
    lastStep,
    stepClass,
    goTo,
    goNext,
    reset,
    interceptSubmit,
  };
}
