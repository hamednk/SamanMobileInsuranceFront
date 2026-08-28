"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { JalaliDatePicker } from "@/components/jalali-date-picker";
import { SearchField } from "@/components/search-field";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, notifyError } from "@/lib/api";
import { formatToman, statusLabel, toFaDigits } from "@/lib/format";

export default function InsuranceReportPage() {
  const [fromDate, setFrom] = useState("");
  const [toDate, setTo] = useState("");
  const [search, setSearch] = useState("");
  const qs = new URLSearchParams({ page: "1", pageSize: "20" });
  if (fromDate) qs.set("fromDate", fromDate);
  if (toDate) qs.set("toDate", toDate);
  if (search) qs.set("search", search);
  const { data, refetch } = useQuery({
    queryKey: ["ins-report", fromDate, toDate, search],
    queryFn: () => api.getPaged<Record<string, unknown>[]>(`/api/v1/admin/reports/insurance?${qs.toString()}`),
  });

  async function exportExcel() {
    try {
      const blob = await api.blob(`/api/v1/admin/reports/insurance/export?${qs.toString()}`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "insurance-report.xlsx";
      a.click();
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
      <form
        className="mb-4 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          refetch();
        }}
      >
        <div className="w-44">
          <JalaliDatePicker value={fromDate} onChange={setFrom} placeholder="از تاریخ" />
        </div>
        <div className="w-44">
          <JalaliDatePicker value={toDate} onChange={setTo} placeholder="تا تاریخ" />
        </div>
        <SearchField value={search} onChange={setSearch} placeholder="جستجو در گزارش..." className="max-w-xs" />
        <Button type="submit" className="min-h-11">
          اعمال فیلتر
        </Button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>شماره</TableHead>
              <TableHead>فروشگاه</TableHead>
              <TableHead>بیمه‌گذار</TableHead>
              <TableHead>IMEI</TableHead>
              <TableHead>حق بیمه</TableHead>
              <TableHead>وضعیت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.data ?? []).map((p, i) => (
              <TableRow key={String(p.policyNumber ?? i)}>
                <TableCell>{toFaDigits(String(p.policyNumber ?? "—"))}</TableCell>
                <TableCell>{String(p.storeName ?? "")}</TableCell>
                <TableCell>
                  {String(p.customerFirstName ?? "")} {String(p.customerLastName ?? "")}
                </TableCell>
                <TableCell>{toFaDigits(String(p.imei1 ?? ""))}</TableCell>
                <TableCell>{formatToman(Number(p.premiumRial ?? 0))}</TableCell>
                <TableCell>{statusLabel(String(p.status ?? ""))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}
