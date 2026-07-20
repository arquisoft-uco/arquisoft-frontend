import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useFichasAsesor } from '../../hooks/useFichasAsesor';
import type { FichaPerfilAsesor } from '../../models/FichaPerfilAsesor';

interface Props {
  onSeleccionar: (ficha: FichaPerfilAsesor) => void;
  accionHeader?: React.ReactNode;
  formulario?: React.ReactNode;
}

export default function ConsultarFichasAsesor({ onSeleccionar, accionHeader, formulario }: Props) {
  const { data, isLoading, isError, refetch, page, pageSize, goToPage } = useFichasAsesor();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16" aria-live="polite" aria-busy="true">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          role="status"
        >
          <span className="sr-only">Cargando fichas de perfil...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center" role="alert">
        <p className="text-sm text-on-surface-secondary">
          No se pudieron cargar las fichas. Intenta nuevamente.
        </p>
      </div>
    );
  }

  const fichas = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(page * pageSize + fichas.length, totalElements);

  return (
    <section className="flex flex-col gap-6 animate-fade-up" aria-labelledby="fichas-asesor-titulo">
      <header className="flex items-center justify-between">
        <div>
          <h2 id="fichas-asesor-titulo" className="text-xl font-semibold text-on-surface">
            Mis Fichas de Perfil
          </h2>
          <p className="mt-1 text-sm text-on-surface-secondary">
            {totalElements} ficha{totalElements !== 1 ? 's' : ''} asignada{totalElements !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {accionHeader}
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-muted"
          >
            <RefreshCw size={16} aria-hidden /> Actualizar
          </button>
        </div>
      </header>

      {formulario}

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm" aria-label="Fichas de perfil del asesor">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-on-surface">Título del Proyecto</th>
              <th scope="col" className="px-4 py-3 font-semibold text-on-surface">Estado Actual</th>
              <th scope="col" className="px-4 py-3 font-semibold text-on-surface">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fichas.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-sm text-on-surface-secondary">
                  No tienes fichas de perfil asignadas.
                </td>
              </tr>
            ) : (
              fichas.map((ficha) => (
                <tr key={ficha.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-on-surface">{ficha.titulo}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-on-surface-secondary">
                      {ficha.estadoActual}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onSeleccionar(ficha)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-on-surface transition-colors hover:bg-muted"
                    >
                      Ver detalle
                    </button>
                  </td>
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
              onClick={() => goToPage(page - 1)}
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
              onClick={() => goToPage(page + 1)}
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
    </section>
  );
}


