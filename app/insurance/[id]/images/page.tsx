"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { StoreShell } from "@/components/store-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CameraCapture } from "@/features/insurance/camera-capture";
import { WizardStepper } from "@/features/insurance/stepper";
import { api, API_URL, notifyError } from "@/lib/api";
import { toFaDigits } from "@/lib/format";
import { getAccessToken } from "@/lib/session";
import type { Policy } from "@/types";

export default function ImagesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [previews, setPreviews] = useState<{ Front?: string; Back?: string }>({});

  const { data, refetch } = useQuery({
    queryKey: ["policy", params.id],
    queryFn: () => api.get<Policy>(`/api/v1/insurance/${params.id}`),
  });

  async function upload(type: "Front" | "Back", file: File) {
    const form = new FormData();
    form.append("imageType", type);
    form.append("file", file);
    try {
      const updated = await api.upload<Policy>(`/api/v1/insurance/${params.id}/images`, form);
      setPreviews((p) => ({ ...p, [type]: URL.createObjectURL(file) }));
      toast.success(type === "Front" ? "تصویر روی گوشی ثبت شد." : "تصویر پشت گوشی ثبت شد.");
      await refetch();
      return updated;
    } catch (error) {
      notifyError(error);
      throw error;
    }
  }

  const hasFront = Boolean(data?.images.some((i) => i.imageType === "Front") || previews.Front);
  const hasBack = Boolean(data?.images.some((i) => i.imageType === "Back") || previews.Back);
  const token = getAccessToken();

  return (
    <StoreShell>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <WizardStepper current={2} />
        <Alert>
          <AlertTitle>سریال ثبت‌شده</AlertTitle>
          <AlertDescription>
            سریال ۱: {toFaDigits(data?.imei1 ?? "—")} {data?.imei2 ? ` | سریال ۲: ${toFaDigits(data.imei2)}` : ""}
            <br />
            <span className="text-xs text-red-500">
              هنگام عکس‌برداری، سریال گوشی باید خوانا باشد.
            </span>
          </AlertDescription>
        </Alert>
        <CameraCapture
          label="تصویر روی گوشی"
          previewUrl={
            previews.Front ??
            (data?.images.find((i) => i.imageType === "Front")
              ? `${API_URL}/api/v1/insurance/${params.id}/images/${data.images.find((i) => i.imageType === "Front")?.id}?access_token=${token}`
              : null)
          }
          onCapture={async (file) => {
            await upload("Front", file);
          }}
        />
        <CameraCapture
          label="تصویر پشت گوشی"
          warning="لطفاً تصویر پشت گوشی را بدون قاب و کیف تهیه کنید."
          previewUrl={previews.Back ?? null}
          onCapture={async (file) => {
            await upload("Back", file);
          }}
        />
        <Button
          className="min-h-11"
          disabled={!hasFront || !hasBack}
          onClick={() => router.push(`/insurance/${params.id}/payment`)}
        >
          ادامه و پرداخت
        </Button>
      </div>
    </StoreShell>
  );
}
