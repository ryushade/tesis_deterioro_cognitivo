import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  metadata: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  page: number;
  limit: number;
  changePage: (page: number) => void;
  changeLimit: (limit: number) => void;
}

export default function PaginationControls({
  metadata,
  page,
  limit,
  changePage,
  changeLimit,
}: PaginationControlsProps) {
  const { total, total_pages, has_next, has_prev } = metadata;
  
  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-gray-700">
          Mostrando {startRecord} a {endRecord} de {total} registros
        </p>
        
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-700">Mostrar:</p>
          <select
            value={limit}
            onChange={(e) => changeLimit(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => changePage(page - 1)}
          disabled={!has_prev}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
            let pageNum;
            if (total_pages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= total_pages - 2) {
              pageNum = total_pages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => changePage(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => changePage(page + 1)}
          disabled={!has_next}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
