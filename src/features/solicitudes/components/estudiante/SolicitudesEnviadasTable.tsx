import { Trash2 } from 'lucide-react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import type { Solicitud } from '../../models/Solicitud';

interface Props {
  solicitudes: Solicitud[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  eliminando: boolean;
  onPageChange: (page: number) => void;
  onEliminar: (solicitud: Solicitud) => void;
}

const COLUMNAS = ['Fecha de envío', 'Destinatario', 'Mensaje', 'Acciones'];

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

export default function SolicitudesEnviadasTable({
  solicitudes,
  totalElements,
  totalPages,
  page,
  pageSize,
  eliminando,
  onPageChange,
  onEliminar,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table
          className="w-full text-left text-sm"
          aria-label="Solicitudes de novedad enviadas al coordinador"
        >
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
                  Aún no has enviado solicitudes de novedad al coordinador.
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
                    <p className="font-medium text-on-surface">{solicitud.destinatario.nombre}</p>
                    <p className="text-xs text-on-surface-secondary">
                      {solicitud.destinatario.identificador} · {solicitud.destinatario.email}
                    </p>
                  </td>
                  <td className="min-w-64 px-4 py-3 text-on-surface-secondary">
                    {solicitud.mensajeSolicitud}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onEliminar(solicitud)}
                      disabled={eliminando}
                      aria-label={`Eliminar la solicitud enviada a ${solicitud.destinatario.nombre}`}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-transparent text-danger transition-all hover:border-border-strong hover:bg-surface-secondary hover:shadow-card focus-visible:border-border-strong focus-visible:bg-surface-secondary focus-visible:shadow-card disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-transparent disabled:hover:bg-transparent disabled:hover:shadow-none sm:h-9 sm:w-9"
                    >
                      <Trash2 size={18} aria-hidden />
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
