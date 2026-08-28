"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { SearchField } from "@/components/search-field";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatToman, statusLabel, toFaDigits } from "@/lib/format";

export default function AdminPoliciesPage() {
  const [search, setSearch] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-policies", search],
    queryFn: () =>
      api.getPaged<Record<string, unknown>[]>(
        `/api/v1/admin/policies?page=1&pageSize=20&search=${encodeURIComponent(search)}`
      ),
  });
  const items = data?.data ?? [];

  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">بیمه‌نامه‌ها</h1>
        <SearchField value={search} onChange={setSearch} placeholder="جستجو شماره بیمه‌نامه، فروشگاه، بیمه‌گذار، IMEI..." />
        {items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>موردی یافت نشد.</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>شماره</TableHead>
                  <TableHead>فروشگاه</TableHead>
                  <TableHead>بیمه‌گذار</TableHead>
                  <TableHead>حق بیمه</TableHead>
                  <TableHead>وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={String(p.policyNumber ?? p.imei1)}>
                    <TableCell>{toFaDigits(String(p.policyNumber ?? "—"))}</TableCell>
                    <TableCell>{String(p.storeName ?? "")}</TableCell>
                    <TableCell>
                      {String(p.customerFirstName ?? "")} {String(p.customerLastName ?? "")}
                    </TableCell>
                    <TableCell>{formatToman(Number(p.premiumRial ?? 0))}</TableCell>
                    <TableCell>{statusLabel(String(p.status ?? ""))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
