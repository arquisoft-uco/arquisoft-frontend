import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FichaPerfil } from '../../models/FichaPerfil';

interface Props {
  fichas: FichaPerfil[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function FichasPerfilTable({
  fichas,
  totalElements,
  totalPages,
  page,
  pageSize,
  onPageChange,
}: Props) {
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(page * pageSize + fichas.length, totalElements);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm" aria-label="Fichas de perfil del coordinador">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-on-surface">Título del Proyecto</th>
              <th scope="col" className="px-4 py-3 font-semibold text-on-surface">Asesor</th>
              <th scope="col" className="px-4 py-3 font-semibold text-on-surface">Correo del Asesor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fichas.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-sm text-on-surface-secondary">
                  No hay fichas de perfil registradas.
                </td>
              </tr>
            ) : (
              fichas.map((ficha) => (
                <tr key={ficha.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-on-surface">{ficha.titulo}</td>
                  <td className="px-4 py-3 text-on-surface">{ficha.asesor.nombre}</td>
                  <td className="px-4 py-3 text-on-surface-secondary">{ficha.asesor.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-on-surface-secondary">
            {from}–{to} de {totalElements} fichas
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              aria-label="Página anterior"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
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
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
              <ChevronRight size={14} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
