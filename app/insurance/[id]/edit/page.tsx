"use client";

import { useParams } from "next/navigation";
import { StoreShell } from "@/components/store-shell";
import { PolicyForm } from "@/features/insurance/policy-form";

export default function EditPolicyPage() {
  const params = useParams<{ id: string }>();

  return (
    <StoreShell>
      <PolicyForm policyId={params.id} />
    </StoreShell>
  );
}
