import { BrandLogo } from "@/components/brand-logo";
import { PublicAuthChrome } from "@/components/theme-toggle";

export default function OfflinePage() {
  return (
    <PublicAuthChrome>
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <BrandLogo size="hero" />
        <div>
          <h1 className="text-xl font-semibold">آفلاین هستید</h1>
          <p className="mt-2 text-muted-foreground">برای ثبت بیمه و پرداخت به اینترنت نیاز است.</p>
        </div>
      </div>
    </PublicAuthChrome>
  );
}
