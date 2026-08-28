"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <CardHeader><CardTitle>{toFaDigits(data.policyNumber ?? data.id)}</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>فروشگاه: {data.storeName}</p>
          <p>بیمه‌گذار: {data.customerFirstName} {data.customerLastName}</p>
          <p>وضعیت: {statusLabel(data.status)}</p>
          <p>حق بیمه: {formatToman(data.premiumRial)}</p>
          <p>سریال: {toFaDigits(data.imei1)}</p>
          {data.issueDate ? <p>صدور: {formatJalali(data.issueDate)}</p> : null}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
