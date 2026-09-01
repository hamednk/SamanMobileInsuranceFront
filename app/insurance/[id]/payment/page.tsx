"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { StoreShell } from "@/components/store-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { WizardStepper } from "@/features/insurance/stepper";
import { api, notifyError } from "@/lib/api";
import { formatRial, formatToman, statusLabel, toFaDigits } from "@/lib/format";
import type { PaymentInit, Policy } from "@/types";

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-6">در حال بارگذاری...</div>}>
      <PaymentInner />
    </Suspense>
  );
}

function isPolicyPaid(status: string) {
  return status === "Paid" || status === "Issued";
}

function PaymentInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const failed = search.get("failed") === "1";

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["policy", params.id],
    queryFn: () => api.get<Policy>(`/api/v1/insurance/${params.id}`),
  });

  useEffect(() => {
    if (data && isPolicyPaid(data.status)) {
      router.replace(`/insurance/${params.id}/success`);
    }
  }, [data, params.id, router]);

  const premium = data?.premiumRial ?? 0;
  const profit = data ? data.storeProfitRial : 0;
  const alreadyPaid = data ? isPolicyPaid(data.status) : false;

  async function pay() {
    setPending(true);
    try {
      const latest = await refetch();
      const policy = latest.data;
      if (policy && isPolicyPaid(policy.status)) {
        router.replace(`/insurance/${params.id}/success`);
        return;
      }

      const init = await api.post<PaymentInit>(`/api/v1/insurance/${params.id}/payment/init`);
      const url = new URL(init.redirectUrl, window.location.origin);
      url.searchParams.set("policyId", params.id);
      router.push(`${url.pathname}${url.search}`);
    } catch (error) {
      notifyError(error);
      setPending(false);
    }
  }

  return (
    <StoreShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <WizardStepper current={3} />
        {failed ? <p className="rounded-lg bg-destructive/10 p-3 text-destructive">پرداخت ناموفق بود. دوباره تلاش کنید.</p> : null}
        <Card>
          <CardHeader>
            <CardTitle>بازبینی و پرداخت</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <Row label="بیمه‌گذار" value={`${data?.customerFirstName ?? ""} ${data?.customerLastName ?? ""}`} />
            <Row label="برند / مدل" value={`${data?.brandName ?? ""} ${data?.modelName ?? ""}`} />
            <Row label="نوع موبایل" value={data ? statusLabel(data.insuranceType) : ""} />
            <Row label="قیمت موبایل" value={data ? `${formatRial(data.mobilePriceRial)} (${formatToman(data.mobilePriceRial)})` : ""} />
            <Row label="حق بیمه (سهم شرکت)" value={data ? formatToman(premium) : ""} />
            <Row label="دریافتی از مشتری" value={data ? formatToman(data.customerChargedRial) : ""} />
            <Row label="سود فروشگاه" value={data ? formatToman(profit) : ""} />
            <p className="text-xs text-muted-foreground">
              سود فروشگاه فقط نمایش داده می‌شود و در درگاه پرداخت نمی‌شود. مبلغ پرداخت فقط حق بیمه است.
            </p>
            <Row label="مبلغ قابل پرداخت" value={data ? formatToman(premium) : ""} />
            <Button className="mt-4 min-h-11" onClick={pay} disabled={pending || !data || isLoading || alreadyPaid}>
              {pending ? <Spinner data-icon="inline-start" /> : null}
              پرداخت حق بیمه
            </Button>
            <Button variant="outline" onClick={() => router.push(`/insurance/${params.id}/edit`)}>
              بازگشت و ویرایش اطلاعات
            </Button>
            <Button variant="outline" onClick={() => router.push(`/insurance/${params.id}/images`)}>
              بازگشت به تصاویر
            </Button>
          </CardContent>
        </Card>
      </div>
    </StoreShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-end font-medium">{toFaDigits(value)}</span>
    </div>
  );
}
