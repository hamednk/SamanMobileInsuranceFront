"use client";

import Link from "next/link";
import { PartyPopperIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatJalali, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

export type FestivalStatus = {
  hasActiveFestival: boolean;
  message: string;
  title?: string | null;
  description?: string | null;
  rewardText?: string | null;
  requiredIssuedCount: number;
  currentIssuedCount: number;
  targetReached: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export function useStoreFestival() {
  return useQuery({
    queryKey: ["store-festival"],
    queryFn: () => api.get<FestivalStatus>("/api/v1/store/festival"),
  });
}

export function StoreFestivalCard({
  className,
  showDetails = false,
}: {
  className?: string;
  showDetails?: boolean;
}) {
  const festival = useStoreFestival();
  const data = festival.data;
  const progress =
    data?.hasActiveFestival && data.requiredIssuedCount > 0
      ? Math.min(100, Math.round((data.currentIssuedCount / data.requiredIssuedCount) * 100))
      : 0;

  return (
    <Card
      className={cn(
        data?.hasActiveFestival
          ? "border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-background to-transparent"
          : "border-border/70 bg-muted/30",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <PartyPopperIcon className="size-5 text-amber-600" />
            {data?.hasActiveFestival ? data.title ?? "جشنواره فعال" : "جشنواره فروش"}
          </span>
          {!showDetails ? (
            <Link href="/festival" className="text-xs font-normal text-primary underline-offset-4 hover:underline">
              جزئیات
            </Link>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {festival.isLoading ? "در حال بارگذاری وضعیت جشنواره..." : data?.message ?? "جشنواره‌ای فعال نیست."}
        </p>
        {data?.hasActiveFestival ? (
          <>
            {showDetails && data.description ? (
              <p className="text-sm">{data.description}</p>
            ) : null}
            {showDetails && data.startsAt && data.endsAt ? (
              <p className="text-xs text-muted-foreground">
                بازه: {formatJalali(data.startsAt)} تا {formatJalali(data.endsAt)}
              </p>
            ) : null}
            {data.rewardText ? (
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                پاداش: {data.rewardText}
              </p>
            ) : null}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                پیشرفت: {toFaDigits(data.currentIssuedCount)} از {toFaDigits(data.requiredIssuedCount)}
              </span>
              <span>{toFaDigits(progress)}٪</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-amber-500/20">
              <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            {data.targetReached ? (
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">تارگت محقق شد — مشمول پاداش هستید.</p>
            ) : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
