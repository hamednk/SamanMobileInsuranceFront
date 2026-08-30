"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CreditCardIcon,
  HashIcon,
  IdCardIcon,
  PhoneIcon,
  ShieldIcon,
  SmartphoneIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react";
import { DetailField, DetailHero, DetailSection } from "@/components/detail-panel";
import { PolicyImagesButton } from "@/features/insurance/policy-images-dialog";
import { StoreShell } from "@/components/store-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatJalali, formatToman, paymentStatusLabel, policyStatusLabel, statusLabel } from "@/lib/format";
import {
  getPolicyContinueHint,
  getPolicyContinueHref,
  getPolicyContinueLabel,
  isIncompletePolicy,
} from "@/lib/policy-flow";
import { cn } from "@/lib/utils";
import type { Policy } from "@/types";

function statusTone(status: string) {
  if (status === "Issued" || status === "Paid") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300";
  if (status === "AwaitingPayment") return "bg-sky-500/15 text-sky-700 border-sky-500/30 dark:text-sky-300";
  if (status === "AwaitingImages" || status === "Draft") return "bg-amber-500/15 text-amber-800 border-amber-500/30 dark:text-amber-200";
  if (status === "Cancelled" || status === "Failed") return "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-300";
  return "";
}

export default function PolicyDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["policy", params.id],
    queryFn: () => api.get<Policy>(`/api/v1/insurance/${params.id}`),
  });

  if (isLoading || !data) {
    return (
      <StoreShell>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </StoreShell>
    );
  }

  const continueHref = getPolicyContinueHref(data.id, data.status);
  const incomplete = isIncompletePolicy(data.status);

  return (
    <StoreShell>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <DetailHero
          tone={incomplete ? "amber" : data.status === "Issued" || data.status === "Paid" ? "emerald" : "blue"}
          eyebrow="جزئیات بیمه‌نامه"
          title={data.policyNumber ? `بیمه‌نامه ${data.policyNumber}` : "بیمه‌نامه موقت"}
          subtitle={`${data.brandName} ${data.modelName} · ${statusLabel(data.insuranceType)}`}
          badge={
            <Badge variant="outline" className={cn("h-6 border px-2.5", statusTone(data.status))}>
              {policyStatusLabel(data.status)}
            </Badge>
          }
          actions={
            <div className="flex flex-wrap gap-2">
              <PolicyImagesButton policyId={data.id} scope="store" title="تصاویر بیمه‌نامه" />
              {continueHref ? (
                <Button className="min-h-11" render={<Link href={continueHref} />}>
                  {getPolicyContinueLabel(data.status)}
                  <ArrowLeftIcon data-icon="inline-end" className="size-4" />
                </Button>
              ) : (
                <Button variant="outline" className="min-h-11" render={<Link href="/policies" />}>
                  بازگشت به لیست
                </Button>
              )}
            </div>
          }
        />

        {incomplete && continueHref ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
            <p className="text-amber-900 dark:text-amber-100">{getPolicyContinueHint(data.status)}</p>
            <Button size="sm" className="min-h-10" render={<Link href={continueHref} />}>
              {getPolicyContinueLabel(data.status)}
            </Button>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/15 to-transparent p-4">
            <p className="text-xs text-muted-foreground">حق بیمه</p>
            <p className="mt-1 text-lg font-semibold text-sky-800 dark:text-sky-200">{formatToman(data.premiumRial)}</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4">
            <p className="text-xs text-muted-foreground">وضعیت پرداخت</p>
            <p className="mt-1 text-lg font-semibold">{paymentStatusLabel(data.paymentStatus)}</p>
          </div>
        </div>

        <DetailSection title="بیمه‌گذار" icon={<UserIcon className="size-4" />}>
          <DetailField
            label="نام و نام خانوادگی"
            value={`${data.customerFirstName} ${data.customerLastName}`}
            icon={<UserIcon className="size-4" />}
          />
          <DetailField label="کد ملی" value={data.customerNationalCode} icon={<IdCardIcon className="size-4" />} mono />
          <DetailField label="موبایل" value={data.customerMobile} icon={<PhoneIcon className="size-4" />} mono />
          <DetailField label="آدرس" value={data.customerAddress} icon={<HashIcon className="size-4" />} full />
        </DetailSection>

        <DetailSection title="مشخصات موبایل" icon={<SmartphoneIcon className="size-4" />}>
          <DetailField
            label="برند / مدل"
            value={`${data.brandName} ${data.modelName}`}
            icon={<SmartphoneIcon className="size-4" />}
          />
          <DetailField label="نوع" value={statusLabel(data.insuranceType)} icon={<ShieldIcon className="size-4" />} />
          <DetailField label="سریال ۱" value={data.imei1} icon={<HashIcon className="size-4" />} mono />
          {data.imei2 ? <DetailField label="سریال ۲" value={data.imei2} icon={<HashIcon className="size-4" />} mono /> : null}
          <DetailField label="قیمت موبایل" value={formatToman(data.mobilePriceRial)} icon={<WalletIcon className="size-4" />} />
          <DetailField label="حق بیمه" value={formatToman(data.premiumRial)} icon={<CreditCardIcon className="size-4" />} />
        </DetailSection>

        <DetailSection title="تاریخ‌ها" icon={<CalendarIcon className="size-4" />}>
          <DetailField label="تاریخ شروع" value={formatJalali(data.startDate)} icon={<CalendarIcon className="size-4" />} />
          <DetailField
            label="تاریخ صدور"
            value={data.issueDate ? formatJalali(data.issueDate) : data.status === "Paid" ? "تا ۴۸ ساعت کاری آینده صادر می‌شود" : "هنوز صادر نشده"}
            icon={<CalendarIcon className="size-4" />}
          />
          <DetailField label="تاریخ ثبت" value={formatJalali(data.createdAt)} icon={<CalendarIcon className="size-4" />} />
        </DetailSection>
      </div>
    </StoreShell>
  );
}
