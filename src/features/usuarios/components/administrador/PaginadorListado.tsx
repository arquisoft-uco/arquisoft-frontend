import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  cantidadEnPagina: number;
  etiquetaPlural: string;
  onPageChange: (page: number) => void;
}

export default function PaginadorListado({
  page,
  pageSize,
  totalPages,
  totalElements,
  cantidadEnPagina,
  etiquetaPlural,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(page * pageSize + cantidadEnPagina, totalElements);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-on-surface-secondary">
        {from}–{to} de {totalElements} {etiquetaPlural}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          aria-label="Página anterior"
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-nav-hover-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} aria-hidden />
          Anterior
        </button>
        <span className="px-3 py-1.5 text-xs text-on-surface-secondary">
          {page + 1} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Página siguiente"
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-nav-hover-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
          <ChevronRight size={14} aria-hidden />
        </button>
      </div>
    </div>
  );
}
