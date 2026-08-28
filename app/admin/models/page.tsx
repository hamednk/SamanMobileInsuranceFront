"use client";

import { AdminShell } from "@/components/admin-shell";
import { ModelsCatalogManager } from "@/features/catalog/models-catalog-manager";

export default function AdminModelsPage() {
  return (
    <AdminShell>
      <ModelsCatalogManager
        brandsPath={"/api/v1/admin/brands"}
        modelsPath={"/api/v1/admin/models"}
        queryPrefix="admin"
      />
    </AdminShell>
  );
}
