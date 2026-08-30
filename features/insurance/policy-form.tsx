"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { JalaliDatePicker } from "@/components/jalali-date-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { WizardStepper } from "@/features/insurance/stepper";
import { DigitLimitedInput } from "@/features/insurance/digit-limited-input";
import { api, notifyError } from "@/lib/api";
import { formatAmountInput, formatPercent, formatToman, parseAmountInput, toEnDigits } from "@/lib/format";
import type { LookupItem, Policy, PremiumQuote } from "@/types";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type CreatedModel = { id: string; name: string };

export function PolicyForm({ type }: { type: "New" | "Used" }) {
  const router = useRouter();
  const client = useQueryClient();
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [priceRial, setPriceRial] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [pending, setPending] = useState(false);
  const [chargedRial, setChargedRial] = useState("");
  const [chargedTouched, setChargedTouched] = useState(false);
  const [addModelOpen, setAddModelOpen] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [imei1, setImei1] = useState("");
  const [imei2, setImei2] = useState("");

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
  const premiumAmount = quote.data?.premiumRial ?? 0;
  const chargedDisplay = chargedTouched ? chargedRial : premiumAmount > 0 ? formatAmountInput(String(premiumAmount)) : "";
  const chargedAmount = parseAmountInput(chargedDisplay);
  const storeProfit = chargedAmount > 0 && premiumAmount > 0 ? chargedAmount - premiumAmount : 0;
  const selectedBrandName = (brands.data ?? []).find((b) => b.id === brandId)?.name;
  const imei1En = toEnDigits(imei1);
  const imei2En = toEnDigits(imei2);
  const duplicateImeiPair =
    imei1En.length > 0 && imei2En.length > 0 && imei1En === imei2En;
  const canCheckImei = imei1En.length === 15 && !duplicateImeiPair;
  const imeiAvailability = useQuery({
    queryKey: ["imei-available", imei1En, imei2En || null],
    queryFn: () => {
      const params = new URLSearchParams({ imei1: imei1En });
      if (imei2En.length > 0) params.set("imei2", imei2En);
      return api.get<{ available: boolean; message?: string }>(`/api/v1/insurance/imei/available?${params.toString()}`);
    },
    enabled: canCheckImei,
    retry: false,
  });
  const imeiUnavailable = canCheckImei && imeiAvailability.data?.available === false;
  const duplicateModel = useMemo(() => {
    const name = newModelName.trim().toLocaleLowerCase("fa");
    if (!name) return null;
    return (models.data ?? []).find((m) => m.name.trim().toLocaleLowerCase("fa") === name) ?? null;
  }, [newModelName, models.data]);

  const addModel = useMutation({
    mutationFn: () =>
      api.post<CreatedModel>("/api/v1/store/catalog/models", {
        brandId,
        name: newModelName.trim(),
        isActive: true,
      }),
    onSuccess: (created) => {
      toast.success("مدل اضافه شد.");
      client.setQueryData<LookupItem[]>(["models", brandId], (old) => {
        const next = { id: created.id, name: created.name };
        const list = old ?? [];
        if (list.some((m) => m.id === next.id)) return list;
        return [...list, next].sort((a, b) => a.name.localeCompare(b.name, "fa"));
      });
      client.invalidateQueries({ queryKey: ["models", brandId] });
      client.invalidateQueries({ queryKey: ["store-models"] });
      setModelId(created.id);
      setNewModelName("");
      setAddModelOpen(false);
    },
    onError: notifyError,
  });

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
      if (!modelId) {
        toast.error("مدل موبایل را انتخاب کنید.");
        setPending(false);
        return;
      }
      if (chargedAmount > 0 && chargedAmount < premiumAmount) {
        toast.error("مبلغ دریافتی از مشتری نمی‌تواند کمتر از حق بیمه (سهم شرکت) باشد.");
        setPending(false);
        return;
      }
      if (!birthDate) {
        toast.error("تاریخ تولد را انتخاب کنید.");
        setPending(false);
        return;
      }
      if (duplicateImeiPair) {
        toast.error("سریال ۱ و سریال ۲ نباید یکسان باشند.");
        setPending(false);
        return;
      }
      if (imei1En.length !== 15) {
        toast.error("سریال ۱ باید ۱۵ رقم باشد.");
        setPending(false);
        return;
      }
      if (imei2En.length > 0 && imei2En.length !== 15) {
        toast.error("سریال ۲ باید ۱۵ رقم باشد.");
        setPending(false);
        return;
      }
      if (imeiUnavailable) {
        toast.error(imeiAvailability.data?.message ?? "این IMEI قبلاً ثبت شده است.");
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
        modelId,
        mobilePriceRial: numericPrice,
        customerChargedRial: chargedAmount || undefined,
        imei1: imei1En,
        imei2: imei2En || null,
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
          <CardDescription className="text-red-500">
            لطفاً اطلاعات بیمه‌گذار را از روی مدارک شناسایی به‌دقت وارد کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <h2 className="font-medium">اطلاعات بیمه‌گذار</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="firstName">نام</FieldLabel>
                  <Input id="firstName" name="firstName" required maxLength={80} className="min-h-11" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">نام خانوادگی</FieldLabel>
                  <Input id="lastName" name="lastName" required maxLength={80} className="min-h-11" />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="nationalCode">کد ملی</FieldLabel>
                  <DigitLimitedInput id="nationalCode" name="nationalCode" maxDigits={10} required placeholder="۰۰۱۲۳۴۵۶۷۸" />
                  <FieldDescription>۱۰ رقم</FieldDescription>
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
                <DigitLimitedInput id="mobile" name="mobile" maxDigits={11} required placeholder="09121234567" />
                <FieldDescription>۱۱ رقم — مثل ۰۹۱۲۱۲۳۴۵۶۷</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="address">آدرس</FieldLabel>
                <Input id="address" name="address" required maxLength={500} className="min-h-11" />
              </Field>
              <Field>
                <FieldLabel htmlFor="postalCode">کد پستی</FieldLabel>
                <DigitLimitedInput id="postalCode" name="postalCode" maxDigits={10} required />
                <FieldDescription>۱۰ رقم</FieldDescription>
              </Field>

              <h2 className="font-medium">اطلاعات موبایل</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="brandId">برند</FieldLabel>
                  <select
                    id="brandId"
                    className={selectClass}
                    value={brandId}
                    onChange={(e) => {
                      setBrandId(e.target.value);
                      setModelId("");
                    }}
                    required
                  >
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
                  <div className="flex gap-2">
                    <select
                      id="modelId"
                      name="modelId"
                      className={selectClass}
                      required
                      disabled={!brandId}
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                    >
                      <option value="">انتخاب مدل</option>
                      {(models.data ?? []).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 shrink-0"
                      disabled={!brandId}
                      onClick={() => {
                        setNewModelName("");
                        setAddModelOpen(true);
                      }}
                    >
                      <PlusIcon className="size-4" />
                      افزودن
                    </Button>
                  </div>
                  <FieldDescription>اگر مدل در لیست نیست، با دکمه افزودن ثبت کنید.</FieldDescription>
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
                  onChange={(e) => {
                    setPriceRial(formatAmountInput(e.target.value));
                    setChargedTouched(false);
                  }}
                />
                {tomanHint ? <FieldDescription>معادل {tomanHint}</FieldDescription> : null}
                {quote.data ? (
                  <FieldDescription>
                    حق بیمه محاسبه‌شده: {formatToman(quote.data.premiumRial)} ({formatPercent(quote.data.ratePercent)})
                  </FieldDescription>
                ) : null}
                {quote.error ? <p className="text-sm text-destructive">امکان ثبت بیمه برای این قیمت وجود ندارد.</p> : null}
              </Field>
              {quote.data ? (
                <Field>
                  <FieldLabel htmlFor="charged">مبلغ دریافتی از مشتری به ریال</FieldLabel>
                  <Input
                    id="charged"
                    inputMode="numeric"
                    className="min-h-11"
                    placeholder={formatAmountInput(String(quote.data.premiumRial))}
                    value={chargedDisplay}
                    onChange={(e) => {
                      setChargedTouched(true);
                      setChargedRial(formatAmountInput(e.target.value));
                    }}
                  />
                  <FieldDescription>
                    پرداخت درگاه فقط حق بیمه است. مبلغ بیشتر از حق بیمه، سود فروشگاه است و پرداخت نمی‌شود.
                  </FieldDescription>
                  {chargedAmount > 0 && chargedAmount < premiumAmount ? (
                    <p className="text-sm text-destructive">مبلغ دریافتی نمی‌تواند کمتر از حق بیمه باشد.</p>
                  ) : null}
                  {chargedAmount >= premiumAmount ? (
                    <FieldDescription>سود فروشگاه (فقط نمایش): {formatToman(storeProfit)}</FieldDescription>
                  ) : null}
                </Field>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="imei1">سریال ۱ (IMEI)</FieldLabel>
                  <DigitLimitedInput
                    id="imei1"
                    name="imei1"
                    maxDigits={15}
                    required
                    value={imei1}
                    onValueChange={setImei1}
                  />
                  <FieldDescription>۱۵ رقم</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="imei2">سریال ۲ (IMEI)</FieldLabel>
                  <DigitLimitedInput
                    id="imei2"
                    name="imei2"
                    maxDigits={15}
                    required={false}
                    exactLength={false}
                    value={imei2}
                    onValueChange={setImei2}
                  />
                  <FieldDescription>اختیاری — حداکثر ۱۵ رقم</FieldDescription>
                </Field>
              </div>
              {duplicateImeiPair ? (
                <p className="text-sm text-destructive">سریال ۱ و سریال ۲ نباید یکسان باشند.</p>
              ) : null}
              {imeiUnavailable ? (
                <p className="text-sm text-destructive">
                  {imeiAvailability.data?.message ?? "این IMEI دارای بیمه‌نامه فعال است."}
                </p>
              ) : null}
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
              <Button
                type="submit"
                className="min-h-11 w-full"
                disabled={
                  pending ||
                  Boolean(quote.error) ||
                  (chargedAmount > 0 && chargedAmount < premiumAmount) ||
                  duplicateImeiPair ||
                  imeiUnavailable
                }
              >
                {pending ? <Spinner data-icon="inline-start" /> : null}
                مرحله بعد
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Dialog
        open={addModelOpen}
        onOpenChange={(open) => {
          if (addModel.isPending) return;
          setAddModelOpen(open);
          if (!open) setNewModelName("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>افزودن مدل موبایل</DialogTitle>
            <DialogDescription>
              {selectedBrandName
                ? `مدل جدید برای برند «${selectedBrandName}» ثبت می‌شود.`
                : "ابتدا برند را انتخاب کنید."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              const name = newModelName.trim();
              if (!brandId) {
                toast.error("ابتدا برند را انتخاب کنید.");
                return;
              }
              if (!name) {
                toast.error("نام مدل را وارد کنید.");
                return;
              }
              if (duplicateModel) {
                toast.info("این مدل قبلاً برای این برند ثبت شده است.");
                setModelId(duplicateModel.id);
                setNewModelName("");
                setAddModelOpen(false);
                return;
              }
              addModel.mutate();
            }}
          >
            <Field>
              <FieldLabel htmlFor="newModelName">نام مدل</FieldLabel>
              <Input
                id="newModelName"
                className="min-h-11"
                value={newModelName}
                maxLength={80}
                onChange={(e) => setNewModelName(e.target.value.slice(0, 80))}
                placeholder="مثلاً Galaxy S24"
                autoFocus
                required
              />
              {duplicateModel ? (
                <FieldDescription className="text-destructive">
                  این مدل برای برند «{selectedBrandName}» قبلاً وجود دارد. از لیست انتخاب کنید.
                </FieldDescription>
              ) : null}
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={addModel.isPending}
                onClick={() => setAddModelOpen(false)}
              >
                انصراف
              </Button>
              <Button
                type="submit"
                className="min-h-11"
                disabled={addModel.isPending || !newModelName.trim() || Boolean(duplicateModel)}
              >
                {addModel.isPending ? <Spinner data-icon="inline-start" /> : null}
                ثبت مدل
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
