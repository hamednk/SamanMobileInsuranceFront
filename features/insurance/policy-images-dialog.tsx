"use client";

import { useQuery } from "@tanstack/react-query";
import { ImagesIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { policyHasImages, policyImageApiPath, policyImageLabel, type PolicyImageScope } from "@/lib/policy-images";
import type { Policy } from "@/types";

type PolicyImagesDialogProps = {
  policyId: string;
  scope: PolicyImageScope;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
};

function PolicyImagePreview({
  policyId,
  imageId,
  label,
  scope,
}: {
  policyId: string;
  imageId: string;
  label: string;
  scope: PolicyImageScope;
}) {
  const { data: blob, isLoading, isError } = useQuery({
    queryKey: ["policy-image-blob", scope, policyId, imageId],
    queryFn: () => api.blob(policyImageApiPath(policyId, imageId, scope)),
    staleTime: 5 * 60_000,
  });
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex min-h-48 items-center justify-center rounded-xl border bg-muted/40 p-2">
        {isLoading ? <Spinner className="size-6" /> : null}
        {isError ? <p className="text-sm text-destructive">بارگذاری تصویر ناموفق بود.</p> : null}
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="max-h-80 w-full rounded-lg object-contain" />
        ) : null}
      </div>
    </div>
  );
}

export function PolicyImagesDialog({ policyId, scope, open, onOpenChange, title }: PolicyImagesDialogProps) {
  const queryKey = scope === "admin" ? ["admin-policy", policyId] : ["policy", policyId];
  const queryPath =
    scope === "admin" ? `/api/v1/admin/policies/${policyId}` : `/api/v1/insurance/${policyId}`;

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => api.get<Policy>(queryPath),
    enabled: open,
  });

  const front = data?.images.find((i) => i.imageType === "Front");
  const back = data?.images.find((i) => i.imageType === "Back");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title ?? "نمایش تصاویر بیمه‌نامه"}</DialogTitle>
          <DialogDescription>تصاویر بارگذاری‌شده هنگام صدور بیمه‌نامه</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-6" />
          </div>
        ) : !policyHasImages(data) ? (
          <p className="py-6 text-center text-sm text-muted-foreground">تصویری برای این بیمه‌نامه ثبت نشده است.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {front ? (
              <PolicyImagePreview
                policyId={policyId}
                imageId={front.id}
                label={policyImageLabel("Front")}
                scope={scope}
              />
            ) : (
              <p className="text-sm text-muted-foreground">تصویر روی گوشی ثبت نشده است.</p>
            )}
            {back ? (
              <PolicyImagePreview
                policyId={policyId}
                imageId={back.id}
                label={policyImageLabel("Back")}
                scope={scope}
              />
            ) : (
              <p className="text-sm text-muted-foreground">تصویر پشت گوشی ثبت نشده است.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PolicyImagesButton({
  policyId,
  scope,
  title,
  size = "sm",
  variant = "outline",
  className,
  disabled,
}: {
  policyId: string;
  scope: PolicyImageScope;
  title?: string;
  size?: "sm" | "default";
  variant?: "outline" | "secondary" | "default";
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        className={className ?? "min-h-10"}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <ImagesIcon className="size-4" />
        نمایش تصاویر
      </Button>
      <PolicyImagesDialog
        policyId={policyId}
        scope={scope}
        open={open}
        onOpenChange={setOpen}
        title={title}
      />
    </>
  );
}
