"use client";

import Link from "next/link";
import { PackageOpenIcon, SparklesIcon } from "lucide-react";
import { StoreShell } from "@/components/store-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InsuranceTypePage() {
  return (
    <StoreShell>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">بیمه موبایل</h1>
          <p className="mt-1 text-sm text-muted-foreground">نوع گوشی را انتخاب کنید و ثبت بیمه‌نامه را شروع کنید</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/insurance/new" className="group">
            <Card className="h-full border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-background to-transparent transition group-hover:border-sky-500/60 group-hover:shadow-lg group-hover:shadow-sky-500/10">
              <CardHeader>
                <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-300">
                  <SparklesIcon className="size-5" />
                </div>
                <CardTitle>موبایل آکبند</CardTitle>
                <CardDescription>برای گوشی‌های نو و فعال‌سازی کد همتا</CardDescription>
              </CardHeader>
              <CardContent className="font-medium text-sky-700 dark:text-sky-300">شروع ثبت بیمه‌نامه آکبند</CardContent>
            </Card>
          </Link>
          <Link href="/insurance/used" className="group">
            <Card className="h-full border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-transparent transition group-hover:border-amber-500/60 group-hover:shadow-lg group-hover:shadow-amber-500/10">
              <CardHeader>
                <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  <PackageOpenIcon className="size-5" />
                </div>
                <CardTitle>موبایل غیر آکبند (کارکرده)</CardTitle>
                <CardDescription>تاریخ شروع بیمه‌نامه برابر با امروز است</CardDescription>
              </CardHeader>
              <CardContent className="font-medium text-amber-700 dark:text-amber-300">شروع ثبت بیمه‌نامه کارکرده</CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </StoreShell>
  );
}
