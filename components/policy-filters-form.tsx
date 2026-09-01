"use client";

import { useQuery } from "@tanstack/react-query";
import { FilterSelect } from "@/components/filter-select";
import { JalaliDatePicker } from "@/components/jalali-date-picker";
import { SearchField } from "@/components/search-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  showLocationFilters?: boolean;
};

type StoreOption = { id: string; storeName: string };

export function PolicyFiltersForm({
  filters,
  onChange,
  onApply,
  onReset,
  showStoreFilter = true,
  showLocationFilters = true,
}: PolicyFiltersProps) {
  const { data: provinces = [] } = useQuery({
    queryKey: ["admin-provinces"],
    queryFn: () => api.get<LookupItem[]>("/api/v1/admin/provinces"),
    enabled: showLocationFilters,
  });
  const { data: cities = [] } = useQuery({
    queryKey: ["admin-cities", filters.provinceId],
    queryFn: () =>
      api.get<LookupItem[]>(
        filters.provinceId
          ? `/api/v1/admin/cities?provinceId=${filters.provinceId}`
          : "/api/v1/admin/cities"
      ),
    enabled: showLocationFilters && Boolean(filters.provinceId),
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
      {showLocationFilters ? (
        <>
          <div className="space-y-1.5">
            <Label>استان</Label>
            <FilterSelect
              value={filters.provinceId}
              onChange={(provinceId) => patch({ provinceId, cityId: "", storeId: "" })}
              allLabel="همه"
              options={provinces.map((p) => ({ value: p.id, label: p.name }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>شهر</Label>
            <FilterSelect
              value={filters.cityId}
              onChange={(cityId) => patch({ cityId })}
              allLabel="همه"
              disabled={!filters.provinceId}
              options={cities.map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>
        </>
      ) : null}
      {showStoreFilter ? (
        <div className="space-y-1.5 md:col-span-2">
          <Label>فروشگاه</Label>
          <FilterSelect
            value={filters.storeId}
            onChange={(storeId) => patch({ storeId })}
            allLabel="همه"
            options={(stores?.data ?? []).map((s) => ({ value: s.id, label: s.storeName }))}
          />
        </div>
      ) : null}
      <div className="space-y-1.5">
        <Label>نوع موبایل</Label>
        <FilterSelect
          value={filters.insuranceType}
          onChange={(insuranceType) => patch({ insuranceType })}
          options={[
            { value: "New", label: "آکبند" },
            { value: "Used", label: "کارکرده" },
          ]}
        />
      </div>
      <div className="space-y-1.5">
        <Label>وضعیت پرداخت</Label>
        <FilterSelect
          value={filters.paymentStatus}
          onChange={(paymentStatus) => patch({ paymentStatus })}
          options={[
            { value: "Paid", label: "موفق" },
            { value: "Pending", label: "در انتظار" },
            { value: "Failed", label: "ناموفق" },
          ]}
        />
      </div>
      <div className="space-y-1.5">
        <Label>وضعیت بیمه‌نامه</Label>
        <FilterSelect
          value={filters.status}
          onChange={(status) => patch({ status })}
          options={[
            { value: "Issued", label: "صادر شده" },
            { value: "Paid", label: "در انتظار صدور" },
            { value: "AwaitingPayment", label: "در انتظار پرداخت" },
            { value: "Expired", label: "منقضی‌شده" },
            { value: "Cancelled", label: "لغو شده" },
          ]}
        />
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
