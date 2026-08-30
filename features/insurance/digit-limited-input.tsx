"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { limitDigitInput } from "@/lib/format";

type DigitLimitedInputProps = {
  id: string;
  name: string;
  maxDigits: number;
  required?: boolean;
  placeholder?: string;
  className?: string;
  exactLength?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
};

export function DigitLimitedInput({
  id,
  name,
  maxDigits,
  required,
  placeholder,
  className = "min-h-11",
  exactLength = true,
  value,
  onValueChange,
}: DigitLimitedInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = value !== undefined;
  const displayValue = isControlled ? value : internalValue;

  return (
    <Input
      id={id}
      name={name}
      inputMode="numeric"
      autoComplete="off"
      required={required}
      maxLength={maxDigits}
      minLength={required && exactLength ? maxDigits : undefined}
      className={className}
      dir="ltr"
      placeholder={placeholder}
      value={displayValue}
      onChange={(event) => {
        const next = limitDigitInput(event.target.value, maxDigits);
        if (!isControlled) setInternalValue(next);
        onValueChange?.(next);
      }}
    />
  );
}
