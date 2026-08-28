"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CaptchaField } from "@/features/auth/captcha-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api, notifyError } from "@/lib/api";
import { setSession } from "@/lib/session";
import type { AuthTokens } from "@/types";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [captchaRefresh, setCaptchaRefresh] = useState(0);
  const [captcha, setCaptcha] = useState({ captchaId: "", captchaCode: "" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      const tokens = await api.post<AuthTokens>("/api/v1/auth/login", {
        username: String(form.get("username") ?? "").trim(),
        password: String(form.get("password") ?? ""),
        captchaId: captcha.captchaId,
        captchaCode: captcha.captchaCode,
      });
      setSession(tokens);
      toast.success("ورود با موفقیت انجام شد.");
      router.replace(tokens.role === "Store" ? "/dashboard" : "/admin");
    } catch (error) {
      notifyError(error);
      setCaptchaRefresh((n) => n + 1);
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>ورود به سامانه</CardTitle>
        <CardDescription>نام کاربری و رمز عبور فروشگاه یا مدیر را وارد کنید.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">نام کاربری</FieldLabel>
              <Input id="username" name="username" autoComplete="username" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">رمز عبور</FieldLabel>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </Field>
            <CaptchaField refreshKey={captchaRefresh} onChange={setCaptcha} />
            <Button type="submit" className="min-h-11 w-full" disabled={pending}>
              {pending ? <Spinner data-icon="inline-start" /> : null}
              ورود
            </Button>
          </FieldGroup>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <Link href="/forgot-password" className="text-primary underline-offset-4 hover:underline">
            بازیابی رمز عبور
          </Link>
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            ثبت‌نام فروشگاه جدید
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
