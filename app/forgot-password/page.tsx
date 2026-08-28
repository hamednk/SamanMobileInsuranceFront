"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { PublicAuthChrome } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api, notifyError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [username, setUsername] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);

  async function onUsernameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await api.post<{ resetToken: string }>("/api/v1/auth/forgot-password", {
        username: username.trim(),
      });
      setResetToken(result.resetToken);
      toast.success("نام کاربری تأیید شد. رمز جدید را وارد کنید.");
    } catch (error) {
      notifyError(error);
    } finally {
      setPending(false);
    }
  }

  async function onResetSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetToken) return;
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (newPassword !== confirmPassword) {
      toast.error("تکرار رمز عبور مطابقت ندارد.");
      return;
    }
    setPending(true);
    try {
      await api.post("/api/v1/auth/reset-password", {
        token: resetToken,
        newPassword,
        confirmPassword,
      });
      toast.success("رمز عبور با موفقیت تغییر کرد.");
      router.replace("/login");
    } catch (error) {
      notifyError(error);
    } finally {
      setPending(false);
    }
  }

  return (
    <PublicAuthChrome>
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <BrandLogo size="hero" priority />
        <Card className="w-full">
          <CardHeader>
            <CardTitle>بازیابی رمز عبور</CardTitle>
            <CardDescription>
              {resetToken
                ? `رمز جدید برای «${username}» را وارد کنید.`
                : "نام کاربری خود را وارد کنید تا بتوانید رمز را عوض کنید."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!resetToken ? (
              <form onSubmit={onUsernameSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="username">نام کاربری</FieldLabel>
                    <Input
                      id="username"
                      name="username"
                      required
                      className="min-h-11"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                    />
                  </Field>
                  <Button type="submit" className="min-h-11 w-full" disabled={pending || !username.trim()}>
                    ادامه
                  </Button>
                </FieldGroup>
              </form>
            ) : (
              <form onSubmit={onResetSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="newPassword">رمز عبور جدید</FieldLabel>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      minLength={8}
                      className="min-h-11"
                      autoComplete="new-password"
                    />
                    <FieldDescription>حداقل ۸ کاراکتر</FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">تکرار رمز عبور</FieldLabel>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={8}
                      className="min-h-11"
                      autoComplete="new-password"
                    />
                  </Field>
                  <Button type="submit" className="min-h-11 w-full" disabled={pending}>
                    ذخیره رمز جدید
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 w-full"
                    disabled={pending}
                    onClick={() => setResetToken(null)}
                  >
                    تغییر نام کاربری
                  </Button>
                </FieldGroup>
              </form>
            )}
            <Link href="/login" className="mt-4 inline-block text-sm text-primary">
              بازگشت به ورود
            </Link>
          </CardContent>
        </Card>
      </div>
    </PublicAuthChrome>
  );
}
