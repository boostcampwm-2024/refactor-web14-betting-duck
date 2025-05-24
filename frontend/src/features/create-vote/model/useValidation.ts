import { useEffect, useMemo, useState } from "react";
import { ValidationEvent } from "./types";
import { EVENT } from "@/shared/constants";

export function useValidation() {
  const [validInputs, setValidInputs] = useState(new Set<string>());

  const requiredInputs = useMemo(
    () => new Set(["title", "winCase", "loseCase", "timer", "coin"]),
    [],
  );

  useEffect(() => {
    const initialValidInputs = new Set<string>();

    initialValidInputs.add("timer");
    initialValidInputs.add("coin");

    setValidInputs(initialValidInputs);
  }, []);

  useEffect(() => {
    const handleValidation = (e: ValidationEvent) => {
      const { name, isValid } = e.detail;

      setValidInputs((prev) => {
        const next = new Set(prev);
        if (isValid) {
          next.add(name);
        } else {
          next.delete(name);
        }
        return new Set(next);
      });
    };

    window.addEventListener(EVENT.FORM_VALIDATION, handleValidation);
    return () =>
      window.removeEventListener(EVENT.FORM_VALIDATION, handleValidation);
  }, []);

  const isFormValid = useMemo(() => {
    if (requiredInputs.size !== validInputs.size) {
      return false;
    }
    return [...requiredInputs].every((input) => validInputs.has(input));
  }, [validInputs, requiredInputs]);

  return { isFormValid };
}
