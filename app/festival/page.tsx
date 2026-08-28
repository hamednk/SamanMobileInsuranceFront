"use client";

import { StoreShell } from "@/components/store-shell";
import { StoreFestivalCard } from "@/features/festivals/store-festival-card";

export default function StoreFestivalPage() {
  return (
    <StoreShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">جشنواره فروش</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            وضعیت جشنواره فعال، پیشرفت صدور بیمه‌نامه و پاداش فروشگاه را اینجا ببینید.
          </p>
        </div>
        <StoreFestivalCard showDetails />
      </div>
    </StoreShell>
  );
}
