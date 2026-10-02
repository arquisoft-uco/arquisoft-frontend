import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useEstadosFicha } from '../../hooks/useEstadosFicha';
import { useFichasRepresentante } from '../../hooks/useFichasRepresentante';
import type { FichaPerfilRepresentante } from '../../models/FichaPerfilRepresentante';
import type { FiltrosFichasRepresentante } from '../../models/FiltrosFichasRepresentante';
import { LIMITES } from '../../../../shared/validation';

interface Props {
  onSeleccionar: (ficha: FichaPerfilRepresentante) => void;
}

const FILTROS_VACIOS: FiltrosFichasRepresentante = {
  titulo: '',
  asesorNombre: '',
  asesorEmail: '',
  estadoIds: [],
};

export default function ConsultarFichasRepresentante({ onSeleccionar }: Props) {
  const [filtros, setFiltros] = useState<FiltrosFichasRepresentante>(FILTROS_VACIOS);
  const [borrador, setBorrador] = useState<FiltrosFichasRepresentante>(FILTROS_VACIOS);
  const [estadosAbierto, setEstadosAbierto] = useState(false);
  const { data, isLoading, isError, refetch, page, pageSize, goToPage } =
    useFichasRepresentante(filtros);
  const estados = useEstadosFicha();

  function aplicar() {
    const sinCambios = JSON.stringify(borrador) === JSON.stringify(filtros) && page === 0;
    if (sinCambios) {
      refetch();
      return;
    }
    setFiltros(borrador);
    goToPage(0);
  }

  function limpiar() {
    setBorrador(FILTROS_VACIOS);
    setFiltros(FILTROS_VACIOS);
    goToPage(0);
  }

  function alternarEstado(id: string) {
    setBorrador((actual) => ({
      ...actual,
      estadoIds: actual.estadoIds.includes(id)
        ? actual.estadoIds.filter((e) => e !== id)
        : [...actual.estadoIds, id],
    }));
  }

  const fichas = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(page * pageSize + fichas.length, totalElements);

  return (
    <section className="flex flex-col gap-6 animate-fade-up" aria-labelledby="fichas-representante-titulo">
      <header className="section-header">
        <div>
          <h2 id="fichas-representante-titulo" className="text-xl font-semibold text-on-surface">
            Fichas de Perfil a Evaluar
          </h2>
          <p className="mt-1 text-sm text-on-surface-secondary">
            {totalElements} ficha{totalElements !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="header-action inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-muted"
        >
          <RefreshCw size={16} aria-hidden /> Actualizar
        </button>
      </header>

      <form
        className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4"
        aria-label="Filtros de fichas"
        onSubmit={(e) => {
          e.preventDefault();
          aplicar();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="filtro-titulo" className="field-label">Título</label>
            <input
              id="filtro-titulo"
              type="text"
              className="field-input"
              maxLength={LIMITES.TITULO_PROYECTO_MAX}
              value={borrador.titulo}
              onChange={(e) => setBorrador({ ...borrador, titulo: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="filtro-asesor-nombre" className="field-label">Nombre del asesor</label>
            <input
              id="filtro-asesor-nombre"
              type="text"
              className="field-input"
              value={borrador.asesorNombre}
              onChange={(e) => setBorrador({ ...borrador, asesorNombre: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="filtro-asesor-email" className="field-label">Correo del asesor</label>
            <input
              id="filtro-asesor-email"
              type="text"
              className="field-input"
              value={borrador.asesorEmail}
              onChange={(e) => setBorrador({ ...borrador, asesorEmail: e.target.value })}
            />
          </div>
          <div>
            <span className="field-label">Estado</span>
            <button
              type="button"
              aria-expanded={estadosAbierto}
              aria-controls="filtro-estados"
              disabled={estados.isLoading || estados.isError}
              onClick={() => setEstadosAbierto((abierto) => !abierto)}
              className="field-input flex items-center justify-between text-left disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {borrador.estadoIds.length === 0
                  ? 'Todos los estados'
                  : `${borrador.estadoIds.length} seleccionado${borrador.estadoIds.length !== 1 ? 's' : ''}`}
              </span>
              <ChevronDown size={16} aria-hidden />
            </button>
            {estados.isError && (
              <p className="field-error" role="alert">
                No se pudo cargar el catálogo de estados; los demás filtros siguen disponibles.
              </p>
            )}
            {estadosAbierto && !estados.isError && (
              <fieldset
                id="filtro-estados"
                className="mt-2 flex flex-col rounded-lg border border-border bg-background px-3"
              >
                <legend className="sr-only">Estados de la ficha</legend>
                {(estados.data ?? []).map((estado) => (
                  <label key={estado.id} className="tap-target gap-2 text-sm text-on-surface">
                    <input
                      type="checkbox"
                      className="checkbox-control"
                      checked={borrador.estadoIds.includes(estado.id)}
                      onChange={() => alternarEstado(estado.id)}
                    />
                    {estado.nombre}
                  </label>
                ))}
              </fieldset>
            )}
          </div>
        </div>
        <div className="actions-row sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={limpiar}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-muted"
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Buscar
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="flex items-center justify-center py-16" aria-live="polite" aria-busy="true">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
            role="status"
          >
            <span className="sr-only">Cargando fichas de perfil...</span>
          </div>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6 text-center" role="alert">
          <p className="text-sm text-on-surface-secondary">
            No se pudieron cargar las fichas. Intenta nuevamente.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-muted"
          >
            Reintentar
          </button>
        </div>
      ) : (
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm" aria-label="Fichas de perfil a evaluar">
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
                  No hay fichas de perfil para evaluar con esos filtros.
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
      )}

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
