import { Reply } from 'lucide-react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import type { Solicitud } from '../../models/Solicitud';

interface Props {
  solicitudes: Solicitud[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onResponder: (solicitud: Solicitud) => void;
}

const COLUMNAS = ['Fecha de recepción', 'Remitente', 'Mensaje', 'Acciones'];

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

export default function SolicitudesRecibidasTable({
  solicitudes,
  totalElements,
  totalPages,
  page,
  pageSize,
  onPageChange,
  onResponder,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm" aria-label="Solicitudes de novedad recibidas">
          <thead className="border-b border-border bg-surface-secondary">
            <tr>
              {COLUMNAS.map((columna) => (
                <th key={columna} scope="col" className="px-4 py-3 font-semibold text-on-surface">
                  {columna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {solicitudes.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNAS.length}
                  className="px-4 py-10 text-center text-sm text-on-surface-secondary"
                >
                  Aún no has recibido solicitudes de novedad.
                </td>
              </tr>
            ) : (
              solicitudes.map((solicitud) => (
                <tr
                  key={solicitud.id}
                  className="align-top transition-colors hover:bg-nav-hover-bg"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-on-surface">
                    <time dateTime={solicitud.fechaCreacion}>
                      {FORMATO_FECHA.format(new Date(solicitud.fechaCreacion))}
                    </time>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-on-surface">{solicitud.remitente.nombre}</p>
                    <p className="text-xs text-on-surface-secondary">
                      {solicitud.remitente.identificador} · {solicitud.remitente.email}
                    </p>
                  </td>
                  <td className="min-w-64 px-4 py-3 text-on-surface-secondary">
                    {solicitud.mensajeSolicitud}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onResponder(solicitud)}
                      aria-label={`Responder la solicitud de ${solicitud.remitente.nombre}`}
                      className="group relative flex h-11 w-11 items-center justify-center rounded-lg border border-transparent text-primary transition-all hover:border-border-strong hover:bg-surface-secondary hover:shadow-card focus-visible:border-border-strong focus-visible:bg-surface-secondary focus-visible:shadow-card sm:h-9 sm:w-9"
                    >
                      <Reply size={18} aria-hidden />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-surface-elevated px-2 py-1 text-xs font-medium text-on-surface opacity-0 shadow-dropdown transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                      >
                        Responder
                      </span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginadorListado
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        totalElements={totalElements}
        cantidadEnPagina={solicitudes.length}
        etiquetaPlural="solicitudes"
        onPageChange={onPageChange}
      />
    </div>
  );
}
