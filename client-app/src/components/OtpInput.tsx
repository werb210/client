import { useEffect, useMemo, useRef, useState } from "react";

type OtpInputProps = {
  length?: number;
  onComplete: (code: string) => void;
  autoFocus?: boolean;
};

export function OtpInput({ length = 6, onComplete, autoFocus = true }: OtpInputProps) {
  const [values, setValues] = useState<string[]>(() =>
    Array.from({ length }, () => "")
  );
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = useMemo(() => values.join(""), [values]);

  useEffect(() => {
    if (code.length === length && !values.includes("")) {
      onComplete(code);
    }
  }, [code, length, onComplete, values]);

  useEffect(() => {
    if (autoFocus) {
      inputsRef.current[0]?.focus();
    }
  }, [autoFocus]);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setValues((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      return;
    }
    if (event.key === "Enter") {
      if (!values.includes("")) {
        onComplete(values.join(""));
      }
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const text = event.clipboardData.getData("text");
    const digits = text.replace(/\D/g, "").slice(0, length).split("");
    if (!digits.length) return;
    setValues((prev) => {
      const next = [...prev];
      digits.forEach((digit, index) => {
        next[index] = digit;
      });
      return next;
    });
    const nextIndex = Math.min(digits.length, length - 1);
    inputsRef.current[nextIndex]?.focus();
  }

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          className="h-12 w-12 rounded-xl border border-slate-200 text-center text-lg font-semibold text-borealBlue focus:border-borealBlue focus:outline-none"
          value={values[index]}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
