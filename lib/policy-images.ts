import { API_URL } from "@/lib/api";
import type { Policy } from "@/types";

export type PolicyImageScope = "store" | "admin";

export function policyImageApiPath(policyId: string, imageId: string, scope: PolicyImageScope) {
  return scope === "admin"
    ? `/api/v1/admin/policies/${policyId}/images/${imageId}`
    : `/api/v1/insurance/${policyId}/images/${imageId}`;
}

export function policyHasImages(policy?: Pick<Policy, "images"> | null) {
  return (policy?.images?.length ?? 0) > 0;
}

export function policyImageLabel(imageType: "Front" | "Back") {
  return imageType === "Front" ? "تصویر روی گوشی" : "تصویر پشت گوشی";
}

export function policyImageApiUrl(policyId: string, imageId: string, scope: PolicyImageScope) {
  return `${API_URL}${policyImageApiPath(policyId, imageId, scope)}`;
}
