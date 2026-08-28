"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { JalaliDatePicker } from "@/components/jalali-date-picker";
import { SearchField } from "@/components/search-field";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatJalali } from "@/lib/format";

export default function StoreReportPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const qs = new URLSearchParams({ page: "1", pageSize: "20" });
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  if (search) qs.set("search", search);
  const { data, refetch } = useQuery({
    queryKey: ["store-report", from, to, search],
    queryFn: () => api.getPaged<Record<string, unknown>[]>(`/api/v1/admin/stores?${qs.toString()}`),
  });

  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">گزارش فروشگاه‌ها</h1>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            refetch();
          }}
        >
          <div className="w-44">
            <JalaliDatePicker value={from} onChange={setFrom} placeholder="از تاریخ" />
          </div>
          <div className="w-44">
            <JalaliDatePicker value={to} onChange={setTo} placeholder="تا تاریخ" />
          </div>
          <SearchField value={search} onChange={setSearch} placeholder="جستجوی فروشگاه..." className="max-w-xs" />
          <Button type="submit" className="min-h-11">
            اعمال فیلتر
          </Button>
        </form>
        <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>فروشگاه</TableHead>
                <TableHead>مدیر</TableHead>
                <TableHead>استان</TableHead>
                <TableHead>تاریخ</TableHead>
                <TableHead>وضعیت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).map((s) => (
                <TableRow key={String(s.id)}>
                  <TableCell>{String(s.storeName)}</TableCell>
                  <TableCell>{String(s.managerName)}</TableCell>
                  <TableCell>
                    {String(s.province)} / {String(s.city)}
                  </TableCell>
                  <TableCell>{formatJalali(String(s.createdAt))}</TableCell>
                  <TableCell>{s.isActive ? "فعال" : "غیرفعال"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminShell>
  );
}
