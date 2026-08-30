"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheckIcon,
  Building2Icon,
  CreditCardIcon,
  PhoneIcon,
  ShieldIcon,
  StoreIcon,
  TrendingUpIcon,
  XCircleIcon,
} from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatToman } from "@/lib/format";
import type { AdminDashboard } from "@/types";

export default function AdminHomePage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.get<AdminDashboard>("/api/v1/admin/dashboard"),
  });

  const stats = [
    { title: "کل فروشگاه‌ها", value: data?.totalStores, tone: "blue" as const, icon: <StoreIcon className="size-5" /> },
    { title: "فروشگاه فعال", value: data?.activeStores, tone: "emerald" as const, icon: <BadgeCheckIcon className="size-5" /> },
    { title: "بیمه امروز", value: data?.todayPolicies, tone: "sky" as const, icon: <ShieldIcon className="size-5" /> },
    { title: "بیمه این ماه", value: data?.monthPolicies, tone: "indigo" as const, icon: <TrendingUpIcon className="size-5" /> },
    { title: "حق بیمه دریافتی", value: data ? formatToman(data.totalPremiumRial) : null, tone: "amber" as const, icon: <CreditCardIcon className="size-5" /> },
    { title: "سود فروشگاه‌ها", value: data ? formatToman(data.totalStoreProfitRial) : null, tone: "teal" as const, icon: <TrendingUpIcon className="size-5" /> },
    { title: "آکبند", value: data?.newPhones, tone: "teal" as const, icon: <PhoneIcon className="size-5" /> },
    { title: "کارکرده", value: data?.usedPhones, tone: "orange" as const, icon: <PhoneIcon className="size-5" /> },
    { title: "پرداخت موفق", value: data?.successfulPayments, tone: "emerald" as const, icon: <BadgeCheckIcon className="size-5" /> },
    { title: "پرداخت ناموفق", value: data?.failedPayments, tone: "rose" as const, icon: <XCircleIcon className="size-5" /> },
  ];

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">داشبورد مدیریت</h1>
          <p className="mt-1 text-sm text-muted-foreground">نمای کلی فروش و وضعیت سامانه</p>
        </div>
        {isError ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-destructive">
                {(error as Error)?.message || "بارگذاری داشبورد ناموفق بود."}
              </p>
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
                onClick={() => refetch()}
              >
                تلاش مجدد
              </button>
            </CardContent>
          </Card>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((item) => (
            <StatCard key={item.title} title={item.title} value={item.value} tone={item.tone} icon={item.icon} loading={isLoading} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-primary/15 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StoreIcon className="size-5 text-primary" />
                فروشگاه‌های برتر
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {(data?.topStores ?? []).length === 0 && !isLoading ? (
                <p className="text-sm text-muted-foreground">هنوز بیمه‌نامه صادرشده‌ای ثبت نشده است.</p>
              ) : null}
              {(data?.topStores ?? []).map((s) => (
                <div key={s.storeId} className="flex justify-between rounded-lg bg-background/70 px-3 py-2 text-sm">
                  <span>{s.storeName}</span>
                  <span className="font-medium text-primary">{formatToman(s.amountRial)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-brand/20 bg-gradient-to-br from-brand/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2Icon className="size-5 text-brand" />
                فروش استانی
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {(data?.provinceSales ?? []).length === 0 && !isLoading ? (
                <p className="text-sm text-muted-foreground">داده‌ای برای نمایش نیست.</p>
              ) : null}
              {(data?.provinceSales ?? []).map((s) => (
                <div key={s.province} className="flex justify-between rounded-lg bg-background/70 px-3 py-2 text-sm">
                  <span>{s.province}</span>
                  <span className="font-medium text-brand">{formatToman(s.amountRial)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
