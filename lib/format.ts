/** Convert Latin/Arabic-Indic digits to Persian digits. */
export function toFaDigits(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const map = "۰۱۲۳۴۵۶۷۸۹";
  return String(value).replace(/\d/g, (d) => map[Number(d)] ?? d);
}

/** Convert Persian/Arabic-Indic digits to Latin digits. */
export function toEnDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** Integer/decimal with thousand separators + Persian digits (e.g. ۱,۲۳۴,۵۶۷). */
export function formatNumber(value: number | string | null | undefined, fractionDigits = 0): string {
  if (value === null || value === undefined || value === "") return "۰";
  const n = typeof value === "number" ? value : Number(toEnDigits(String(value)).replaceAll(",", ""));
  if (!Number.isFinite(n)) return toFaDigits(String(value));
  return toFaDigits(
    n.toLocaleString("en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })
  );
}

/** Format typed amount input: strip non-digits, group by 3, show Persian digits. */
export function formatAmountInput(raw: string, maxDigits = 15): string {
  const digits = toEnDigits(raw).replace(/\D/g, "").slice(0, maxDigits);
  if (!digits) return "";
  return toFaDigits(digits.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}

export function parseAmountInput(raw: string): number {
  const digits = toEnDigits(raw).replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

/** Keep only digits (Persian/Arabic/Latin) up to maxDigits, shown as Persian. */
export function limitDigitInput(raw: string, maxDigits: number): string {
  return toFaDigits(toEnDigits(raw).replace(/\D/g, "").slice(0, maxDigits));
}

/** Strip Latin letters and digits from Persian name fields. */
export function limitPersianNameInput(raw: string, maxLength = 80): string {
  return raw.replace(/[\d_a-zA-Z]/g, "").slice(0, maxLength);
}

export function formatRial(rial: number): string {
  return `${formatNumber(Math.round(rial))} ریال`;
}

export function formatToman(rial: number): string {
  return `${formatNumber(Math.round(rial / 10))} تومان`;
}

export function formatPercent(value: number): string {
  return `${toFaDigits(String(value))}٪`;
}

export function formatJalali(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tehran",
  }).format(date);
}

export function formatJalaliDateTime(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tehran",
  }).format(date);
}

const TYPE_LABELS: Record<string, string> = {
  // Policy / payment
  Draft: "پیش‌نویس",
  AwaitingImages: "در انتظار تصویر",
  AwaitingPayment: "در انتظار پرداخت",
  Paid: "پرداخت‌شده",
  Issued: "صادر شده",
  Cancelled: "لغو شده",
  Expired: "منقضی‌شده",
  Pending: "در انتظار",
  Failed: "ناموفق",
  New: "آکبند",
  Used: "کارکرده",
  Front: "جلو",
  Back: "پشت",
  // Roles
  Admin: "مدیر",
  Store: "فروشگاه",
  Operator: "اپراتور",
  // Entities
  User: "کاربر",
  Payment: "پرداخت",
  InsurancePolicy: "بیمه‌نامه",
  MobileBrand: "برند",
  MobileModel: "مدل",
  AppSetting: "تنظیمات",
  Customer: "مشتری",
  SalesFestival: "جشنواره",
  // Audit actions
  login: "ورود",
  "forgot-password": "فراموشی رمز",
  "reset-password": "بازیابی رمز",
  "store-register": "ثبت فروشگاه",
  "store-update": "ویرایش فروشگاه",
  "store-activate": "فعال‌سازی فروشگاه",
  "store-deactivate": "غیرفعال‌سازی فروشگاه",
  "policy-create": "ایجاد بیمه‌نامه",
  "policy-cancel": "لغو بیمه‌نامه",
  "policy-renew": "تمدید بیمه‌نامه",
  "policy-image-upload": "آپلود تصویر بیمه‌نامه",
  "payment-init": "شروع پرداخت",
  "payment-verified": "تأیید پرداخت",
  "brand-create": "ایجاد برند",
  "brand-delete": "حذف برند",
  "model-create": "ایجاد مدل",
  "model-delete": "حذف مدل",
  "user-create": "ایجاد کاربر",
  "user-password-change": "تغییر رمز کاربر",
  "setting-update": "بروزرسانی تنظیمات",
  "festival-create": "ایجاد جشنواره",
  "festival-update": "ویرایش جشنواره",
  "festival-delete": "حذف جشنواره",
};

/** Map English enum / audit / entity codes to Farsi labels. */
export function typeLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return TYPE_LABELS[value] ?? TYPE_LABELS[value.trim()] ?? value;
}

/** Policy workflow status (Paid = paid, awaiting company issuance). */
export function policyStatusLabel(status: string): string {
  if (status === "Paid") return "در انتظار صدور";
  return typeLabel(status);
}

/** Gateway / payment record status. */
export function paymentStatusLabel(status: string): string {
  return typeLabel(status);
}

/** @deprecated Prefer typeLabel — kept for existing imports. */
export function statusLabel(status: string): string {
  return typeLabel(status);
}

export function roleLabel(role: string): string {
  return typeLabel(role);
}

export function auditActionLabel(action: string): string {
  return typeLabel(action);
}

export function entityLabel(entity: string): string {
  return typeLabel(entity);
}
