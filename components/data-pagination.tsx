"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toFaDigits } from "@/lib/format";
import type { Pagination as PaginationMeta } from "@/types";

type DataPaginationProps = {
  pagination: PaginationMeta | null | undefined;
  onPageChange: (page: number) => void;
};

export function DataPagination({ pagination, onPageChange }: DataPaginationProps) {
  if (!pagination || pagination.total === 0) {
    return null;
  }

  const { page, totalPages, total } = pagination;

  return (
    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {toFaDigits(total)} مورد — صفحه {toFaDigits(page)} از {toFaDigits(Math.max(totalPages, 1))}
      </p>
      {totalPages > 1 ? (
        <Pagination className="mx-0 w-auto justify-start sm:justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text="قبلی"
                href="#"
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  if (page > 1) onPageChange(page - 1);
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                text="بعدی"
                href="#"
                aria-disabled={page >= totalPages}
                className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  if (page < totalPages) onPageChange(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}
