"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BadgeCheckIcon, FileTextIcon, ListIcon } from "lucide-react";
import { StoreShell } from "@/components/store-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardStepper } from "@/features/insurance/stepper";
import { api } from "@/lib/api";
import { formatJalali, formatToman, statusLabel, toFaDigits } from "@/lib/format";
import type { Policy } from "@/types";

export default function SuccessPage() {
  const params = useParams<{ id: string }>();
  const { data } = useQuery({
    queryKey: ["policy", params.id],
    queryFn: () => api.get<Policy>(`/api/v1/insurance/${params.id}`),
  });

  return (
    <StoreShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <WizardStepper current={4} />
        <Card className="border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-background to-transparent">
          <CardHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <BadgeCheckIcon className="size-6" />
            </div>
            <CardTitle>پرداخت با موفقیت انجام شد</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">شماره بیمه‌نامه</span>
              <Badge variant="secondary">{toFaDigits(data?.policyNumber ?? "در حال صدور...")}</Badge>
            </div>
            <p>
              بیمه‌گذار: {data?.customerFirstName} {data?.customerLastName}
            </p>
            <p>موبایل: {toFaDigits(data?.customerMobile ?? "")}</p>
            <p>مبلغ: {data ? formatToman(data.premiumRial) : ""}</p>
            <p>تاریخ صدور: {data?.issueDate ? formatJalali(data.issueDate) : "—"}</p>
            <p>وضعیت: {data ? statusLabel(data.status) : ""}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button className="min-h-11" render={<Link href={`/insurance/${params.id}`} />}>
                <FileTextIcon data-icon="inline-start" />
                مشاهده بیمه‌نامه
              </Button>
              <Button variant="outline" className="min-h-11" render={<Link href="/policies" />}>
                <ListIcon data-icon="inline-start" />
                بیمه‌های من
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StoreShell>
  );
}
