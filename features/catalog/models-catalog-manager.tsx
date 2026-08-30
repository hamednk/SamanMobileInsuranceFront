"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SearchField } from "@/components/search-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, notifyError } from "@/lib/api";

type Brand = { id: string; name: string; isActive: boolean };
type Model = { id: string; brandId: string; brandName: string; name: string; isActive: boolean; canManage?: boolean };

export function ModelsCatalogManager({
  brandsPath,
  modelsPath,
  queryPrefix,
  restrictManage = false,
}: {
  brandsPath: string;
  modelsPath: string;
  queryPrefix: string;
  restrictManage?: boolean;
}) {
  const client = useQueryClient();
  const [brandId, setBrandId] = useState("");
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Model | null>(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);

  const brands = useQuery({
    queryKey: [`${queryPrefix}-brands`],
    queryFn: () => api.get<Brand[]>(brandsPath),
  });
  const models = useQuery({
    queryKey: [`${queryPrefix}-models`, brandId],
    queryFn: () => api.get<Model[]>(`${modelsPath}${brandId ? `?brandId=${brandId}` : ""}`),
  });
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = models.data ?? [];
    if (!q) return rows;
    return rows.filter(
      (m) => m.name.toLowerCase().includes(q) || m.brandName.toLowerCase().includes(q)
    );
  }, [models.data, search]);

  function invalidateCatalog() {
    client.invalidateQueries({ queryKey: [`${queryPrefix}-models`] });
    client.invalidateQueries({ queryKey: ["models"] });
    client.invalidateQueries({ queryKey: ["brands"] });
    client.invalidateQueries({ queryKey: ["admin-models"] });
  }

  const create = useMutation({
    mutationFn: () => api.post(modelsPath, { brandId, name: name.trim(), isActive: true }),
    onSuccess: () => {
      toast.success("مدل اضافه شد.");
      setName("");
      invalidateCatalog();
    },
    onError: notifyError,
  });

  const update = useMutation({
    mutationFn: () =>
      api.put(`${modelsPath}/${editing!.id}`, {
        name: editName.trim(),
        isActive: editActive,
      }),
    onSuccess: () => {
      toast.success("مدل به‌روزرسانی شد.");
      setEditing(null);
      invalidateCatalog();
    },
    onError: notifyError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.del(`${modelsPath}/${id}`),
    onSuccess: () => {
      toast.success("مدل حذف شد.");
      invalidateCatalog();
    },
    onError: notifyError,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">مدل‌های موبایل</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {restrictManage
            ? "فقط مدل‌هایی که خودتان ثبت کرده‌اید قابل ویرایش یا حذف هستند."
            : "افزودن، ویرایش و حذف مدل‌ها — نام تکراری برای یک برند مجاز نیست"}
        </p>
      </div>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!brandId) {
            toast.error("ابتدا برند را انتخاب کنید.");
            return;
          }
          create.mutate();
        }}
      >
        <select
          className="h-11 rounded-lg border border-input bg-background px-3"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          required
        >
          <option value="">برند (فیلتر / افزودن)</option>
          {(brands.data ?? []).map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام مدل جدید"
          className="max-w-xs min-h-11"
          required
        />
        <Button type="submit" className="min-h-11" disabled={create.isPending}>
          افزودن
        </Button>
      </form>
      <SearchField value={search} onChange={setSearch} placeholder="جستجوی مدل یا برند..." />
      <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>برند</TableHead>
              <TableHead>نام مدل</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead className="w-40">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => {
              const canManage = restrictManage ? Boolean(m.canManage) : true;
              return (
              <TableRow key={m.id}>
                <TableCell>{m.brandName}</TableCell>
                <TableCell>
                  {editing?.id === m.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="min-h-9 max-w-xs"
                    />
                  ) : (
                    m.name
                  )}
                </TableCell>
                <TableCell>
                  {editing?.id === m.id ? (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editActive}
                        onChange={(e) => setEditActive(e.target.checked)}
                      />
                      فعال
                    </label>
                  ) : m.isActive ? (
                    "فعال"
                  ) : (
                    "غیرفعال"
                  )}
                </TableCell>
                <TableCell>
                  {canManage ? (
                  <div className="flex flex-wrap gap-1">
                    {editing?.id === m.id ? (
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
                            setEditing(m);
                            setEditName(m.name);
                            setEditActive(m.isActive);
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
                            if (confirm(`مدل «${m.name}» حذف شود؟`)) remove.mutate(m.id);
                          }}
                        >
                          <Trash2Icon />
                          حذف
                        </Button>
                      </>
                    )}
                  </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">قابل ویرایش نیست</span>
                  )}
                </TableCell>
              </TableRow>
              );
            })}
            {!models.isLoading && filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  مدلی یافت نشد.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
