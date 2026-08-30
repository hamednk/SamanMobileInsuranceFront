"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { StoreShell } from "@/components/store-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { WizardStepper } from "@/features/insurance/stepper";
import { api, notifyError } from "@/lib/api";
import { formatAmountInput, formatRial, formatToman, parseAmountInput, statusLabel, toFaDigits } from "@/lib/format";
import type { PaymentInit, Policy } from "@/types";

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-6">در حال بارگذاری...</div>}>
      <PaymentInner />
    </Suspense>
  );
}

function PaymentInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [chargedOverride, setChargedOverride] = useState<string | null>(null);
  const failed = search.get("failed") === "1";

  const { data } = useQuery({
    queryKey: ["policy", params.id],
    queryFn: () => api.get<Policy>(`/api/v1/insurance/${params.id}`),
  });

  const chargedRial = chargedOverride ?? (data ? formatAmountInput(String(data.customerChargedRial)) : "");
  const chargedAmount = parseAmountInput(chargedRial);
  const premium = data?.premiumRial ?? 0;
  const profit = chargedAmount >= premium ? chargedAmount - premium : 0;
  const chargedInvalid = chargedAmount > 0 && chargedAmount < premium;

  async function pay() {
    setPending(true);
    try {
      if (data && chargedAmount > 0 && chargedAmount !== data.customerChargedRial) {
        await api.put(`/api/v1/insurance/${params.id}/customer-charged`, { customerChargedRial: chargedAmount });
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
            <Row label="حق بیمه (سهم شرکت)" value={data ? formatToman(data.premiumRial) : ""} />
            <div className="flex flex-col gap-1 border-b border-border/60 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">مبلغ دریافتی از مشتری</span>
              </div>
              <Input
                inputMode="numeric"
                className="min-h-11"
                value={chargedRial}
                onChange={(e) => setChargedOverride(formatAmountInput(e.target.value))}
                disabled={!data}
              />
              <p className="text-xs text-muted-foreground">
                هر مبلغ بیشتر از حق بیمه، سود فروشگاه است. پرداخت درگاه فقط سهم شرکت است.
              </p>
              {chargedInvalid ? (
                <p className="text-sm text-destructive">مبلغ دریافتی نمی‌تواند کمتر از حق بیمه باشد.</p>
              ) : null}
            </div>
            <Row label="سود فروشگاه" value={data ? formatToman(profit) : ""} />
            <Row label="شماره موقت" value={data?.id ?? ""} />
            <Row label="مبلغ قابل پرداخت (سهم شرکت)" value={data ? formatToman(data.premiumRial) : ""} />
            <Button className="mt-4 min-h-11" onClick={pay} disabled={pending || !data || chargedInvalid}>
              {pending ? <Spinner data-icon="inline-start" /> : null}
              انتقال به درگاه پرداخت
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
