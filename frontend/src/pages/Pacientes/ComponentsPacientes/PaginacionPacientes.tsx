import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import React from "react";


interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function PaginacionPacientes({ currentPage, totalPages, onPageChange, disabled }: Props) {
  const cur = Math.max(1, Math.min(currentPage || 1, totalPages || 1));
  const total = Math.max(1, totalPages || 1);

  const pageItem = (p: number) => (
    <PaginationItem key={p}>
      <PaginationLink
        href="#"
        isActive={p === cur}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled && p !== cur) onPageChange(p);
        }}
      >
        {p}
      </PaginationLink>
    </PaginationItem>
  );

  const buildItems = () => {
    const items: React.ReactNode[] = [];
    if (total <= 3) {
      for (let p = 1; p <= total; p++) items.push(pageItem(p));
      return items;
    }
    if (cur <= 2) {
      items.push(pageItem(1));
      items.push(pageItem(2));
      items.push(pageItem(3));
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
      return items;
    }
    if (cur >= total - 1) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
      items.push(pageItem(Math.max(1, total - 2)));
      items.push(pageItem(Math.max(1, total - 1)));
      items.push(pageItem(total));
      return items;
    }
    items.push(
      <PaginationItem key="ellipsis-start">
        <PaginationEllipsis />
      </PaginationItem>
    );
    items.push(pageItem(cur - 1));
    items.push(pageItem(cur));
    items.push(pageItem(cur + 1));
    items.push(
      <PaginationItem key="ellipsis-end">
        <PaginationEllipsis />
      </PaginationItem>
    );
    return items;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <a
            href="#"
            aria-label="Anterior"
            onClick={(e) => {
              e.preventDefault();
              if (!disabled && cur > 1) onPageChange(cur - 1);
            }}
            className="px-2 text-sm text-gray-700 hover:text-gray-900"
          >
            &lt;
          </a>
        </PaginationItem>
        {buildItems()}
        <PaginationItem>
          <a
            href="#"
            aria-label="Siguiente"
            onClick={(e) => {
              e.preventDefault();
              if (!disabled && cur < total) onPageChange(cur + 1);
            }}
            className="px-2 text-sm text-gray-700 hover:text-gray-900"
          >
            &gt;
          </a>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
