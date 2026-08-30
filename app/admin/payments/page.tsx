"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { DataPagination } from "@/components/data-pagination";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { pickSelectValue } from "@/components/policy-filters-form";
import { formatJalali, formatToman, statusLabel, toFaDigits } from "@/lib/format";

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const qs = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (status) qs.set("status", status);

  const { data } = useQuery({
    queryKey: ["admin-payments", page, status],
    queryFn: () =>
      api.getPaged<{ id: string; policyNumber?: string; amountRial: number; status: string; trackingCode?: string; createdAt: string }[]>(
        `/api/v1/admin/payments?${qs.toString()}`
      ),
  });
  const items = data?.data ?? [];

  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">پرداخت‌ها</h1>
        <div className="w-full max-w-xs space-y-1.5">
          <Label>وضعیت پرداخت</Label>
          <Select
            value={status || "all"}
            onValueChange={(value) => {
              setStatus(pickSelectValue(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="min-h-11 w-full">
              <SelectValue placeholder="همه" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="Paid">موفق</SelectItem>
              <SelectItem value="Pending">در انتظار</SelectItem>
              <SelectItem value="Failed">ناموفق</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>بیمه‌نامه</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>پیگیری</TableHead>
                <TableHead>تاریخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{toFaDigits(p.policyNumber ?? "—")}</TableCell>
                  <TableCell>{formatToman(p.amountRial)}</TableCell>
                  <TableCell>{statusLabel(p.status)}</TableCell>
                  <TableCell>{toFaDigits(p.trackingCode ?? "—")}</TableCell>
                  <TableCell>{formatJalali(p.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DataPagination pagination={data?.pagination} onPageChange={setPage} />
      </div>
    </AdminShell>
  );
}
