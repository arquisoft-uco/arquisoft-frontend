import { useState } from 'react';
import { useEstadosFichasAsesor } from '../../hooks/useEstadosFichasAsesor';
import { useEstadosFicha } from '../../hooks/useEstadosFicha';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import { LIMITES } from '../../../../shared/validation';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

export default function EstadosFichasAsesorPanel() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    page,
    pageSize,
    goToPage,
    estadoId,
    titulo,
    aplicarFiltros,
  } = useEstadosFichasAsesor();
  const {
    data: estados = [],
    isLoading: cargandoEstados,
    isError: falloEstados,
  } = useEstadosFicha();

  const [estadoBorrador, setEstadoBorrador] = useState(estadoId);
  const [tituloBorrador, setTituloBorrador] = useState(titulo);

  const hayFiltros = estadoId !== '' || titulo.trim() !== '';
  const filas = data?.content ?? [];

  function handleSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    aplicarFiltros(estadoBorrador, tituloBorrador);
  }

  function handleLimpiar() {
    setEstadoBorrador('');
    setTituloBorrador('');
    aplicarFiltros('', '');
  }

  return (
    <section aria-labelledby="estados-fichas-asesor-titulo" className="space-y-4 animate-fade-up">
      <header>
        <h2 id="estados-fichas-asesor-titulo" className="text-xl font-semibold text-on-surface">
          Estados de mis fichas
        </h2>
        <p className="mt-1 text-sm text-on-surface-secondary">
          Historial de estados de las fichas de perfil que asesoras.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        aria-label="Filtros de estados de fichas"
      >
        <div className="sm:w-56">
          <label htmlFor="filtro-estado-ficha" className="field-label">
            Estado
          </label>
          <select
            id="filtro-estado-ficha"
            value={estadoBorrador}
            onChange={(e) => setEstadoBorrador(e.target.value)}
            disabled={cargandoEstados || falloEstados}
            className="field-input"
          >
            <option value="">Todos los estados</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:flex-1">
          <label htmlFor="filtro-titulo-ficha" className="field-label">
            Título de la ficha
          </label>
          <input
            id="filtro-titulo-ficha"
            type="text"
            value={tituloBorrador}
            onChange={(e) => setTituloBorrador(e.target.value)}
            maxLength={LIMITES.TITULO_PROYECTO_MAX}
            className="field-input"
          />
        </div>
        <div className="actions-row">
          <button
            type="button"
            onClick={handleLimpiar}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-nav-hover-bg"
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Filtrar
          </button>
        </div>
      </form>

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="py-8 text-center text-sm text-on-surface-secondary"
        >
          <span className="sr-only">Cargando estados de las fichas</span>
          <span
            aria-hidden
            className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
          />
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-danger p-3 text-sm text-danger sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{getApiErrorMessage(error, 'No se pudieron cargar los estados de las fichas.')}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-danger px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-nav-hover-bg"
          >
            Reintentar
          </button>
        </div>
      ) : filas.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-on-surface-secondary">
          {hayFiltros
            ? 'No hay estados que coincidan con los filtros.'
            : 'Tus fichas aún no tienen estados registrados.'}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
            <table
              className="w-full text-left text-sm"
              aria-label="Estados de las fichas de perfil que asesora"
            >
              <thead className="border-b border-border bg-surface-secondary text-xs text-on-surface-secondary">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Ficha
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Fecha de actualización
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filas.map((fila) => (
                  <tr key={fila.fichaPerfilId + fila.estadoId + fila.fechaActualizacion}>
                    <td className="px-4 py-3 text-on-surface">{fila.tituloProyecto}</td>
                    <td className="px-4 py-3 text-on-surface">{fila.estadoNombre}</td>
                    <td className="px-4 py-3 text-on-surface-secondary">
                      <time dateTime={fila.fechaActualizacion}>
                        {formatoFecha.format(new Date(fila.fechaActualizacion))}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginadorListado
            page={page}
            pageSize={pageSize}
            totalPages={data?.totalPages ?? 0}
            totalElements={data?.totalElements ?? 0}
            cantidadEnPagina={filas.length}
            etiquetaPlural="estados"
            onPageChange={goToPage}
          />
        </>
      )}
    </section>
  );
}
