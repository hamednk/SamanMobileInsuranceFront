import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = {
  hero: { width: 280, height: 112, className: "h-24 w-auto sm:h-28" },
  sidebar: { width: 200, height: 80, className: "h-14 w-auto" },
  header: { width: 160, height: 64, className: "h-14 w-auto" },
} as const;

export function BrandLogo({
  size = "sidebar",
  className,
  priority = false,
}: {
  size?: keyof typeof sizes;
  className?: string;
  priority?: boolean;
}) {
  const config = sizes[size];

  return (
    <div
      className={cn(
        "inline-flex",
        className
      )}
    >
      <Image
        src="/brand/saman-logo.png"
        alt="بیمه سامان"
        width={config.width}
        height={config.height}
        priority={priority}
        className={cn("object-contain object-center", config.className)}
      />
    </div>
  );
}
