import { BrandLogo } from "@/components/brand-logo";
import { PublicAuthChrome } from "@/components/theme-toggle";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata = {
  title: "ثبت‌نام فروشگاه",
  description: "ثبت‌نام فروشگاه مجاز برای فروش بیمه موبایل سامان-نمایندگی کد 1195 پارسا محمدنژاد",
};

export default function RegisterPage() {
  return (
    <PublicAuthChrome>
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 py-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <BrandLogo size="hero" priority />
          <p className="text-sm text-muted-foreground">ثبت‌نام فروشگاه مجاز</p>
        </div>
        <RegisterForm />
      </div>
    </PublicAuthChrome>
  );
}
