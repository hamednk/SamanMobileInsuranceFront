const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.7;

export async function compressImage(input: Blob, fileName = "photo.jpg"): Promise<File> {
  const bitmap = await createImageBitmap(input);
  try {
    let width = bitmap.width;
    let height = bitmap.height;
    if (width > MAX_EDGE || height > MAX_EDGE) {
      const scale = Math.min(MAX_EDGE / width, MAX_EDGE / height);
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      return toFile(input, fileName, input.type || "image/jpeg");
    }
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("فشرده‌سازی تصویر ناموفق بود."))),
        "image/jpeg",
        JPEG_QUALITY
      );
    });

    if (blob.size >= input.size && input.type === "image/jpeg") {
      return toFile(input, fileName, "image/jpeg");
    }

    return new File([blob], withJpgExtension(fileName), { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}

function toFile(blob: Blob, fileName: string, type: string) {
  return blob instanceof File ? blob : new File([blob], fileName, { type });
}

function withJpgExtension(fileName: string) {
  return `${fileName.replace(/\.[^.]+$/, "") || "photo"}.jpg`;
}
