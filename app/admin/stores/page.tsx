"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { DataPagination } from "@/components/data-pagination";
import { JalaliDatePicker } from "@/components/jalali-date-picker";
import {
  buildPolicyQuery,
  emptyPolicyFilters,
  pickSelectValue,
  PolicyFiltersForm,
  type PolicyFilterValues,
} from "@/components/policy-filters-form";
import { SearchField } from "@/components/search-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, notifyError } from "@/lib/api";
import { formatJalali, formatToman, statusLabel, toFaDigits } from "@/lib/format";
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
  const [tab, setTab] = useState("stores");
  const [storePage, setStorePage] = useState(1);
  const [policyPage, setPolicyPage] = useState(1);
  const [storeFilters, setStoreFilters] = useState<StoreListFilters>(emptyStoreFilters);
  const [appliedStoreFilters, setAppliedStoreFilters] = useState<StoreListFilters>(emptyStoreFilters);
  const [policyFilters, setPolicyFilters] = useState<PolicyFilterValues>(emptyPolicyFilters);
  const [appliedPolicyFilters, setAppliedPolicyFilters] = useState<PolicyFilterValues>(emptyPolicyFilters);

  const { data: provinces = [] } = useQuery({
    queryKey: ["admin-provinces"],
    queryFn: () => api.get<LookupItem[]>("/api/v1/admin/provinces"),
  });
  const { data: cities = [] } = useQuery({
    queryKey: ["admin-cities", appliedStoreFilters.provinceId],
    queryFn: () =>
      api.get<LookupItem[]>(
        appliedStoreFilters.provinceId
          ? `/api/v1/admin/cities?provinceId=${appliedStoreFilters.provinceId}`
          : "/api/v1/admin/cities"
      ),
    enabled: Boolean(appliedStoreFilters.provinceId),
  });

  const storesQuery = useQuery({
    queryKey: ["admin-stores", appliedStoreFilters, storePage],
    queryFn: () =>
      api.getPaged<StoreRow[]>(`/api/v1/admin/stores?${buildStoreQuery(appliedStoreFilters, storePage).toString()}`),
  });

  const policiesQuery = useQuery({
    queryKey: ["admin-store-policies", appliedPolicyFilters, policyPage],
    queryFn: () =>
      api.getPaged<Record<string, unknown>[]>(
        `/api/v1/admin/policies?${buildPolicyQuery(appliedPolicyFilters, policyPage).toString()}`
      ),
    enabled: tab === "sales",
  });

  async function exportExcel() {
    try {
      const qs = buildPolicyQuery(appliedPolicyFilters, 1).toString();
      const blob = await api.blob(`/api/v1/admin/policies/export?${qs}`);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "store-policies.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      notifyError(error);
    }
  }

  const storeItems = storesQuery.data?.data ?? [];
  const policyItems = policiesQuery.data?.data ?? [];

  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">فروشگاه‌ها</h1>
          {tab === "sales" ? (
            <Button className="min-h-11" onClick={exportExcel}>
              خروجی اکسل
            </Button>
          ) : null}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="stores">لیست فروشگاه‌ها</TabsTrigger>
            <TabsTrigger value="sales">گزارش فروش بیمه</TabsTrigger>
          </TabsList>

          <TabsContent value="stores" className="flex flex-col gap-4">
            <form
              className="grid gap-3 rounded-xl border border-primary/10 bg-card/60 p-4 md:grid-cols-2 xl:grid-cols-4"
              onSubmit={(event) => {
                event.preventDefault();
                setStorePage(1);
                setAppliedStoreFilters(storeFilters);
              }}
            >
              <div className="space-y-1.5">
                <Label>از تاریخ ثبت</Label>
                <JalaliDatePicker value={storeFilters.from} onChange={(from) => setStoreFilters((f) => ({ ...f, from }))} placeholder="از تاریخ" />
              </div>
              <div className="space-y-1.5">
                <Label>تا تاریخ ثبت</Label>
                <JalaliDatePicker value={storeFilters.to} onChange={(to) => setStoreFilters((f) => ({ ...f, to }))} placeholder="تا تاریخ" />
              </div>
              <div className="space-y-1.5">
                <Label>استان</Label>
                <Select
                  value={storeFilters.provinceId || "all"}
                  onValueChange={(value) =>
                    setStoreFilters((f) => ({
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
                  value={storeFilters.cityId || "all"}
                  onValueChange={(value) => setStoreFilters((f) => ({ ...f, cityId: pickSelectValue(value) }))}
                  disabled={!storeFilters.provinceId}
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
                <Label>وضعیت فروشگاه</Label>
                <Select
                  value={storeFilters.isActive || "all"}
                  onValueChange={(value) => setStoreFilters((f) => ({ ...f, isActive: pickSelectValue(value) }))}
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
              <div className="space-y-1.5 md:col-span-2 xl:col-span-3">
                <Label>جستجو</Label>
                <SearchField
                  value={storeFilters.search}
                  onChange={(search) => setStoreFilters((f) => ({ ...f, search }))}
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
                    setStoreFilters(emptyStoreFilters);
                    setAppliedStoreFilters(emptyStoreFilters);
                    setStorePage(1);
                  }}
                >
                  پاک کردن فیلترها
                </Button>
              </div>
            </form>

            {storeItems.length === 0 ? (
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
                      {storeItems.map((s) => (
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
                <DataPagination pagination={storesQuery.data?.pagination} onPageChange={setStorePage} />
              </>
            )}
          </TabsContent>

          <TabsContent value="sales" className="flex flex-col gap-4">
            <PolicyFiltersForm
              filters={policyFilters}
              onChange={setPolicyFilters}
              onApply={() => {
                setPolicyPage(1);
                setAppliedPolicyFilters(policyFilters);
              }}
              onReset={() => {
                setPolicyFilters(emptyPolicyFilters);
                setAppliedPolicyFilters(emptyPolicyFilters);
                setPolicyPage(1);
              }}
            />

            {policyItems.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>موردی یافت نشد.</EmptyTitle>
                  <EmptyDescription>بیمه‌نامه‌ای مطابق فیلتر وجود ندارد.</EmptyDescription>
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
                        <TableHead>نوع</TableHead>
                        <TableHead>حق بیمه</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>پرداخت</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {policyItems.map((p, index) => (
                        <TableRow key={String(p.id ?? p.policyNumber ?? index)}>
                          <TableCell>{toFaDigits(String(p.policyNumber ?? "—"))}</TableCell>
                          <TableCell>{String(p.storeName ?? "")}</TableCell>
                          <TableCell>
                            {String(p.customerFirstName ?? "")} {String(p.customerLastName ?? "")}
                          </TableCell>
                          <TableCell>{statusLabel(String(p.insuranceType ?? ""))}</TableCell>
                          <TableCell>{formatToman(Number(p.premiumRial ?? 0))}</TableCell>
                          <TableCell>{statusLabel(String(p.status ?? ""))}</TableCell>
                          <TableCell>{statusLabel(String(p.paymentStatus ?? ""))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <DataPagination pagination={policiesQuery.data?.pagination} onPageChange={setPolicyPage} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
}
