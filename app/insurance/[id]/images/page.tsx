"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { StoreShell } from "@/components/store-shell";
import { Button } from "@/components/ui/button";
import { CameraCapture } from "@/features/insurance/camera-capture";
import { WizardStepper } from "@/features/insurance/stepper";
import { api, notifyError } from "@/lib/api";
import { policyImageApiPath } from "@/lib/policy-images";
import { toFaDigits } from "@/lib/format";
import type { Policy } from "@/types";

function useImagePreview(policyId: string, imageId?: string) {
  const { data: blob } = useQuery({
    queryKey: ["policy-image-preview", policyId, imageId],
    queryFn: () => api.blob(policyImageApiPath(policyId, imageId!, "store")),
    enabled: Boolean(policyId && imageId),
    staleTime: 60_000,
  });

  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  return url;
}

export default function ImagesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [localPreviews, setLocalPreviews] = useState<{ Front?: string; Back?: string }>({});

  const { data, refetch } = useQuery({
    queryKey: ["policy", params.id],
    queryFn: () => api.get<Policy>(`/api/v1/insurance/${params.id}`),
  });

  const frontImage = data?.images.find((i) => i.imageType === "Front");
  const backImage = data?.images.find((i) => i.imageType === "Back");
  const frontPreviewFromApi = useImagePreview(params.id, frontImage?.id);
  const backPreviewFromApi = useImagePreview(params.id, backImage?.id);

  async function upload(type: "Front" | "Back", file: File) {
    const form = new FormData();
    form.append("imageType", type);
    form.append("file", file);
    try {
      await api.upload<Policy>(`/api/v1/insurance/${params.id}/images`, form);
      setLocalPreviews((p) => ({ ...p, [type]: URL.createObjectURL(file) }));
      toast.success(type === "Front" ? "تصویر روی گوشی ثبت شد." : "تصویر پشت گوشی ثبت شد.");
      await refetch();
    } catch (error) {
      notifyError(error);
      throw error;
    }
  }

  const hasFront = Boolean(frontImage || localPreviews.Front);
  const hasBack = Boolean(backImage || localPreviews.Back);

  return (
    <StoreShell>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <WizardStepper current={2} />
        <div className="rounded-xl border p-4">
          <h3 className="font-medium">سریال ثبت‌شده</h3>
          <div className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            سریال ۱: {toFaDigits(data?.imei1 ?? "—")} {data?.imei2 ? ` | سریال ۲: ${toFaDigits(data.imei2)}` : ""}
            <br />
            <span className="text-xs">
              هنگام عکس‌برداری، سریال گوشی باید خوانا باشد.
            </span>
          </div>
        </div>
        <CameraCapture
          label="تصویر روی گوشی"
          previewUrl={localPreviews.Front ?? frontPreviewFromApi}
          onCapture={async (file) => {
            await upload("Front", file);
          }}
        />
        <CameraCapture
          label="تصویر پشت گوشی"
          warning="لطفاً تصویر پشت گوشی را بدون قاب و کیف تهیه کنید."
          previewUrl={localPreviews.Back ?? backPreviewFromApi}
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
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => router.push(`/insurance/${params.id}/edit`)}
        >
          بازگشت و ویرایش اطلاعات
        </Button>
      </div>
    </StoreShell>
  );
}
