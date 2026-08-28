"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { JalaliDatePicker } from "@/components/jalali-date-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api, notifyError } from "@/lib/api";
import { formatAmountInput, formatPercent, formatToman, parseAmountInput, toEnDigits } from "@/lib/format";
import type { LookupItem, Policy, PremiumQuote } from "@/types";
import { WizardStepper } from "@/features/insurance/stepper";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function PolicyForm({ type }: { type: "New" | "Used" }) {
  const router = useRouter();
  const [brandId, setBrandId] = useState("");
  const [priceRial, setPriceRial] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [pending, setPending] = useState(false);

  const brands = useQuery({
    queryKey: ["brands"],
    queryFn: () => api.get<LookupItem[]>("/api/v1/lookups/brands"),
  });
  const models = useQuery({
    queryKey: ["models", brandId],
    queryFn: () => api.get<LookupItem[]>(`/api/v1/lookups/models?brandId=${brandId}`),
    enabled: Boolean(brandId),
  });
  const numericPrice = parseAmountInput(priceRial);
  const quote = useQuery({
    queryKey: ["premium", type, numericPrice],
    queryFn: () => api.post<PremiumQuote>("/api/v1/insurance/premium", { insuranceType: type, mobilePriceRial: numericPrice }),
    enabled: numericPrice > 0,
    retry: false,
  });

  const tomanHint = useMemo(() => (numericPrice > 0 ? formatToman(numericPrice) : null), [numericPrice]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      const startDateValue = type === "New" ? (startDate || null) : null;
      if (type === "New" && !startDateValue) {
        toast.error("تاریخ شروع بیمه‌نامه را انتخاب کنید.");
        setPending(false);
        return;
      }
      if (!birthDate) {
        toast.error("تاریخ تولد را انتخاب کنید.");
        setPending(false);
        return;
      }
      const policy = await api.post<Policy>("/api/v1/insurance", {
        insuranceType: type,
        customer: {
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          nationalCode: toEnDigits(String(form.get("nationalCode") ?? "")),
          birthDate,
          mobile: toEnDigits(String(form.get("mobile") ?? "")),
          address: form.get("address"),
          postalCode: toEnDigits(String(form.get("postalCode") ?? "")),
        },
        brandId,
        modelId: form.get("modelId"),
        mobilePriceRial: numericPrice,
        imei1: toEnDigits(String(form.get("imei1") ?? "")),
        imei2: toEnDigits(String(form.get("imei2") ?? "")) || null,
        startDate: startDateValue,
      });
      toast.success("اطلاعات ذخیره شد.");
      router.push(`/insurance/${policy.id}/images`);
    } catch (error) {
      notifyError(error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <WizardStepper current={1} />
      <Card>
        <CardHeader>
          <CardTitle>{type === "New" ? "ثبت بیمه موبایل آکبند" : "ثبت بیمه موبایل کارکرده"}</CardTitle>
          <CardDescription>اطلاعات بیمه‌گذار و موبایل را وارد کنید. مبلغ حق بیمه توسط سامانه محاسبه می‌شود.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <h2 className="font-medium">اطلاعات بیمه‌گذار</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="firstName">نام</FieldLabel>
                  <Input id="firstName" name="firstName" required className="min-h-11" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">نام خانوادگی</FieldLabel>
                  <Input id="lastName" name="lastName" required className="min-h-11" />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="nationalCode">کد ملی</FieldLabel>
                  <Input id="nationalCode" name="nationalCode" inputMode="numeric" required maxLength={10} className="min-h-11" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="birthDate">تاریخ تولد</FieldLabel>
                  <JalaliDatePicker
                    id="birthDate"
                    name="birthDate"
                    value={birthDate}
                    onChange={setBirthDate}
                    required
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="mobile">شماره موبایل</FieldLabel>
                <Input id="mobile" name="mobile" inputMode="tel" required className="min-h-11" placeholder="09121234567" />
              </Field>
              <Field>
                <FieldLabel htmlFor="address">آدرس</FieldLabel>
                <Input id="address" name="address" required className="min-h-11" />
              </Field>
              <Field>
                <FieldLabel htmlFor="postalCode">کد پستی</FieldLabel>
                <Input id="postalCode" name="postalCode" inputMode="numeric" required maxLength={10} className="min-h-11" />
              </Field>

              <h2 className="font-medium">اطلاعات موبایل</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="brandId">برند</FieldLabel>
                  <select id="brandId" className={selectClass} value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
                    <option value="">انتخاب برند</option>
                    {(brands.data ?? []).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="modelId">مدل</FieldLabel>
                  <select id="modelId" name="modelId" className={selectClass} required disabled={!brandId}>
                    <option value="">انتخاب مدل</option>
                    {(models.data ?? []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="price">قیمت موبایل به ریال</FieldLabel>
                <Input
                  id="price"
                  inputMode="numeric"
                  required
                  className="min-h-11"
                  placeholder="۱۵۰,۰۰۰,۰۰۰"
                  value={priceRial}
                  onChange={(e) => setPriceRial(formatAmountInput(e.target.value))}
                />
                {tomanHint ? <FieldDescription>معادل {tomanHint}</FieldDescription> : null}
                {quote.data ? (
                  <FieldDescription>
                    حق بیمه محاسبه‌شده: {formatToman(quote.data.premiumRial)} ({formatPercent(quote.data.ratePercent)})
                  </FieldDescription>
                ) : null}
                {quote.error ? <p className="text-sm text-destructive">امکان ثبت بیمه برای این قیمت وجود ندارد.</p> : null}
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="imei1">سریال ۱ (IMEI)</FieldLabel>
                  <Input id="imei1" name="imei1" inputMode="numeric" required maxLength={15} className="min-h-11" dir="ltr" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="imei2">سریال ۲ (IMEI)</FieldLabel>
                  <Input id="imei2" name="imei2" inputMode="numeric" maxLength={15} className="min-h-11" dir="ltr" />
                </Field>
              </div>
              {type === "New" ? (
                <Field>
                  <FieldLabel htmlFor="startDate">تاریخ شروع بیمه‌نامه</FieldLabel>
                  <JalaliDatePicker
                    id="startDate"
                    name="startDate"
                    value={startDate}
                    onChange={setStartDate}
                    withTime
                    required
                    placeholder="تاریخ و ساعت فعال‌سازی همتا"
                  />
                  <FieldDescription>برای گوشی‌های آکبند، تاریخ شروع بیمه‌نامه تاریخ و زمان فعال‌سازی کد همتا می‌باشد.</FieldDescription>
                </Field>
              ) : (
                <FieldDescription>برای گوشی‌های غیر آکبند (کارکرده)، تاریخ شروع بیمه‌نامه تاریخ روز می‌باشد.</FieldDescription>
              )}
              <Button type="submit" className="min-h-11 w-full" disabled={pending || Boolean(quote.error)}>
                {pending ? <Spinner data-icon="inline-start" /> : null}
                مرحله بعد
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
