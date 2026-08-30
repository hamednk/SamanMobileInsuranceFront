"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeftIcon, CircleAlertIcon, FileSpreadsheetIcon } from "lucide-react";
import {
  buildPolicyQuery,
  emptyPolicyFilters,
  PolicyFiltersForm,
  type PolicyFilterValues,
} from "@/components/policy-filters-form";
import { StoreShell } from "@/components/store-shell";
import { DataPagination } from "@/components/data-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PolicyImagesButton } from "@/features/insurance/policy-images-dialog";
import { api, notifyError } from "@/lib/api";
import { formatJalali, formatToman, statusLabel, toFaDigits } from "@/lib/format";
import {
  getPolicyContinueHint,
  getPolicyContinueHref,
  getPolicyContinueLabel,
  isIncompletePolicy,
} from "@/lib/policy-flow";
import type { PolicyListItem } from "@/types";

export default function PoliciesPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PolicyFilterValues>(emptyPolicyFilters);
  const [appliedFilters, setAppliedFilters] = useState<PolicyFilterValues>(emptyPolicyFilters);

  const { data } = useQuery({
    queryKey: ["policies", appliedFilters, page],
    queryFn: () =>
      api.getPaged<PolicyListItem[]>(`/api/v1/insurance/mine?${buildPolicyQuery(appliedFilters, page).toString()}`),
  });

  const items = useMemo(() => data?.data ?? [], [data]);
  const incomplete = useMemo(() => items.filter((p) => isIncompletePolicy(p.status)), [items]);

  async function exportExcel() {
    try {
      const qs = buildPolicyQuery(appliedFilters, 1).toString();
      await api.download(`/api/v1/insurance/mine/export?${qs}`, "store-policies.xlsx");
    } catch (error) {
      notifyError(error);
    }
  }

  return (
    <StoreShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">بیمه‌های من</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              لیست بیمه‌نامه‌ها و موارد ناقص. تمدیدها در بخش{" "}
              <Link href="/renewals" className="text-primary underline-offset-4 hover:underline">
                تمدید
              </Link>{" "}
              رصد می‌شوند.
            </p>
          </div>
          <Button className="min-h-11 shrink-0" onClick={exportExcel}>
            <FileSpreadsheetIcon className="size-4" />
            خروجی اکسل
          </Button>
        </div>

        {incomplete.length > 0 ? (
          <section className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-transparent p-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <CircleAlertIcon className="size-5 shrink-0" />
              <h2 className="font-semibold">در انتظار تکمیل ({toFaDigits(incomplete.length)})</h2>
            </div>
            <div className="flex flex-col gap-2">
              {incomplete.map((p) => {
                const href = getPolicyContinueHref(p.id, p.status);
                return (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-background/80 px-3 py-3"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{p.customerName}</span>
                        <Badge variant="secondary">{statusLabel(p.status)}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.brandName} {p.modelName} · {toFaDigits(p.policyNumber ?? "شماره موقت")} ·{" "}
                        {getPolicyContinueHint(p.status)}
                      </p>
                    </div>
                    {href ? (
                      <Button className="min-h-11 shrink-0" render={<Link href={href} />}>
                        {getPolicyContinueLabel(p.status)}
                        <ArrowLeftIcon data-icon="inline-end" className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

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
          showStoreFilter={false}
          showLocationFilters={false}
        />

        {items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>موردی یافت نشد.</EmptyTitle>
              <EmptyDescription>هنوز بیمه‌نامه‌ای ثبت نشده است.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره</TableHead>
                    <TableHead>بیمه‌گذار</TableHead>
                    <TableHead>موبایل</TableHead>
                    <TableHead>سهم شرکت</TableHead>
                    <TableHead>دریافتی از مشتری</TableHead>
                    <TableHead>سود فروشگاه</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((p) => {
                    const href = getPolicyContinueHref(p.id, p.status);
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Link href={`/insurance/${p.id}`} className="text-primary">
                            {toFaDigits(p.policyNumber ?? "موقت")}
                          </Link>
                        </TableCell>
                        <TableCell>{p.customerName}</TableCell>
                        <TableCell>
                          {p.brandName} {p.modelName}
                        </TableCell>
                        <TableCell>{formatToman(p.premiumRial)}</TableCell>
                        <TableCell>{formatToman(p.customerChargedRial)}</TableCell>
                        <TableCell className="font-medium text-primary">{formatToman(p.storeProfitRial)}</TableCell>
                        <TableCell>
                          <Badge variant={isIncompletePolicy(p.status) ? "outline" : "secondary"}>
                            {statusLabel(p.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatJalali(p.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <PolicyImagesButton policyId={p.id} scope="store" />
                            {href ? (
                              <Button size="sm" className="min-h-10" render={<Link href={href} />}>
                                {getPolicyContinueLabel(p.status)}
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="min-h-10" render={<Link href={`/insurance/${p.id}`} />}>
                                مشاهده
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <DataPagination pagination={data?.pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </StoreShell>
  );
}
