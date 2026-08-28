"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheckIcon,
  Building2Icon,
  ChartColumnIcon,
  RefreshCwIcon,
  ShieldIcon,
  SmartphoneIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { JalaliDatePicker } from "@/components/jalali-date-picker";
import { StatCard } from "@/components/stat-card";
import { StoreShell } from "@/components/store-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatPercent, formatToman, toFaDigits } from "@/lib/format";

type PerformanceReport = {
  from: string;
  to: string;
  issuedCount: number;
  renewedCount: number;
  newPhoneCount: number;
  usedPhoneCount: number;
  awaitingPaymentCount: number;
  cancelledCount: number;
  totalPoliciesInRange: number;
  customerReceivedRial: number;
  companyRemittanceRial: number;
  totalMobilePriceRial: number;
  averagePremiumRial: number;
  storeCommissionPercent: number;
  companyRemittancePercent: number;
  storeProfitRial: number;
  daily: { date: string; count: number; premiumRial: number }[];
  topBrands: { brand: string; count: number; premiumRial: number }[];
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function StorePerformancePage() {
  const [from, setFrom] = useState(daysAgoIso(30));
  const [to, setTo] = useState(todayIso());
  const [applied, setApplied] = useState({ from: daysAgoIso(30), to: todayIso() });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["store-performance", applied.from, applied.to],
    queryFn: () =>
      api.get<PerformanceReport>(
        `/api/v1/store/performance?from=${encodeURIComponent(applied.from)}&to=${encodeURIComponent(applied.to)}`
      ),
  });

  const progress = useMemo(() => {
    if (!data || data.customerReceivedRial === 0) return 0;
    return Math.min(100, Math.round((data.storeProfitRial / Math.max(data.customerReceivedRial, 1)) * 100));
  }, [data]);

  return (
    <StoreShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">گزارش عملکرد</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              سود فروشگاه = مبلغ دریافتی از مشتری − مبلغ واریزی به شرکت
            </p>
          </div>
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setApplied({ from, to });
            }}
          >
            <div className="w-40">
              <JalaliDatePicker value={from} onChange={setFrom} placeholder="از تاریخ" />
            </div>
            <div className="w-40">
              <JalaliDatePicker value={to} onChange={setTo} placeholder="تا تاریخ" />
            </div>
            <Button type="submit" className="min-h-11" disabled={isFetching}>
              اعمال فیلتر
            </Button>
            <Button type="button" variant="outline" className="min-h-11" onClick={() => refetch()}>
              <RefreshCwIcon />
              بروزرسانی
            </Button>
          </form>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="بیمه صادرشده"
            value={data?.issuedCount}
            tone="emerald"
            icon={<BadgeCheckIcon className="size-5" />}
            loading={isLoading}
          />
          <StatCard
            title="دریافتی از مشتری"
            value={data ? formatToman(data.customerReceivedRial) : null}
            tone="amber"
            icon={<WalletIcon className="size-5" />}
            loading={isLoading}
          />
          <StatCard
            title={`واریز به شرکت (${data ? formatPercent(data.companyRemittancePercent) : "…"})`}
            value={data ? formatToman(data.companyRemittanceRial) : null}
            tone="orange"
            icon={<Building2Icon className="size-5" />}
            loading={isLoading}
          />
          <StatCard
            title={`سود فروشگاه (${data ? formatPercent(data.storeCommissionPercent) : "…"})`}
            value={data ? formatToman(data.storeProfitRial) : null}
            tone="teal"
            icon={<TrendingUpIcon className="size-5" />}
            loading={isLoading}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="آکبند" value={data?.newPhoneCount} tone="indigo" icon={<SmartphoneIcon className="size-5" />} loading={isLoading} />
          <StatCard title="کارکرده" value={data?.usedPhoneCount} tone="orange" icon={<SmartphoneIcon className="size-5" />} loading={isLoading} />
          <StatCard title="تمدیدی" value={data?.renewedCount} tone="blue" icon={<RefreshCwIcon className="size-5" />} loading={isLoading} />
          <StatCard title="در انتظار پرداخت" value={data?.awaitingPaymentCount} tone="rose" icon={<ShieldIcon className="size-5" />} loading={isLoading} />
        </div>

        <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-background to-transparent">
          <CardHeader>
            <CardTitle className="text-base">محاسبه سود</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">مبلغ دریافتی از مشتری</p>
              <p className="mt-2 text-lg font-semibold">{data ? formatToman(data.customerReceivedRial) : "—"}</p>
            </div>
            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">مبلغ واریزی به شرکت</p>
              <p className="mt-2 text-lg font-semibold">{data ? formatToman(data.companyRemittanceRial) : "—"}</p>
            </div>
            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">سود فروشگاه</p>
              <p className="mt-2 text-lg font-semibold text-primary">{data ? formatToman(data.storeProfitRial) : "—"}</p>
            </div>
            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">نسبت سود به دریافتی</p>
              <p className="mt-2 text-lg font-semibold">{toFaDigits(progress)}٪</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card/80 p-4">
            <p className="text-xs text-muted-foreground">ارزش موبایل‌های بیمه‌شده</p>
            <p className="mt-2 text-lg font-semibold">{data ? formatToman(data.totalMobilePriceRial) : "—"}</p>
          </div>
          <div className="rounded-xl border bg-card/80 p-4">
            <p className="text-xs text-muted-foreground">کل پرونده‌های ثبت‌شده در بازه</p>
            <p className="mt-2 text-lg font-semibold">{data ? toFaDigits(data.totalPoliciesInRange) : "—"}</p>
          </div>
          <div className="rounded-xl border bg-card/80 p-4">
            <p className="text-xs text-muted-foreground">میانگین حق بیمه</p>
            <p className="mt-2 text-lg font-semibold flex items-center gap-2">
              <ChartColumnIcon className="size-4 text-muted-foreground" />
              {data ? formatToman(data.averagePremiumRial) : "—"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-brand/20">
            <CardHeader>
              <CardTitle className="text-base">فروش روزانه (صادر شده)</CardTitle>
            </CardHeader>
            <CardContent className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {(data?.daily ?? []).length === 0 && !isLoading ? (
                <p className="text-sm text-muted-foreground">در این بازه صدور بیمه‌ای ثبت نشده است.</p>
              ) : null}
              {(data?.daily ?? []).map((d) => (
                <div key={d.date} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                  <span>{toFaDigits(d.date)}</span>
                  <span className="text-muted-foreground">{toFaDigits(d.count)} فقره</span>
                  <span className="font-medium text-primary">{formatToman(d.premiumRial)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-primary/15">
            <CardHeader>
              <CardTitle className="text-base">برندهای پرفروش</CardTitle>
            </CardHeader>
            <CardContent className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {(data?.topBrands ?? []).length === 0 && !isLoading ? (
                <p className="text-sm text-muted-foreground">داده‌ای برای نمایش نیست.</p>
              ) : null}
              {(data?.topBrands ?? []).map((b) => (
                <div key={b.brand} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                  <span className="font-medium">{b.brand}</span>
                  <span className="text-muted-foreground">{toFaDigits(b.count)} فقره</span>
                  <span className="font-medium text-brand">{formatToman(b.premiumRial)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </StoreShell>
  );
}
