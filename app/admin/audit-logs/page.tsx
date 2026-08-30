"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { DataPagination } from "@/components/data-pagination";
import { SearchField } from "@/components/search-field";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { auditActionLabel, entityLabel, formatJalaliDateTime, roleLabel, toFaDigits } from "@/lib/format";

type AuditRow = {
  id: string;
  username?: string | null;
  role?: string | null;
  actorName?: string | null;
  storeName?: string | null;
  action: string;
  entityName: string;
  entityId?: string;
  ipAddress?: string;
  createdAt: string;
};

function actorLabel(row: AuditRow) {
  const name = row.actorName?.trim();
  if (name) return name;
  if (row.username) return row.username;
  return "سیستم";
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data } = useQuery({
    queryKey: ["audit", search, page],
    queryFn: () =>
      api.getPaged<AuditRow[]>(
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
          placeholder="جستجو کاربر، فروشگاه، عملیات..."
        />
        <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کاربر</TableHead>
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
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{actorLabel(a)}</span>
                      <span className="text-xs text-muted-foreground">
                        {a.role ? roleLabel(a.role) : ""}
                        {a.storeName ? ` · ${a.storeName}` : ""}
                        {a.username && a.actorName && a.username !== a.actorName ? ` · ${a.username}` : ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{auditActionLabel(a.action)}</TableCell>
                  <TableCell>{entityLabel(a.entityName)}</TableCell>
                  <TableCell className="font-mono text-xs">{a.entityId ? toFaDigits(a.entityId) : "—"}</TableCell>
                  <TableCell>{a.ipAddress ? toFaDigits(a.ipAddress) : "—"}</TableCell>
                  <TableCell>{formatJalaliDateTime(a.createdAt)}</TableCell>
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
