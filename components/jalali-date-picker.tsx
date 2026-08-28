"use client";

import { useEffect, useId, useState } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import { cn } from "@/lib/utils";
import "react-multi-date-picker/styles/colors/teal.css";

type Props = {
  id?: string;
  name?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  withTime?: boolean;
  onChange?: (isoOrDate: string) => void;
};

function toPickerValue(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new DateObject({ date, calendar: persian, locale: persian_fa });
}

function toOutput(date: DateObject | null, withTime?: boolean) {
  if (!date) return "";
  const g = date.convert(gregorian);
  if (withTime) {
    return new Date(g.year, g.month.index, g.day, date.hour, date.minute, date.second).toISOString();
  }
  const mm = String(g.month.number).padStart(2, "0");
  const dd = String(g.day).padStart(2, "0");
  return `${g.year}-${mm}-${dd}`;
}

export function JalaliDatePicker({
  id,
  name,
  value,
  required,
  disabled,
  className,
  placeholder = "انتخاب تاریخ",
  withTime = false,
  onChange,
}: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [inner, setInner] = useState(value ?? "");

  useEffect(() => {
    if (value !== undefined) setInner(value);
  }, [value]);

  const current = value !== undefined ? value : inner;

  function commit(next: string) {
    if (value === undefined) setInner(next);
    onChange?.(next);
  }

  return (
    <div className={cn("jalali-datepicker w-full", className)}>
      <DatePicker
        id={inputId}
        value={toPickerValue(current)}
        onChange={(date) => {
          const next = toOutput(Array.isArray(date) ? date[0] ?? null : date, withTime);
          commit(next);
        }}
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        editable={false}
        disabled={disabled}
        format={withTime ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD"}
        plugins={withTime ? [<TimePicker key="time" position="bottom" hideSeconds />] : undefined}
        containerClassName="w-full"
        inputClass={cn(
          "h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors",
          "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
        )}
        placeholder={placeholder}
      />
      {name ? <input type="hidden" name={name} value={current} required={required} readOnly /> : null}
    </div>
  );
}
