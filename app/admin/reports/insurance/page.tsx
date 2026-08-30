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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, notifyError } from "@/lib/api";
import { formatToman, statusLabel, toFaDigits } from "@/lib/format";

export default function InsuranceReportPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PolicyFilterValues>(emptyPolicyFilters);
  const [appliedFilters, setAppliedFilters] = useState<PolicyFilterValues>(emptyPolicyFilters);

  const { data } = useQuery({
    queryKey: ["ins-report", appliedFilters, page],
    queryFn: () =>
      api.getPaged<Record<string, unknown>[]>(
        `/api/v1/admin/reports/insurance?${buildPolicyQuery(appliedFilters, page).toString()}`
      ),
  });

  async function exportExcel() {
    try {
      const qs = buildPolicyQuery(appliedFilters, 1).toString();
      const blob = await api.blob(`/api/v1/admin/reports/insurance/export?${qs}`);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "insurance-report.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      notifyError(error);
    }
  }

  return (
    <AdminShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">گزارش بیمه‌های فروخته‌شده</h1>
        <Button className="min-h-11" onClick={exportExcel}>
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

      <div className="mt-4 overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
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
            {(data?.data ?? []).map((p, index) => (
              <TableRow key={String(p.policyNumber ?? index)}>
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
    </AdminShell>
  );
}
