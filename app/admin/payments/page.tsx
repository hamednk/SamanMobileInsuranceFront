"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { SearchField } from "@/components/search-field";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatJalali, formatToman, statusLabel, toFaDigits } from "@/lib/format";

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () =>
      api.getPaged<{ id: string; policyNumber?: string; amountRial: number; status: string; trackingCode?: string; createdAt: string }[]>(
        "/api/v1/admin/payments?page=1&pageSize=50"
      ),
  });
  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = data?.data ?? [];
    if (!q) return rows;
    return rows.filter((p) =>
      [p.policyNumber, p.trackingCode, p.status, String(p.amountRial)].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data?.data, search]);

  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">پرداخت‌ها</h1>
        <SearchField value={search} onChange={setSearch} placeholder="جستجو شماره بیمه‌نامه، پیگیری، وضعیت..." />
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
      </div>
    </AdminShell>
  );
}
