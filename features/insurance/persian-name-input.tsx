"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { limitPersianNameInput } from "@/lib/format";

type PersianNameInputProps = {
  id: string;
  name: string;
  required?: boolean;
  maxLength?: number;
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

export function PersianNameInput({
  id,
  name,
  required,
  maxLength = 80,
  className = "min-h-11",
  value,
  onValueChange,
}: PersianNameInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = value !== undefined;
  const displayValue = isControlled ? value : internalValue;

  return (
    <Input
      id={id}
      name={name}
      autoComplete="off"
      required={required}
      maxLength={maxLength}
      className={className}
      value={displayValue}
      onChange={(event) => {
        const next = limitPersianNameInput(event.target.value, maxLength);
        if (!isControlled) setInternalValue(next);
        onValueChange?.(next);
      }}
    />
  );
}
