"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GiftIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { JalaliDatePicker } from "@/components/jalali-date-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, notifyError } from "@/lib/api";
import { formatJalali, toFaDigits } from "@/lib/format";

type Festival = {
  id: string;
  title: string;
  description: string;
  requiredIssuedCount: number;
  rewardText: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
};

type FestivalProgress = {
  storeId: string;
  storeName: string;
  managerName: string;
  mobile: string;
  issuedCount: number;
  requiredIssuedCount: number;
  targetReached: boolean;
  rewardText: string;
};

const emptyForm = {
  title: "",
  description: "",
  requiredIssuedCount: "10",
  rewardText: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

export default function AdminFestivalsPage() {
  const client = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [progressFestivalId, setProgressFestivalId] = useState<string | null>(null);
  const [onlyWinners, setOnlyWinners] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-festivals"],
    queryFn: () => api.get<Festival[]>("/api/v1/admin/festivals"),
  });

  const progress = useQuery({
    queryKey: ["admin-festival-progress", progressFestivalId, onlyWinners],
    queryFn: () =>
      api.get<FestivalProgress[]>(
        `/api/v1/admin/festivals/${progressFestivalId}/progress?onlyTargetReached=${onlyWinners}`
      ),
    enabled: Boolean(progressFestivalId),
  });

  const selectedFestival = (data ?? []).find((f) => f.id === progressFestivalId) ?? null;

  const save = useMutation({
    mutationFn: () => {
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        requiredIssuedCount: Number(form.requiredIssuedCount),
        rewardText: form.rewardText.trim(),
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt + "T23:59:59").toISOString(),
        isActive: form.isActive,
      };
      return editingId
        ? api.put(`/api/v1/admin/festivals/${editingId}`, body)
        : api.post("/api/v1/admin/festivals", body);
    },
    onSuccess: () => {
      toast.success(editingId ? "جشنواره به‌روزرسانی شد." : "جشنواره ثبت شد.");
      const keepProgressId = editingId ?? progressFestivalId;
      setForm(emptyForm);
      setEditingId(null);
      client.invalidateQueries({ queryKey: ["admin-festivals"] });
      client.invalidateQueries({ queryKey: ["admin-festival-progress"] });
      client.invalidateQueries({ queryKey: ["store-festival"] });
      if (keepProgressId) {
        setProgressFestivalId(keepProgressId);
      }
    },
    onError: notifyError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/api/v1/admin/festivals/${id}`),
    onSuccess: () => {
      toast.success("جشنواره حذف شد.");
      if (progressFestivalId) setProgressFestivalId(null);
      client.invalidateQueries({ queryKey: ["admin-festivals"] });
      client.invalidateQueries({ queryKey: ["admin-festival-progress"] });
      client.invalidateQueries({ queryKey: ["store-festival"] });
    },
    onError: notifyError,
  });

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">جشنواره‌ها</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            هدف فروش تعریف کنید و ببینید کدام فروشگاه‌ها به تارگت رسیده‌اند تا پاداش تعلق بگیرد.
          </p>
        </div>

        <form
          className="grid gap-3 rounded-2xl border border-primary/15 bg-card/80 p-4 shadow-sm md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.startsAt || !form.endsAt) {
              toast.error("بازه تاریخ جشنواره را مشخص کنید.");
              return;
            }
            save.mutate();
          }}
        >
          <Input
            className="min-h-11 md:col-span-2"
            placeholder="عنوان جشنواره"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <Input
            className="min-h-11 md:col-span-2"
            placeholder="توضیحات"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
          />
          <Input
            className="min-h-11"
            type="number"
            min={1}
            placeholder="تعداد بیمه‌نامه هدف"
            value={form.requiredIssuedCount}
            onChange={(e) => setForm((f) => ({ ...f, requiredIssuedCount: e.target.value }))}
            required
          />
          <Input
            className="min-h-11"
            placeholder="پاداش (مثلاً یک بیمه آتش‌سوزی رایگان)"
            value={form.rewardText}
            onChange={(e) => setForm((f) => ({ ...f, rewardText: e.target.value }))}
            required
          />
          <JalaliDatePicker
            value={form.startsAt}
            onChange={(v) => setForm((f) => ({ ...f, startsAt: v }))}
            placeholder="از تاریخ"
          />
          <JalaliDatePicker
            value={form.endsAt}
            onChange={(v) => setForm((f) => ({ ...f, endsAt: v }))}
            placeholder="تا تاریخ"
          />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            فعال
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="submit" className="min-h-11" disabled={save.isPending}>
              {editingId ? "ذخیره تغییرات" : "ثبت جشنواره"}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                انصراف
              </Button>
            ) : null}
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>عنوان</TableHead>
                <TableHead>هدف</TableHead>
                <TableHead>پاداش</TableHead>
                <TableHead>بازه</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <div className="font-medium">{f.title}</div>
                    <div className="text-xs text-muted-foreground">{f.description}</div>
                  </TableCell>
                  <TableCell>{toFaDigits(f.requiredIssuedCount)} بیمه</TableCell>
                  <TableCell>{f.rewardText}</TableCell>
                  <TableCell className="text-xs">
                    {formatJalali(f.startsAt)} تا {formatJalali(f.endsAt)}
                  </TableCell>
                  <TableCell>{f.isActive ? "فعال" : "غیرفعال"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" onClick={() => setProgressFestivalId(f.id)}>
                        <GiftIcon />
                        تارگت‌زن‌ها
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(f.id);
                          setForm({
                            title: f.title,
                            description: f.description,
                            requiredIssuedCount: String(f.requiredIssuedCount),
                            rewardText: f.rewardText,
                            startsAt: f.startsAt.slice(0, 10),
                            endsAt: f.endsAt.slice(0, 10),
                            isActive: f.isActive,
                          });
                        }}
                      >
                        <PencilIcon />
                        ویرایش
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm(`جشنواره «${f.title}» حذف شود؟`)) remove.mutate(f.id);
                        }}
                      >
                        <Trash2Icon />
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (data?.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    جشنواره‌ای ثبت نشده است.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        {progressFestivalId && selectedFestival ? (
          <section className="flex flex-col gap-3 rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-background to-transparent p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">پیشرفت فروشگاه‌ها — {selectedFestival.title}</h2>
                <p className="text-sm text-muted-foreground">
                  هدف: {toFaDigits(selectedFestival.requiredIssuedCount)} صدور · پاداش: {selectedFestival.rewardText}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={onlyWinners}
                    onChange={(e) => setOnlyWinners(e.target.checked)}
                  />
                  فقط کسانی که تارگت زده‌اند
                </label>
                <Button type="button" variant="outline" className="min-h-10" onClick={() => setProgressFestivalId(null)}>
                  بستن
                </Button>
              </div>
            </div>

            {(progress.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">
                {onlyWinners ? "هنوز فروشگاهی به تارگت نرسیده است." : "فروشگاه فعالی یافت نشد."}
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border bg-background/80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>فروشگاه</TableHead>
                      <TableHead>مدیر</TableHead>
                      <TableHead>موبایل</TableHead>
                      <TableHead>پیشرفت</TableHead>
                      <TableHead>وضعیت پاداش</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(progress.data ?? []).map((row) => (
                      <TableRow key={row.storeId}>
                        <TableCell className="font-medium">{row.storeName}</TableCell>
                        <TableCell>{row.managerName}</TableCell>
                        <TableCell dir="ltr">{toFaDigits(row.mobile)}</TableCell>
                        <TableCell>
                          {toFaDigits(row.issuedCount)} / {toFaDigits(row.requiredIssuedCount)}
                        </TableCell>
                        <TableCell>
                          {row.targetReached ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">مشمول پاداش</Badge>
                          ) : (
                            <Badge variant="outline">در حال پیشرفت</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </AdminShell>
  );
}
