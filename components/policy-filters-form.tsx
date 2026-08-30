"use client";

import { useQuery } from "@tanstack/react-query";
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
import { api } from "@/lib/api";
import type { LookupItem } from "@/types";

export type PolicyFilterValues = {
  fromDate: string;
  toDate: string;
  search: string;
  provinceId: string;
  cityId: string;
  storeId: string;
  insuranceType: string;
  paymentStatus: string;
  status: string;
};

export const emptyPolicyFilters: PolicyFilterValues = {
  fromDate: "",
  toDate: "",
  search: "",
  provinceId: "",
  cityId: "",
  storeId: "",
  insuranceType: "",
  paymentStatus: "",
  status: "",
};

function pickSelectValue(value: string | null | undefined): string {
  return value && value !== "all" ? value : "";
}

export { pickSelectValue };

export function buildPolicyQuery(
  filters: PolicyFilterValues,
  page: number,
  pageSize = 20
): URLSearchParams {
  const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (filters.fromDate) qs.set("fromDate", filters.fromDate);
  if (filters.toDate) qs.set("toDate", filters.toDate);
  if (filters.search) qs.set("search", filters.search);
  if (filters.provinceId) qs.set("provinceId", filters.provinceId);
  if (filters.cityId) qs.set("cityId", filters.cityId);
  if (filters.storeId) qs.set("storeId", filters.storeId);
  if (filters.insuranceType) qs.set("insuranceType", filters.insuranceType);
  if (filters.paymentStatus) qs.set("paymentStatus", filters.paymentStatus);
  if (filters.status) qs.set("status", filters.status);
  return qs;
}

type PolicyFiltersProps = {
  filters: PolicyFilterValues;
  onChange: (next: PolicyFilterValues) => void;
  onApply: () => void;
  onReset?: () => void;
  showStoreFilter?: boolean;
};

type StoreOption = { id: string; storeName: string };

export function PolicyFiltersForm({
  filters,
  onChange,
  onApply,
  onReset,
  showStoreFilter = true,
}: PolicyFiltersProps) {
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
  const { data: stores } = useQuery({
    queryKey: ["admin-stores-lookup"],
    queryFn: () => api.getPaged<StoreOption[]>("/api/v1/admin/stores?page=1&pageSize=100"),
    enabled: showStoreFilter,
  });

  function patch(partial: Partial<PolicyFilterValues>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <form
      className="grid gap-3 rounded-xl border border-primary/10 bg-card/60 p-4 md:grid-cols-2 xl:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <div className="space-y-1.5">
        <Label>از تاریخ</Label>
        <JalaliDatePicker value={filters.fromDate} onChange={(fromDate) => patch({ fromDate })} placeholder="از تاریخ" />
      </div>
      <div className="space-y-1.5">
        <Label>تا تاریخ</Label>
        <JalaliDatePicker value={filters.toDate} onChange={(toDate) => patch({ toDate })} placeholder="تا تاریخ" />
      </div>
      <div className="space-y-1.5">
        <Label>استان</Label>
        <Select
          value={filters.provinceId || "all"}
          onValueChange={(value) =>
            patch({ provinceId: pickSelectValue(value), cityId: "", storeId: "" })
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
          onValueChange={(value) => patch({ cityId: pickSelectValue(value) })}
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
      {showStoreFilter ? (
        <div className="space-y-1.5 md:col-span-2">
          <Label>فروشگاه</Label>
          <Select
            value={filters.storeId || "all"}
            onValueChange={(value) => patch({ storeId: pickSelectValue(value) })}
          >
            <SelectTrigger className="min-h-11 w-full">
              <SelectValue placeholder="همه فروشگاه‌ها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه فروشگاه‌ها</SelectItem>
              {(stores?.data ?? []).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.storeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      <div className="space-y-1.5">
        <Label>نوع موبایل</Label>
        <Select
          value={filters.insuranceType || "all"}
          onValueChange={(value) => patch({ insuranceType: pickSelectValue(value) })}
        >
          <SelectTrigger className="min-h-11 w-full">
            <SelectValue placeholder="همه" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="New">آکبند</SelectItem>
            <SelectItem value="Used">کارکرده</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>وضعیت پرداخت</Label>
        <Select
          value={filters.paymentStatus || "all"}
          onValueChange={(value) => patch({ paymentStatus: pickSelectValue(value) })}
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
      <div className="space-y-1.5">
        <Label>وضعیت بیمه‌نامه</Label>
        <Select
          value={filters.status || "all"}
          onValueChange={(value) => patch({ status: pickSelectValue(value) })}
        >
          <SelectTrigger className="min-h-11 w-full">
            <SelectValue placeholder="همه" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="Issued">صادر شده</SelectItem>
            <SelectItem value="AwaitingPayment">در انتظار پرداخت</SelectItem>
            <SelectItem value="Expired">منقضی‌شده</SelectItem>
            <SelectItem value="Cancelled">لغو شده</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5 md:col-span-2 xl:col-span-4">
        <Label>جستجو</Label>
        <SearchField
          value={filters.search}
          onChange={(search) => patch({ search })}
          placeholder="شماره بیمه‌نامه، فروشگاه، بیمه‌گذار، IMEI..."
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
            if (onReset) {
              onReset();
              return;
            }
            onChange(emptyPolicyFilters);
          }}
        >
          پاک کردن فیلترها
        </Button>
      </div>
    </form>
  );
}
