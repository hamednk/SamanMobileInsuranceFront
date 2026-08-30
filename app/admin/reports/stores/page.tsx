"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { DataPagination } from "@/components/data-pagination";
import { JalaliDatePicker } from "@/components/jalali-date-picker";
import { SearchField } from "@/components/search-field";
import { Button } from "@/components/ui/button";
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
import { formatJalali } from "@/lib/format";
import type { LookupItem } from "@/types";

type StoreFilters = {
  from: string;
  to: string;
  search: string;
  provinceId: string;
  cityId: string;
  isActive: string;
};

const emptyFilters: StoreFilters = {
  from: "",
  to: "",
  search: "",
  provinceId: "",
  cityId: "",
  isActive: "",
};

export default function StoreReportPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<StoreFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<StoreFilters>(emptyFilters);

  const { data: provinces = [] } = useQuery({
    queryKey: ["admin-provinces"],
    queryFn: () => api.get<LookupItem[]>("/api/v1/admin/provinces"),
  });
  const { data: cities = [] } = useQuery({
    queryKey: ["admin-cities", appliedFilters.provinceId],
    queryFn: () =>
      api.get<LookupItem[]>(
        appliedFilters.provinceId
          ? `/api/v1/admin/cities?provinceId=${appliedFilters.provinceId}`
          : "/api/v1/admin/cities"
      ),
    enabled: Boolean(appliedFilters.provinceId),
  });

  const qs = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (appliedFilters.from) qs.set("from", appliedFilters.from);
  if (appliedFilters.to) qs.set("to", appliedFilters.to);
  if (appliedFilters.search) qs.set("search", appliedFilters.search);
  if (appliedFilters.provinceId) qs.set("provinceId", appliedFilters.provinceId);
  if (appliedFilters.cityId) qs.set("cityId", appliedFilters.cityId);
  if (appliedFilters.isActive) qs.set("isActive", appliedFilters.isActive);

  const { data } = useQuery({
    queryKey: ["store-report", appliedFilters, page],
    queryFn: () => api.getPaged<Record<string, unknown>[]>(`/api/v1/admin/stores?${qs.toString()}`),
  });

  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">گزارش فروشگاه‌ها</h1>
        <form
          className="grid gap-3 rounded-xl border border-primary/10 bg-card/60 p-4 md:grid-cols-2 xl:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setAppliedFilters(filters);
          }}
        >
          <div className="space-y-1.5">
            <Label>از تاریخ</Label>
            <JalaliDatePicker value={filters.from} onChange={(from) => setFilters((f) => ({ ...f, from }))} placeholder="از تاریخ" />
          </div>
          <div className="space-y-1.5">
            <Label>تا تاریخ</Label>
            <JalaliDatePicker value={filters.to} onChange={(to) => setFilters((f) => ({ ...f, to }))} placeholder="تا تاریخ" />
          </div>
          <div className="space-y-1.5">
            <Label>استان</Label>
            <Select
              value={filters.provinceId || "all"}
              onValueChange={(value) =>
                setFilters((f) => ({
                  ...f,
                  provinceId: pickSelectValue(value),
                  cityId: "",
                }))
              }
            >
              <SelectTrigger className="min-h-11 w-full">
                <SelectValue placeholder="همه استان‌ها" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه استان‌ها</SelectItem>
                {provinces.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>شهر</Label>
            <Select
              value={filters.cityId || "all"}
              onValueChange={(value) => setFilters((f) => ({ ...f, cityId: pickSelectValue(value) }))}
              disabled={!filters.provinceId}
            >
              <SelectTrigger className="min-h-11 w-full">
                <SelectValue placeholder="همه شهرها" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه شهرها</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>وضعیت</Label>
            <Select
              value={filters.isActive || "all"}
              onValueChange={(value) => setFilters((f) => ({ ...f, isActive: pickSelectValue(value) }))}
            >
              <SelectTrigger className="min-h-11 w-full">
                <SelectValue placeholder="همه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه</SelectItem>
                <SelectItem value="true">فعال</SelectItem>
                <SelectItem value="false">غیرفعال</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>جستجو</Label>
            <SearchField value={filters.search} onChange={(search) => setFilters((f) => ({ ...f, search }))} placeholder="جستجوی فروشگاه..." />
          </div>
          <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-4">
            <Button type="submit" className="min-h-11">
              اعمال فیلتر
            </Button>
          </div>
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
        <DataPagination pagination={data?.pagination} onPageChange={setPage} />
      </div>
    </AdminShell>
  );
}
