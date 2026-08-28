export type IncompletePolicyStatus = "Draft" | "AwaitingImages" | "AwaitingPayment" | "Paid";

export function isIncompletePolicy(status: string): boolean {
  return status === "Draft" || status === "AwaitingImages" || status === "AwaitingPayment" || status === "Paid";
}

/** Next wizard step URL for an incomplete policy. */
export function getPolicyContinueHref(policyId: string, status: string): string | null {
  switch (status) {
    case "Draft":
    case "AwaitingImages":
      return `/insurance/${policyId}/images`;
    case "AwaitingPayment":
      return `/insurance/${policyId}/payment`;
    case "Paid":
      return `/insurance/${policyId}/success`;
    default:
      return null;
  }
}

export function getPolicyContinueLabel(status: string): string {
  switch (status) {
    case "Draft":
    case "AwaitingImages":
      return "تکمیل تصاویر";
    case "AwaitingPayment":
      return "ادامه پرداخت";
    case "Paid":
      return "مشاهده صدور";
    default:
      return "ادامه";
  }
}

export function getPolicyContinueHint(status: string): string {
  switch (status) {
    case "Draft":
    case "AwaitingImages":
      return "ثبت تصاویر روی و پشت گوشی باقی مانده است.";
    case "AwaitingPayment":
      return "پرداخت حق بیمه انجام نشده است.";
    case "Paid":
      return "پرداخت انجام شده؛ وضعیت صدور را بررسی کنید.";
    default:
      return "این بیمه‌نامه ناقص است و باید تکمیل شود.";
  }
}
