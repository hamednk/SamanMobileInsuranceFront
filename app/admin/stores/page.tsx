"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { DataPagination } from "@/components/data-pagination";
import { FilterSelect } from "@/components/filter-select";
import { JalaliDatePicker } from "@/components/jalali-date-picker";
import { SearchField } from "@/components/search-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatJalali, toFaDigits } from "@/lib/format";
import type { LookupItem } from "@/types";

type StoreRow = {
  id: string;
  storeName: string;
  managerName: string;
  nationalCode: string;
  mobile: string;
  province: string;
  city: string;
  createdAt: string;
  isActive: boolean;
};

type StoreListFilters = {
  search: string;
  from: string;
  to: string;
  provinceId: string;
  cityId: string;
  isActive: string;
};

const emptyStoreFilters: StoreListFilters = {
  search: "",
  from: "",
  to: "",
  provinceId: "",
  cityId: "",
  isActive: "",
};

function buildStoreQuery(filters: StoreListFilters, page: number, pageSize = 20) {
  const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (filters.search) qs.set("search", filters.search);
  if (filters.from) qs.set("from", filters.from);
  if (filters.to) qs.set("to", filters.to);
  if (filters.provinceId) qs.set("provinceId", filters.provinceId);
  if (filters.cityId) qs.set("cityId", filters.cityId);
  if (filters.isActive) qs.set("isActive", filters.isActive);
  return qs;
}

export default function AdminStoresPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<StoreListFilters>(emptyStoreFilters);
  const [appliedFilters, setAppliedFilters] = useState<StoreListFilters>(emptyStoreFilters);

  const { data: provinces = [] } = useQuery({
    queryKey: ["admin-provinces"],
    queryFn: () => api.get<LookupItem[]>("/api/v1/admin/provinces"),
  });
  const { data: cities = [] } = useQuery({
    queryKey: ["admin-cities", filters.provinceId],
    queryFn: () =>
      api.get<LookupItem[]>(
        filters.provinceId
          ? `/api/v1/admin/cities?provinceId=${filters.provinceId}`
          : "/api/v1/admin/cities"
      ),
    enabled: Boolean(filters.provinceId),
  });

  const { data } = useQuery({
    queryKey: ["admin-stores", appliedFilters, page],
    queryFn: () =>
      api.getPaged<StoreRow[]>(`/api/v1/admin/stores?${buildStoreQuery(appliedFilters, page).toString()}`),
  });

  const items = data?.data ?? [];

  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold">فروشگاه‌ها</h1>
          <p className="mt-1 text-sm text-muted-foreground">مدیریت فروشگاه‌ها و گزارش ثبت‌نام آن‌ها</p>
        </div>

        <form
          className="grid gap-3 rounded-xl border border-primary/10 bg-card/60 p-4 md:grid-cols-2 xl:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setAppliedFilters(filters);
          }}
        >
          <div className="space-y-1.5">
            <Label>از تاریخ ثبت</Label>
            <JalaliDatePicker value={filters.from} onChange={(from) => setFilters((f) => ({ ...f, from }))} placeholder="از تاریخ" />
          </div>
          <div className="space-y-1.5">
            <Label>تا تاریخ ثبت</Label>
            <JalaliDatePicker value={filters.to} onChange={(to) => setFilters((f) => ({ ...f, to }))} placeholder="تا تاریخ" />
          </div>
          <div className="space-y-1.5">
            <Label>استان</Label>
            <FilterSelect
              value={filters.provinceId}
              onChange={(provinceId) => setFilters((f) => ({ ...f, provinceId, cityId: "" }))}
              options={provinces.map((p) => ({ value: p.id, label: p.name }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>شهر</Label>
            <FilterSelect
              value={filters.cityId}
              onChange={(cityId) => setFilters((f) => ({ ...f, cityId }))}
              disabled={!filters.provinceId}
              options={cities.map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>وضعیت فروشگاه</Label>
            <FilterSelect
              value={filters.isActive}
              onChange={(isActive) => setFilters((f) => ({ ...f, isActive }))}
              options={[
                { value: "true", label: "فعال" },
                { value: "false", label: "غیرفعال" },
              ]}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2 xl:col-span-3">
            <Label>جستجو</Label>
            <SearchField
              value={filters.search}
              onChange={(search) => setFilters((f) => ({ ...f, search }))}
              placeholder="نام فروشگاه، مدیر، موبایل..."
            />
          </div>
          <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-4">
            <Button type="submit" className="min-h-11">
              اعمال فیلتر
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => {
                setFilters(emptyStoreFilters);
                setAppliedFilters(emptyStoreFilters);
                setPage(1);
              }}
            >
              پاک کردن فیلترها
            </Button>
          </div>
        </form>

        {items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>موردی یافت نشد.</EmptyTitle>
              <EmptyDescription>فروشگاهی مطابق فیلتر وجود ندارد.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>فروشگاه</TableHead>
                    <TableHead>مدیر</TableHead>
                    <TableHead>موبایل</TableHead>
                    <TableHead>استان</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>ثبت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Link href={`/admin/stores/${s.id}`} className="font-medium text-primary">
                          {s.storeName}
                        </Link>
                      </TableCell>
                      <TableCell>{s.managerName}</TableCell>
                      <TableCell>{toFaDigits(s.mobile)}</TableCell>
                      <TableCell>
                        {s.province} / {s.city}
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.isActive ? "secondary" : "destructive"}>
                          {s.isActive ? "فعال" : "غیرفعال"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatJalali(s.createdAt)}</TableCell>
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
