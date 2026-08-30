"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  Building2Icon,
  CreditCardIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  PartyPopperIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldIcon,
  SmartphoneIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/lib/api";
import { clearSession, getRefreshToken, getServerSessionUser, getSessionUser, migrateLegacySession, subscribeSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboardIcon },
  { href: "/admin/stores", label: "فروشگاه‌ها", icon: StoreIcon },
  { href: "/admin/users", label: "کاربران", icon: UsersIcon },
  { href: "/admin/policies", label: "بیمه‌نامه‌ها", icon: ShieldIcon },
  { href: "/admin/customers", label: "مشتریان", icon: Building2Icon },
  { href: "/admin/brands", label: "برندها", icon: SmartphoneIcon },
  { href: "/admin/models", label: "مدل‌های موبایل", icon: SmartphoneIcon },
  { href: "/admin/payments", label: "پرداخت‌ها", icon: CreditCardIcon },
  { href: "/admin/festivals", label: "جشنواره‌ها", icon: PartyPopperIcon },
  { href: "/admin/settings", label: "تنظیمات", icon: SettingsIcon },
  { href: "/admin/audit-logs", label: "سوابق سیستم", icon: ScrollTextIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
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
    if (!user || (user.role !== "Admin" && user.role !== "Operator")) {
      router.replace("/login");
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

  if (!mounted || !user || (user.role !== "Admin" && user.role !== "Operator")) {
    return <div className="flex min-h-dvh items-center justify-center text-muted-foreground">در حال بارگذاری...</div>;
  }

  const items = nav.map((item) => {
    const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
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
      <aside className="hidden w-64 flex-col border-e border-sidebar-border bg-sidebar/90 p-4 backdrop-blur-md lg:flex">
        <div className="mb-6 flex flex-col items-start gap-2 px-1">
          <BrandLogo size="sidebar" />
          <p className="px-1 text-xs text-muted-foreground">پنل مدیریت بیمه سامان</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">{items}</nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-4 py-3">
          <BrandLogo size="header" className="lg:hidden" />
          <div className="flex items-center gap-2 ms-auto">
            <ThemeToggle />
            <Button variant="ghost" className="min-h-11 gap-2" onClick={logout}>
              <LogOutIcon className="size-4" />
              <span className="hidden sm:inline">خروج</span>
            </Button>
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="icon" className="min-h-11 min-w-11 lg:hidden" />}>
                <MenuIcon />
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>منو</SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col gap-1">{items}</nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
