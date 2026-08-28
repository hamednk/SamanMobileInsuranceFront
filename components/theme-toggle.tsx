"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function subscribe() {
  return () => undefined;
}

export function ThemeToggle({
  align = "end",
  fullWidth = false,
}: {
  align?: "start" | "end" | "center";
  fullWidth?: boolean;
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const current = mounted ? (theme ?? "system") : "system";
  const resolved = mounted ? resolvedTheme : "light";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size={fullWidth ? "lg" : "icon"}
            aria-label="انتخاب تم"
            className={fullWidth ? "min-h-11 w-full justify-start" : "min-h-11 min-w-11"}
          />
        }
      >
        {resolved === "dark" ? (
          <MoonIcon data-icon={fullWidth ? "inline-start" : undefined} />
        ) : (
          <SunIcon data-icon={fullWidth ? "inline-start" : undefined} />
        )}
        {fullWidth ? "ظاهر برنامه" : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>ظاهر برنامه</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={current}
            onValueChange={(value) => {
              if (value === "light" || value === "dark" || value === "system") {
                setTheme(value);
              }
            }}
          >
            <DropdownMenuRadioItem value="light">
              <SunIcon data-icon="inline-start" />
              روشن
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <MoonIcon data-icon="inline-start" />
              تیره
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              <MonitorIcon data-icon="inline-start" />
              سیستم
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PublicAuthChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex justify-start p-4">
        <ThemeToggle align="start" />
      </header>
      <main className="flex flex-1 items-center justify-center p-4 pt-0">{children}</main>
    </div>
  );
}
