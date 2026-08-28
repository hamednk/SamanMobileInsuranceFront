import { StoreShell } from "@/components/store-shell";
import { PolicyForm } from "@/features/insurance/policy-form";

export default function UsedInsurancePage() {
  return (
    <StoreShell>
      <PolicyForm type="Used" />
    </StoreShell>
  );
}
