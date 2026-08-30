"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterOption = { value: string; label: string };

function pickValue(value: string | null | undefined): string {
  return value && value !== "all" ? value : "";
}

export { pickValue as pickSelectValue };

type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  allLabel?: string;
  placeholder?: string;
  disabled?: boolean;
};

export function FilterSelect({
  value,
  onChange,
  options,
  allLabel = "همه",
  placeholder,
  disabled,
}: FilterSelectProps) {
  const items = [{ value: "all", label: allLabel }, ...options];

  return (
    <Select
      value={value || "all"}
      onValueChange={(next) => onChange(pickValue(next))}
      items={items}
      disabled={disabled}
    >
      <SelectTrigger className="min-h-11 w-full">
        <SelectValue placeholder={placeholder ?? allLabel} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
