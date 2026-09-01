"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BrandLogo } from "@/components/brand-logo";
import { PublicAuthChrome } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { api, notifyError } from "@/lib/api";

type PaymentComplete = {
  paid: boolean;
  policyId: string;
  nextPath: string;
};

function MockGatewayInner() {
  const search = useSearchParams();
  const router = useRouter();
  const client = useQueryClient();
  const authority = search.get("authority") ?? "";
  const policyId = search.get("policyId") ?? "";
  const [pending, setPending] = useState<"ok" | "fail" | null>(null);

  async function complete(status: "OK" | "NOK") {
    setPending(status === "OK" ? "ok" : "fail");
    try {
      if (status === "NOK") {
        router.replace(policyId ? `/insurance/${policyId}/payment?failed=1` : "/policies");
        return;
      }

      const result = await api.post<PaymentComplete>("/api/v1/payments/complete", {
        authority,
        status: "OK",
      });
      const resolvedPolicyId = result.policyId || policyId;
      if (resolvedPolicyId) {
        await client.invalidateQueries({ queryKey: ["policy", resolvedPolicyId] });
        await client.invalidateQueries({ queryKey: ["policies"] });
      }
      const next = result.nextPath || (resolvedPolicyId ? `/insurance/${resolvedPolicyId}/success` : null);
      router.replace(next || "/policies");
    } catch (error) {
      notifyError(error);
      setPending(null);
      if (policyId) {
        router.replace(`/insurance/${policyId}/payment?failed=1`);
      }
    }
  }

  return (
    <PublicAuthChrome>
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <BrandLogo size="hero" />
        <Card className="w-full">
          <CardHeader>
            <CardTitle>درگاه پرداخت آزمایشی</CardTitle>
            <CardDescription>این صفحه جایگزین درگاه واقعی است و فقط برای محیط توسعه استفاده می‌شود.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">شناسه: {authority || "نامشخص"}</p>
            <Button className="min-h-11" disabled={pending !== null} onClick={() => complete("OK")}>
              {pending === "ok" ? <Spinner data-icon="inline-start" /> : null}
              پرداخت موفق
            </Button>
            <Button variant="outline" className="min-h-11" disabled={pending !== null} onClick={() => complete("NOK")}>
              {pending === "fail" ? <Spinner data-icon="inline-start" /> : null}
              انصراف / پرداخت ناموفق
            </Button>
          </CardContent>
        </Card>
      </div>
    </PublicAuthChrome>
  );
}

export default function MockGatewayPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">در حال بارگذاری...</div>}>
      <MockGatewayInner />
    </Suspense>
  );
}
