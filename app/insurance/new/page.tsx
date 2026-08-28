import { StoreShell } from "@/components/store-shell";
import { PolicyForm } from "@/features/insurance/policy-form";

export default function NewInsurancePage() {
  return (
    <StoreShell>
      <PolicyForm type="New" />
    </StoreShell>
  );
}
