"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";
import { StoreShell } from "@/components/store-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, notifyError } from "@/lib/api";
import { formatJalali, formatToman, policyStatusLabel, toFaDigits } from "@/lib/format";
import type { Policy, RenewalListItem } from "@/types";
import { cn } from "@/lib/utils";

type Track = "expired" | "renewed";

export default function RenewalsPage() {
  const router = useRouter();
  const client = useQueryClient();
  const [track, setTrack] = useState<Track>("expired");

  const { data, isLoading } = useQuery({
    queryKey: ["renewals", track],
    queryFn: () => api.get<RenewalListItem[]>(`/api/v1/insurance/renewals?track=${track}`),
  });

  const items = data ?? [];

  const renew = useMutation({
    mutationFn: (id: string) => api.post<Policy>(`/api/v1/insurance/${id}/renew`),
    onSuccess: (policy) => {
      toast.success("تمدید با نرخ کارکرده ایجاد شد. به پرداخت منتقل می‌شوید.");
      client.invalidateQueries({ queryKey: ["renewals"] });
      client.invalidateQueries({ queryKey: ["policies"] });
      router.push(`/insurance/${policy.id}/payment`);
    },
    onError: notifyError,
  });

  return (
    <StoreShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">تمدید بیمه‌نامه</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            رصد بیمه‌های منقضی‌شده و تمدیدشده. تمدید فقط پس از تاریخ پایان پوشش و با محاسبه نرخ گوشی کارکرده انجام می‌شود.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "expired" as const, label: "منقضی‌شده" },
              { id: "renewed" as const, label: "تمدید" },
            ] as const
          ).map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant={track === tab.id ? "default" : "outline"}
              className={cn("min-h-11", track === tab.id && "shadow-sm")}
              onClick={() => setTrack(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
        ) : items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>
                {track === "expired" ? "بیمه منقضی‌شده‌ای نیست." : "تمدیدی ثبت نشده است."}
              </EmptyTitle>
              <EmptyDescription>
                {track === "expired"
                  ? "وقتی تاریخ پایان پوشش برسد، اینجا نمایش داده می‌شود."
                  : "پس از ثبت تمدید، در این وضعیت قابل رصد است."}
              </EmptyDescription>
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
                  <TableHead>حق بیمه</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>پایان پوشش</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/insurance/${p.id}`} className="text-primary">
                        {toFaDigits(p.policyNumber ?? "موقت")}
                      </Link>
                    </TableCell>
                    <TableCell>{p.customerName}</TableCell>
                    <TableCell>
                      {p.brandName} {p.modelName}
                      {p.insuranceType === "Used" ? (
                        <span className="ms-1 text-xs text-muted-foreground">(کارکرده)</span>
                      ) : null}
                    </TableCell>
                    <TableCell>{formatToman(p.premiumRial)}</TableCell>
                    <TableCell>
                      <Badge variant={track === "expired" ? "outline" : "secondary"}>
                        {track === "expired" ? "منقضی‌شده" : policyStatusLabel(p.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.endDate ? formatJalali(p.endDate) : "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="outline" className="min-h-10" render={<Link href={`/insurance/${p.id}`} />}>
                          مشاهده
                        </Button>
                        {track === "expired" && p.canRenew ? (
                          <Button
                            size="sm"
                            className="min-h-10"
                            disabled={renew.isPending}
                            onClick={() => {
                              if (confirm(`تمدید بیمه «${p.customerName}» با نرخ کارکرده انجام شود؟`)) {
                                renew.mutate(p.id);
                              }
                            }}
                          >
                            <RefreshCwIcon />
                            تمدید
                          </Button>
                        ) : null}
                        {track === "renewed" && p.status === "AwaitingPayment" ? (
                          <Button size="sm" className="min-h-10" render={<Link href={`/insurance/${p.id}/payment`} />}>
                            پرداخت
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </StoreShell>
  );
}
