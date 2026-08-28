import { BrandLogo } from "@/components/brand-logo";
import { PublicAuthChrome } from "@/components/theme-toggle";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <PublicAuthChrome>
      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandLogo size="hero" priority />
          <div>
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">بیمه موبایل سامان-نمایندگی کد 1195 پارسا محمدنژاد</h1>
            <p className="mt-1 text-muted-foreground">سامانه فروش بیمه‌نامه موبایل</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </PublicAuthChrome>
  );
}
