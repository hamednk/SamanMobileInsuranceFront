"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";

type Props = {
  label: string;
  warning?: string;
  onCapture: (file: File) => Promise<void>;
  previewUrl?: string | null;
};

export function CameraCapture({ label, warning, onCapture, previewUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [pending, setPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      fileRef.current?.click();
    }
  }

  function stopCamera() {
    const stream = videoRef.current?.srcObject as MediaStream | undefined;
    stream?.getTracks().forEach((t) => t.stop());
    setStreaming(false);
  }

  async function takePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setPending(true);
      try {
        await onCapture(new File([blob], "capture.jpg", { type: "image/jpeg" }));
        stopCamera();
      } finally {
        setPending(false);
      }
    }, "image/jpeg", 0.85);
  }

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPending(true);
    try {
      await onCapture(file);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      <h3 className="font-medium">{label}</h3>
      {warning ? <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{warning}</p> : null}
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt={label} className="max-h-64 w-full rounded-lg object-contain bg-muted" />
      ) : null}
      <video ref={videoRef} className={streaming ? "w-full rounded-lg" : "hidden"} playsInline muted />
      <div className="flex flex-wrap gap-2">
        {!streaming ? (
          <Button type="button" className="min-h-11" onClick={startCamera} disabled={pending}>
            باز کردن دوربین
          </Button>
        ) : (
          <>
            <Button type="button" className="min-h-11" onClick={takePhoto} disabled={pending}>
              گرفتن عکس
            </Button>
            <Button type="button" variant="outline" className="min-h-11" onClick={stopCamera}>
              بستن دوربین
            </Button>
          </>
        )}
        <Button type="button" variant="outline" className="min-h-11" onClick={() => fileRef.current?.click()} disabled={pending}>
          انتخاب از فایل
        </Button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
      </div>
      <FieldDescription>فرمت مجاز: JPG، PNG، WEBP — حداکثر ۵ مگابایت</FieldDescription>
    </div>
  );
}
