"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PolicyImagesButton } from "@/features/insurance/policy-images-dialog";
import { api } from "@/lib/api";
import { formatJalali, formatToman, statusLabel, toFaDigits } from "@/lib/format";
import type { Policy } from "@/types";

export default function AdminPolicyDetailPage() {
  const params = useParams<{ id: string }>();
  const { data } = useQuery({
    queryKey: ["admin-policy", params.id],
    queryFn: () => api.get<Policy>(`/api/v1/admin/policies/${params.id}`),
  });
  if (!data) {
    return <AdminShell><p>در حال بارگذاری...</p></AdminShell>;
  }
  return (
    <AdminShell>
      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <CardTitle>{toFaDigits(data.policyNumber ?? data.id)}</CardTitle>
          <PolicyImagesButton policyId={data.id} scope="admin" title="تصاویر بیمه‌نامه" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>فروشگاه: {data.storeName}</p>
          <p>بیمه‌گذار: {data.customerFirstName} {data.customerLastName}</p>
          <p>وضعیت: {statusLabel(data.status)}</p>
          <p>حق بیمه (سهم شرکت): {formatToman(data.premiumRial)}</p>
          <p>دریافتی از مشتری: {formatToman(data.customerChargedRial)}</p>
          <p>سود فروشگاه: {formatToman(data.storeProfitRial)}</p>
          <p>سریال: {toFaDigits(data.imei1)}</p>
          {data.issueDate ? <p>صدور: {formatJalali(data.issueDate)}</p> : null}
          <Button variant="outline" className="mt-2 min-h-10 w-fit" render={<Link href="/admin/policies" />}>
            بازگشت به لیست
          </Button>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
