"use client";

import { StoreShell } from "@/components/store-shell";
import { ModelsCatalogManager } from "@/features/catalog/models-catalog-manager";

export default function StoreModelsPage() {
  return (
    <StoreShell>
      <ModelsCatalogManager
        brandsPath={"/api/v1/store/catalog/brands"}
        modelsPath={"/api/v1/store/catalog/models"}
        queryPrefix="store"
        restrictManage
      />
    </StoreShell>
  );
}
