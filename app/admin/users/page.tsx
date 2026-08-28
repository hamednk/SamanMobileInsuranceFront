"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRoundIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { SearchField } from "@/components/search-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, notifyError } from "@/lib/api";
import { formatJalali, roleLabel } from "@/lib/format";

type UserRow = { id: string; username: string; role: string; isActive: boolean; createdAt: string };

export default function AdminUsersPage() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () =>
      api.getPaged<UserRow[]>(`/api/v1/admin/users?page=1&pageSize=20&search=${encodeURIComponent(search)}`),
  });

  const setPasswordMutation = useMutation({
    mutationFn: () =>
      api.put(`/api/v1/admin/users/${selected!.id}/password`, {
        newPassword: password,
        confirmPassword: confirm,
      }),
    onSuccess: () => {
      toast.success("رمز عبور کاربر به‌روزرسانی شد.");
      setSelected(null);
      setPassword("");
      setConfirm("");
      client.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: notifyError,
  });

  return (
    <AdminShell>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold">کاربران</h1>
          <p className="mt-1 text-sm text-muted-foreground">مدیریت کاربران و تغییر رمز عبور</p>
        </div>
        <SearchField value={search} onChange={setSearch} placeholder="جستجو نام کاربری یا نقش..." />
        <div className="overflow-x-auto rounded-xl border border-primary/10 bg-card/80 shadow-sm backdrop-blur">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام کاربری</TableHead>
                <TableHead>نقش</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>ثبت</TableHead>
                <TableHead className="w-40">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{roleLabel(u.role)}</TableCell>
                  <TableCell>{u.isActive ? "فعال" : "غیرفعال"}</TableCell>
                  <TableCell>{formatJalali(u.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelected(u);
                        setPassword("");
                        setConfirm("");
                      }}
                    >
                      <KeyRoundIcon />
                      تغییر پسورد
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setPassword("");
            setConfirm("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تغییر رمز عبور</DialogTitle>
            <DialogDescription>
              رمز جدید برای کاربر «{selected?.username}» را وارد کنید.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (password !== confirm) {
                toast.error("تکرار رمز عبور مطابقت ندارد.");
                return;
              }
              setPasswordMutation.mutate();
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="admin-new-password">رمز عبور جدید</FieldLabel>
                <Input
                  id="admin-new-password"
                  type="password"
                  required
                  minLength={8}
                  className="min-h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <FieldDescription>حداقل ۸ کاراکتر</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="admin-confirm-password">تکرار رمز عبور</FieldLabel>
                <Input
                  id="admin-confirm-password"
                  type="password"
                  required
                  minLength={8}
                  className="min-h-11"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelected(null)}
                disabled={setPasswordMutation.isPending}
              >
                انصراف
              </Button>
              <Button type="submit" disabled={setPasswordMutation.isPending || password.length < 8}>
                ذخیره رمز
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
