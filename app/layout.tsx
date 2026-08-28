import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegister } from "@/components/pwa-register";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "بیمه موبایل سامان-نمایندگی کد 1195 پارسا محمدنژاد",
    template: "%s | بیمه موبایل سامان",
  },
  description: "سامانه فروش بیمه موبایل سامان-نمایندگی کد 1195 پارسا محمدنژاد برای فروشگاه‌های مجاز",
  manifest: "/manifest.webmanifest",
  applicationName: "بیمه موبایل سامان-نمایندگی کد 1195 پارسا محمدنژاد",
  appleWebApp: { capable: true, title: "بیمه موبایل سامان-نمایندگی کد 1195 پارسا محمدنژاد" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/saman-logo.png" }],
  },
  openGraph: {
    title: "بیمه موبایل سامان-نمایندگی کد 1195 پارسا محمدنژاد",
    description: "ثبت بیمه موبایل آکبند و کارکرده برای فروشگاه‌های مجاز",
    locale: "fa_IR",
    type: "website",
    images: [{ url: "/brand/saman-logo.png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <ServiceWorkerRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}
