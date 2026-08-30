"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { DataPagination } from "@/components/data-pagination";
import {
  buildPolicyQuery,
  emptyPolicyFilters,
  PolicyFiltersForm,
  type PolicyFilterValues,
} from "@/components/policy-filters-form";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, notifyError } from "@/lib/api";
import { formatToman, statusLabel, toFaDigits } from "@/lib/format";

export default function AdminPoliciesPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PolicyFilterValues>(emptyPolicyFilters);
  const [appliedFilters, setAppliedFilters] = useState<PolicyFilterValues>(emptyPolicyFilters);

  const { data } = useQuery({
    queryKey: ["admin-policies", appliedFilters, page],
    queryFn: () =>
      api.getPaged<Record<string, unknown>[]>(
        `/api/v1/admin/policies?${buildPolicyQuery(appliedFilters, page).toString()}`
      ),
  });
  const items = data?.data ?? [];

  async function exportExcel() {
    try {
      const qs = buildPolicyQuery(appliedFilters, 1).toString();
      const blob = await api.blob(`/api/v1/admin/policies/export?${qs}`);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "policies.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      notifyError(error);
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">بیمه‌نامه‌ها</h1>
            <p className="mt-1 text-sm text-muted-foreground">لیست و گزارش بیمه‌نامه‌های صادرشده با فیلتر و خروجی اکسل</p>
          </div>
          <Button className="min-h-11 shrink-0" onClick={exportExcel}>
            خروجی اکسل
          </Button>
        </div>

        <PolicyFiltersForm
          filters={filters}
          onChange={setFilters}
          onApply={() => {
            setPage(1);
            setAppliedFilters(filters);
          }}
          onReset={() => {
            setFilters(emptyPolicyFilters);
            setAppliedFilters(emptyPolicyFilters);
            setPage(1);
          }}
        />

        {items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>موردی یافت نشد.</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره</TableHead>
                    <TableHead>فروشگاه</TableHead>
                    <TableHead>بیمه‌گذار</TableHead>
                    <TableHead>IMEI</TableHead>
                    <TableHead>نوع</TableHead>
                    <TableHead>حق بیمه</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>پرداخت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((p, index) => (
                    <TableRow key={String(p.id ?? p.policyNumber ?? index)}>
                      <TableCell>{toFaDigits(String(p.policyNumber ?? "—"))}</TableCell>
                      <TableCell>{String(p.storeName ?? "")}</TableCell>
                      <TableCell>
                        {String(p.customerFirstName ?? "")} {String(p.customerLastName ?? "")}
                      </TableCell>
                      <TableCell>{toFaDigits(String(p.imei1 ?? ""))}</TableCell>
                      <TableCell>{statusLabel(String(p.insuranceType ?? ""))}</TableCell>
                      <TableCell>{formatToman(Number(p.premiumRial ?? 0))}</TableCell>
                      <TableCell>{statusLabel(String(p.status ?? ""))}</TableCell>
                      <TableCell>{statusLabel(String(p.paymentStatus ?? ""))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DataPagination pagination={data?.pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </AdminShell>
  );
}
