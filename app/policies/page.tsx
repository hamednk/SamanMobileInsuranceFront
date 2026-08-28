"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeftIcon, CircleAlertIcon } from "lucide-react";
import { SearchField } from "@/components/search-field";
import { StoreShell } from "@/components/store-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatJalali, formatToman, statusLabel, toFaDigits } from "@/lib/format";
import {
  getPolicyContinueHint,
  getPolicyContinueHref,
  getPolicyContinueLabel,
  isIncompletePolicy,
} from "@/lib/policy-flow";
import type { PolicyListItem } from "@/types";

export default function PoliciesPage() {
  const [search, setSearch] = useState("");
  const { data } = useQuery({
    queryKey: ["policies", search],
    queryFn: () =>
      api.getPaged<PolicyListItem[]>(`/api/v1/insurance/mine?page=1&pageSize=50&search=${encodeURIComponent(search)}`),
  });

  const items = data?.data ?? [];
  const incomplete = useMemo(() => items.filter((p) => isIncompletePolicy(p.status)), [items]);

  return (
    <StoreShell>
      <div className="flex flex-col gap-6">
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

        <SearchField value={search} onChange={setSearch} placeholder="جستجو بر اساس نام، کد ملی، IMEI یا شماره بیمه‌نامه" />

        {items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>موردی یافت نشد.</EmptyTitle>
              <EmptyDescription>هنوز بیمه‌نامه‌ای ثبت نشده است.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>شماره</TableHead>
                  <TableHead>بیمه‌گذار</TableHead>
                  <TableHead>موبایل</TableHead>
                  <TableHead>مبلغ</TableHead>
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
                      <TableCell>
                        <Badge variant={isIncompletePolicy(p.status) ? "outline" : "secondary"}>
                          {statusLabel(p.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatJalali(p.createdAt)}</TableCell>
                      <TableCell>
                        {href ? (
                          <Button size="sm" className="min-h-10" render={<Link href={href} />}>
                            {getPolicyContinueLabel(p.status)}
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="min-h-10" render={<Link href={`/insurance/${p.id}`} />}>
                            مشاهده
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </StoreShell>
  );
}
