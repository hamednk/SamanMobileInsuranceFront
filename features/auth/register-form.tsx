"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CaptchaField } from "@/features/auth/captcha-field";
import { JalaliDatePicker } from "@/components/jalali-date-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api, notifyError } from "@/lib/api";
import { toEnDigits } from "@/lib/format";
import type { CityLookup, LookupItem } from "@/types";

export function RegisterForm() {
  const router = useRouter();
  const [provinceId, setProvinceId] = useState("");
  const [pending, setPending] = useState(false);
  const [captchaRefresh, setCaptchaRefresh] = useState(0);
  const [captcha, setCaptcha] = useState({ captchaId: "", captchaCode: "" });

  const provinces = useQuery({
    queryKey: ["provinces"],
    queryFn: () => api.get<LookupItem[]>("/api/v1/lookups/provinces"),
  });
  const cities = useQuery({
    queryKey: ["cities", provinceId],
    queryFn: () => api.get<CityLookup[]>(`/api/v1/lookups/cities?provinceId=${provinceId}`),
    enabled: Boolean(provinceId),
  });

  const selectClass =
    "h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      await api.post("/api/v1/stores/register", {
        storeName: form.get("storeName"),
        managerFirstName: form.get("managerFirstName"),
        managerLastName: form.get("managerLastName"),
        nationalCode: toEnDigits(String(form.get("nationalCode") ?? "")),
        birthDate: form.get("birthDate"),
        mobile1: toEnDigits(String(form.get("mobile1") ?? "")),
        mobile2: toEnDigits(String(form.get("mobile2") ?? "")) || null,
        provinceId,
        cityId: form.get("cityId"),
        address: form.get("address"),
        postalCode: toEnDigits(String(form.get("postalCode") ?? "")),
        username: String(form.get("username") ?? "").trim(),
        password: form.get("password"),
        captchaId: captcha.captchaId,
        captchaCode: captcha.captchaCode,
      });
      toast.success("ثبت‌نام با موفقیت انجام شد. اکنون وارد شوید.");
      router.push("/login");
    } catch (error) {
      notifyError(error);
      setCaptchaRefresh((n) => n + 1);
    } finally {
      setPending(false);
    }
  }

  const cityOptions = useMemo(() => cities.data ?? [], [cities.data]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>ثبت‌نام فروشگاه</CardTitle>
        <CardDescription>اطلاعات فروشگاه و مدیر را کامل وارد کنید.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="storeName">نام فروشگاه</FieldLabel>
              <Input id="storeName" name="storeName" required className="min-h-11" />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="managerFirstName">نام مدیر</FieldLabel>
                <Input id="managerFirstName" name="managerFirstName" required className="min-h-11" />
              </Field>
              <Field>
                <FieldLabel htmlFor="managerLastName">نام خانوادگی مدیر</FieldLabel>
                <Input id="managerLastName" name="managerLastName" required className="min-h-11" />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="nationalCode">کد ملی</FieldLabel>
                <Input id="nationalCode" name="nationalCode" inputMode="numeric" required maxLength={10} className="min-h-11" />
              </Field>
                <Field>
                  <FieldLabel htmlFor="birthDate">تاریخ تولد</FieldLabel>
                  <JalaliDatePicker id="birthDate" name="birthDate" required  />
                </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="mobile1">شماره موبایل ۱</FieldLabel>
                <Input id="mobile1" name="mobile1" inputMode="tel" required className="min-h-11" placeholder="09121234567" />
              </Field>
              <Field>
                <FieldLabel htmlFor="mobile2">شماره موبایل ۲</FieldLabel>
                <Input id="mobile2" name="mobile2" inputMode="tel" className="min-h-11" />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="provinceId">استان</FieldLabel>
                <select
                  id="provinceId"
                  className={selectClass}
                  value={provinceId}
                  onChange={(e) => setProvinceId(e.target.value)}
                  required
                >
                  <option value="">انتخاب استان</option>
                  {(provinces.data ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="cityId">شهر</FieldLabel>
                <select id="cityId" name="cityId" className={selectClass} required disabled={!provinceId}>
                  <option value="">انتخاب شهر</option>
                  {cityOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="address">آدرس دقیق</FieldLabel>
              <Input id="address" name="address" required className="min-h-11" />
            </Field>
            <Field>
              <FieldLabel htmlFor="postalCode">کد پستی</FieldLabel>
              <Input id="postalCode" name="postalCode" inputMode="numeric" required maxLength={10} className="min-h-11" />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="username">نام کاربری</FieldLabel>
                <Input id="username" name="username" autoComplete="username" required className="min-h-11" dir="ltr" />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">رمز عبور</FieldLabel>
                <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="min-h-11" />
                <FieldDescription>حداقل ۸ کاراکتر</FieldDescription>
              </Field>
            </div>
            <CaptchaField refreshKey={captchaRefresh} onChange={setCaptcha} />
            <Button type="submit" className="min-h-11 w-full" disabled={pending}>
              {pending ? <Spinner data-icon="inline-start" /> : null}
              ثبت‌نام
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-4 text-sm">
          حساب دارید؟{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            ورود
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
