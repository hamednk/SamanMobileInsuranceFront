"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { DataPagination } from "@/components/data-pagination";
import { SearchField } from "@/components/search-field";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatJalali, toFaDigits } from "@/lib/format";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data } = useQuery({
    queryKey: ["admin-customers", search, page],
    queryFn: () =>
      api.getPaged<{ id: string; firstName: string; lastName: string; nationalCode: string; mobile: string; createdAt: string }[]>(
        `/api/v1/admin/customers?page=${page}&pageSize=20&search=${encodeURIComponent(search)}`
      ),
  });
  const items = data?.data ?? [];
  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">مشتریان</h1>
        <SearchField
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="جستجو نام، کد ملی، موبایل..."
        />
        {items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>موردی یافت نشد.</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام</TableHead>
                    <TableHead>کد ملی</TableHead>
                    <TableHead>موبایل</TableHead>
                    <TableHead>ثبت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        {c.firstName} {c.lastName}
                      </TableCell>
                      <TableCell>{toFaDigits(c.nationalCode)}</TableCell>
                      <TableCell>{toFaDigits(c.mobile)}</TableCell>
                      <TableCell>{formatJalali(c.createdAt)}</TableCell>
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
