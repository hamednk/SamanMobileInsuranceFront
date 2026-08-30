"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, notifyError } from "@/lib/api";
import { toFaDigits } from "@/lib/format";
import type { StoreProfile } from "@/types";

export default function AdminStoreDetailPage() {
  const params = useParams<{ id: string }>();
  const client = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-store", params.id],
    queryFn: () => api.get<StoreProfile>(`/api/v1/admin/stores/${params.id}`),
  });
  const toggle = useMutation({
    mutationFn: (isActive: boolean) => api.post(`/api/v1/admin/stores/${params.id}/active?isActive=${isActive}`),
    onSuccess: () => {
      toast.success("وضعیت فروشگاه به‌روز شد.");
      client.invalidateQueries({ queryKey: ["admin-store", params.id] });
      client.invalidateQueries({ queryKey: ["admin-stores"] });
    },
    onError: notifyError,
  });

  if (!data) {
    return (
      <AdminShell>
        <p>در حال بارگذاری...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{data.storeName}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>مدیر: {data.managerFirstName} {data.managerLastName}</p>
          <p>کد ملی: {toFaDigits(data.nationalCode)}</p>
          <p>موبایل: {toFaDigits(data.mobile1)}</p>
          <p>نام کاربری: {data.username}</p>
          <p>استان / شهر: {data.provinceName} / {data.cityName}</p>
          <p>آدرس: {data.address}</p>
          <p>وضعیت: {data.isActive ? "فعال" : "غیرفعال"}</p>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant={data.isActive ? "destructive" : "default"} className="mt-4 w-fit min-h-11" />}>
              {data.isActive ? "غیرفعال کردن فروشگاه" : "فعال کردن فروشگاه"}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>تأیید عملیات</AlertDialogTitle>
                <AlertDialogDescription>
                  {data.isActive
                    ? "فروشگاه غیرفعال دیگر نمی‌تواند بیمه جدید ثبت کند. سوابق قبلی حفظ می‌شود."
                    : "فروشگاه دوباره فعال می‌شود."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={toggle.isPending}>انصراف</AlertDialogCancel>
                <AlertDialogAction disabled={toggle.isPending} onClick={() => toggle.mutate(!data.isActive)}>
                  {toggle.isPending ? "در حال ذخیره..." : "تأیید"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
