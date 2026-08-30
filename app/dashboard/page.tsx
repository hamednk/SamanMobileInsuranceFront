"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  FileCheckIcon,
  HourglassIcon,
  ShieldPlusIcon,
  SmartphoneIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { StoreShell } from "@/components/store-shell";
import { StoreFestivalCard } from "@/features/festivals/store-festival-card";
import { api } from "@/lib/api";
import { formatToman } from "@/lib/format";
import type { StoreDashboard } from "@/types";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["store-dashboard"],
    queryFn: () => api.get<StoreDashboard>("/api/v1/store/dashboard"),
  });

  const cards = [
    { title: "بیمه‌های امروز", value: data?.todayPolicies, tone: "sky" as const, icon: <SmartphoneIcon className="size-5" /> },
    { title: "بیمه‌های این ماه", value: data?.monthPolicies, tone: "indigo" as const, icon: <ShieldPlusIcon className="size-5" /> },
    { title: "حق بیمه دریافتی", value: data ? formatToman(data.totalPremiumRial) : null, tone: "amber" as const, icon: <WalletIcon className="size-5" /> },
    { title: "سود فروشگاه", value: data ? formatToman(data.storeProfitRial) : null, tone: "teal" as const, icon: <TrendingUpIcon className="size-5" /> },
    { title: "در انتظار پرداخت", value: data?.awaitingPayment, tone: "orange" as const, icon: <HourglassIcon className="size-5" /> },
    { title: "ثبت / صادر شده", value: data?.issued, tone: "emerald" as const, icon: <FileCheckIcon className="size-5" /> },
  ];

  return (
    <StoreShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">داشبورد فروشگاه</h1>
            <p className="mt-1 text-sm text-muted-foreground">خلاصه عملکرد فروش بیمه موبایل</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/insurance"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-primary/90"
            >
              <ShieldPlusIcon className="size-4" />
              صدور بیمه موبایل
            </Link>
            <Link
              href="/festival"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 text-sm font-medium text-amber-900 transition hover:bg-amber-500/15 dark:text-amber-100"
            >
              جشنواره
            </Link>
            <Link
              href="/reports"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 text-sm font-medium text-primary transition hover:bg-primary/10"
            >
              گزارش عملکرد
            </Link>
            {(data?.awaitingPayment ?? 0) > 0 ? (
              <Link
                href="/policies"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 text-sm font-medium text-amber-800 transition hover:bg-amber-500/15 dark:text-amber-200"
              >
                <HourglassIcon className="size-4" />
                تکمیل موارد ناقص
              </Link>
            ) : null}
          </div>
        </div>

        <StoreFestivalCard />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <StatCard key={card.title} title={card.title} value={card.value} tone={card.tone} icon={card.icon} loading={isLoading} />
          ))}
        </div>
      </div>
    </StoreShell>
  );
}
