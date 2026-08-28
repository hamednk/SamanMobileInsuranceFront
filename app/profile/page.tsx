"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheckIcon,
  HashIcon,
  IdCardIcon,
  MapPinIcon,
  PhoneIcon,
  StoreIcon,
  UserIcon,
  UserRoundIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { DetailField, DetailHero, DetailSection } from "@/components/detail-panel";
import { StoreShell } from "@/components/store-shell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatJalali } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StoreProfile } from "@/types";

export default function ProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["store-me"],
    queryFn: () => api.get<StoreProfile>("/api/v1/stores/me"),
  });

  return (
    <StoreShell>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        {isLoading || !data ? (
          <>
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </>
        ) : (
          <>
            <DetailHero
              tone={data.isActive ? "emerald" : "amber"}
              eyebrow="حساب فروشگاه"
              title={data.storeName}
              subtitle={`${data.provinceName}، ${data.cityName}`}
              badge={
                <Badge
                  variant="outline"
                  className={cn(
                    "h-6 border px-2.5",
                    data.isActive
                      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                  )}
                >
                  {data.isActive ? "فعال" : "غیرفعال"}
                </Badge>
              }
              actions={<BrandLogo size="header" />}
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4">
                <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <UserRoundIcon className="size-4" />
                </div>
                <p className="text-xs text-muted-foreground">مدیر فروشگاه</p>
                <p className="mt-1 font-semibold">
                  {data.managerFirstName} {data.managerLastName}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/15 to-transparent p-4">
                <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-300">
                  <PhoneIcon className="size-4" />
                </div>
                <p className="text-xs text-muted-foreground">موبایل</p>
                <p className="mt-1 font-semibold font-mono" dir="ltr">
                  {data.mobile1}
                </p>
              </div>
              <div className="rounded-2xl border border-teal-500/25 bg-gradient-to-br from-teal-500/15 to-transparent p-4">
                <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300">
                  <MapPinIcon className="size-4" />
                </div>
                <p className="text-xs text-muted-foreground">موقعیت</p>
                <p className="mt-1 font-semibold">
                  {data.provinceName} / {data.cityName}
                </p>
              </div>
            </div>

            <DetailSection title="اطلاعات فروشگاه" icon={<StoreIcon className="size-4" />}>
              <DetailField label="نام فروشگاه" value={data.storeName} icon={<StoreIcon className="size-4" />} />
              <DetailField label="نام کاربری" value={data.username} icon={<UserIcon className="size-4" />} mono />
              <DetailField
                label="وضعیت"
                value={
                  <span className="inline-flex items-center gap-1">
                    <BadgeCheckIcon className={cn("size-4", data.isActive ? "text-emerald-600" : "text-rose-600")} />
                    {data.isActive ? "فعال" : "غیرفعال"}
                  </span>
                }
                icon={<BadgeCheckIcon className="size-4" />}
              />
              <DetailField label="تاریخ ثبت" value={formatJalali(data.createdAt)} icon={<IdCardIcon className="size-4" />} />
            </DetailSection>

            <DetailSection title="اطلاعات مدیر" icon={<UserRoundIcon className="size-4" />}>
              <DetailField
                label="نام و نام خانوادگی"
                value={`${data.managerFirstName} ${data.managerLastName}`}
                icon={<UserIcon className="size-4" />}
              />
              <DetailField label="کد ملی" value={data.nationalCode} icon={<IdCardIcon className="size-4" />} mono />
              <DetailField label="موبایل ۱" value={data.mobile1} icon={<PhoneIcon className="size-4" />} mono />
              {data.mobile2 ? (
                <DetailField label="موبایل ۲" value={data.mobile2} icon={<PhoneIcon className="size-4" />} mono />
              ) : null}
            </DetailSection>

            <DetailSection title="آدرس" icon={<MapPinIcon className="size-4" />}>
              <DetailField
                label="استان / شهر"
                value={`${data.provinceName} / ${data.cityName}`}
                icon={<MapPinIcon className="size-4" />}
              />
              <DetailField label="کد پستی" value={data.postalCode} icon={<HashIcon className="size-4" />} mono />
              <DetailField label="آدرس کامل" value={data.address} icon={<MapPinIcon className="size-4" />} full />
            </DetailSection>
          </>
        )}
      </div>
    </StoreShell>
  );
}
