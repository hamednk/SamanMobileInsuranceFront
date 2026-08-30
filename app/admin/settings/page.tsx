"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { SearchField } from "@/components/search-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, notifyError } from "@/lib/api";

type Setting = { key: string; value: string; description?: string };

export default function AdminSettingsPage() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => api.get<Setting[]>("/api/v1/admin/settings") });
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = data ?? [];
    if (!q) return rows.filter((s) => s.key !== "StoreCommissionPercent");
    return rows.filter(
      (s) =>
        s.key !== "StoreCommissionPercent" &&
        [s.key, s.value, s.description].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data, search]);
  const update = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => api.put(`/api/v1/admin/settings/${key}`, { value }),
    onSuccess: () => {
      toast.success("تنظیمات ذخیره شد.");
      client.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: notifyError,
  });

  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">تنظیمات</h1>
        <SearchField value={search} onChange={setSearch} placeholder="جستجوی کلید یا توضیح..." />
        <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کلید</TableHead>
                <TableHead>مقدار</TableHead>
                <TableHead>توضیح</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.key}>
                  <TableCell className="font-mono text-xs">{s.key}</TableCell>
                  <TableCell>
                    <Input defaultValue={s.value} className="min-h-11" id={`s-${s.key}`} />
                  </TableCell>
                  <TableCell>{s.description}</TableCell>
                  <TableCell>
                    <Button
                      className="min-h-11"
                      onClick={() => {
                        const el = document.getElementById(`s-${s.key}`) as HTMLInputElement | null;
                        if (el) update.mutate({ key: s.key, value: el.value });
                      }}
                    >
                      ذخیره
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminShell>
  );
}
