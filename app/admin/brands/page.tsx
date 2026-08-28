"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { SearchField } from "@/components/search-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, notifyError } from "@/lib/api";

type Item = { id: string; name: string; isActive: boolean };

export default function AdminBrandsPage() {
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Item | null>(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: () => api.get<Item[]>("/api/v1/admin/brands"),
  });
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = data ?? [];
    if (!q) return rows;
    return rows.filter((b) => b.name.toLowerCase().includes(q));
  }, [data, search]);

  const create = useMutation({
    mutationFn: () => api.post("/api/v1/admin/brands", { name: name.trim(), isActive: true }),
    onSuccess: () => {
      toast.success("برند اضافه شد.");
      setName("");
      client.invalidateQueries({ queryKey: ["admin-brands"] });
    },
    onError: notifyError,
  });

  const update = useMutation({
    mutationFn: () =>
      api.put(`/api/v1/admin/brands/${editing!.id}`, {
        name: editName.trim(),
        isActive: editActive,
      }),
    onSuccess: () => {
      toast.success("برند به‌روزرسانی شد.");
      setEditing(null);
      client.invalidateQueries({ queryKey: ["admin-brands"] });
      client.invalidateQueries({ queryKey: ["admin-models"] });
    },
    onError: notifyError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/api/v1/admin/brands/${id}`),
    onSuccess: () => {
      toast.success("برند حذف شد.");
      client.invalidateQueries({ queryKey: ["admin-brands"] });
      client.invalidateQueries({ queryKey: ["admin-models"] });
    },
    onError: notifyError,
  });

  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold">برندها</h1>
          <p className="mt-1 text-sm text-muted-foreground">افزودن، ویرایش و حذف — نام تکراری مجاز نیست</p>
        </div>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام برند"
            className="max-w-xs min-h-11"
            required
          />
          <Button type="submit" className="min-h-11" disabled={create.isPending}>
            افزودن
          </Button>
        </form>
        <SearchField value={search} onChange={setSearch} placeholder="جستجوی برند..." />
        <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="w-40">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    {editing?.id === b.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="min-h-9 max-w-xs"
                      />
                    ) : (
                      b.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editing?.id === b.id ? (
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={editActive}
                          onChange={(e) => setEditActive(e.target.checked)}
                        />
                        فعال
                      </label>
                    ) : b.isActive ? (
                      "فعال"
                    ) : (
                      "غیرفعال"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {editing?.id === b.id ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            disabled={update.isPending || !editName.trim()}
                            onClick={() => update.mutate()}
                          >
                            ذخیره
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(null)}>
                            انصراف
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditing(b);
                              setEditName(b.name);
                              setEditActive(b.isActive);
                            }}
                          >
                            <PencilIcon />
                            ویرایش
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={remove.isPending}
                            onClick={() => {
                              if (confirm(`برند «${b.name}» حذف شود؟`)) remove.mutate(b.id);
                            }}
                          >
                            <Trash2Icon />
                            حذف
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    برندی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminShell>
  );
}
