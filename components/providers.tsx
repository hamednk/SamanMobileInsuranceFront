"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { DirectionProvider } from "@/components/ui/direction";
import { Toaster } from "@/components/ui/sonner";
import { migrateLegacySession } from "@/lib/session";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      })
  );

  useEffect(() => {
    migrateLegacySession();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="saman-theme">
      <DirectionProvider direction="rtl">
        <QueryClientProvider client={client}>
          {children}
          <Toaster richColors position="top-center" dir="rtl" />
        </QueryClientProvider>
      </DirectionProvider>
    </ThemeProvider>
  );
}
