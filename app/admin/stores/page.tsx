"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { SearchField } from "@/components/search-field";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatJalali, toFaDigits } from "@/lib/format";

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

export default function AdminStoresPage() {
  const [search, setSearch] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-stores", search],
    queryFn: () => api.getPaged<StoreRow[]>(`/api/v1/admin/stores?page=1&pageSize=20&search=${encodeURIComponent(search)}`),
  });
  const items = data?.data ?? [];

  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">فروشگاه‌ها</h1>
        <SearchField value={search} onChange={setSearch} placeholder="جستجوی نام فروشگاه، مدیر، موبایل..." />
        {items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>موردی یافت نشد.</EmptyTitle>
              <EmptyDescription>فروشگاهی مطابق فیلتر وجود ندارد.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
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
                      <Badge variant={s.isActive ? "secondary" : "destructive"}>{s.isActive ? "فعال" : "غیرفعال"}</Badge>
                    </TableCell>
                    <TableCell>{formatJalali(s.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
