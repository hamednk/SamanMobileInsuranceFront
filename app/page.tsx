"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getSessionUser } from "@/lib/session";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    const user = getSessionUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(user.role === "Store" ? "/dashboard" : "/admin");
  }, [router]);
  return <div className="flex min-h-dvh items-center justify-center">در حال انتقال...</div>;
}
