"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { DataPagination } from "@/components/data-pagination";
import { SearchField } from "@/components/search-field";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { auditActionLabel, entityLabel, formatJalali, toFaDigits } from "@/lib/format";

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data } = useQuery({
    queryKey: ["audit", search, page],
    queryFn: () =>
      api.getPaged<{ id: string; action: string; entityName: string; entityId?: string; ipAddress?: string; createdAt: string }[]>(
        `/api/v1/admin/audit-logs?page=${page}&pageSize=20&search=${encodeURIComponent(search)}`
      ),
  });
  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">سوابق سیستم</h1>
        <SearchField
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="جستجو عملیات، موجودیت، IP..."
        />
        <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>عملیات</TableHead>
                <TableHead>موجودیت</TableHead>
                <TableHead>شناسه</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>زمان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{auditActionLabel(a.action)}</TableCell>
                  <TableCell>{entityLabel(a.entityName)}</TableCell>
                  <TableCell className="font-mono text-xs">{a.entityId ? toFaDigits(a.entityId) : "—"}</TableCell>
                  <TableCell>{a.ipAddress ? toFaDigits(a.ipAddress) : "—"}</TableCell>
                  <TableCell>{formatJalali(a.createdAt)}</TableCell>
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
