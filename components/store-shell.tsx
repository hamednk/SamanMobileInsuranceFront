"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  ChartColumnIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  PartyPopperIcon,
  RefreshCwIcon,
  ShieldPlusIcon,
  SmartphoneIcon,
  UserIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/lib/api";
import { clearSession, getRefreshToken, getServerSessionUser, getSessionUser, migrateLegacySession, subscribeSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboardIcon },
  { href: "/insurance", label: "بیمه موبایل", icon: ShieldPlusIcon },
  { href: "/policies", label: "بیمه‌های من", icon: FileTextIcon },
  { href: "/renewals", label: "تمدید", icon: RefreshCwIcon },
  { href: "/festival", label: "جشنواره", icon: PartyPopperIcon },
  { href: "/reports", label: "گزارش عملکرد", icon: ChartColumnIcon },
  { href: "/models", label: "مدل‌های موبایل", icon: SmartphoneIcon },
  { href: "/profile", label: "پروفایل فروشگاه", icon: UserIcon },
];

export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSyncExternalStore(subscribeSession, getSessionUser, getServerSessionUser);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    migrateLegacySession();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "Store") {
      router.replace(user.role === "Admin" || user.role === "Operator" ? "/admin" : "/login");
    }
  }, [mounted, router, user]);

  async function logout() {
    try {
      await api.post("/api/v1/auth/logout", { refreshToken: getRefreshToken() });
    } finally {
      clearSession();
      router.replace("/login");
    }
  }

  if (!mounted || !user || user.role !== "Store") {
    return <div className="flex min-h-dvh items-center justify-center text-muted-foreground">در حال بارگذاری...</div>;
  }

  const items = nav.map((item) => {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <item.icon className="size-4 shrink-0 opacity-90" />
        {item.label}
      </Link>
    );
  });

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-64 flex-col border-e border-sidebar-border bg-sidebar/90 p-4 backdrop-blur-md md:flex">
        <div className="mb-6 flex flex-col items-start gap-2 px-1">
          <BrandLogo size="sidebar" />
          <p className="px-1 text-xs text-muted-foreground">بیمه موبایل سامان-نمایندگی کد 1195 پارسا محمدنژاد</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">{items}</nav>
        <div className="flex flex-col gap-2">
          <ThemeToggle fullWidth />
          <Button variant="ghost" className="min-h-11 justify-start" onClick={logout}>
            <LogOutIcon data-icon="inline-start" />
            خروج
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 md:hidden">
          <BrandLogo size="header" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="icon" className="min-h-11 min-w-11" />}>
                <MenuIcon />
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>منو</SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col gap-1">{items}</nav>
                <Button variant="ghost" className="mt-4 min-h-11 justify-start" onClick={logout}>
                  <LogOutIcon data-icon="inline-start" />
                  خروج
                </Button>
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
