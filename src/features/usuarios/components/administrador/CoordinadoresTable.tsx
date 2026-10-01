import { Trash2 } from 'lucide-react';
import type { Coordinador } from '../../models/Coordinador';
import PaginadorListado from './PaginadorListado';

interface Props {
  coordinadores: Coordinador[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRemover: (coordinador: Coordinador) => void;
}

const COLUMNAS = ['Identificador', 'Nombre', 'Correo', 'Contacto', 'Estado', 'Vigente', 'Acciones'];

export default function CoordinadoresTable({
  coordinadores,
  totalElements,
  totalPages,
  page,
  pageSize,
  onPageChange,
  onRemover,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm" aria-label="Coordinadores">
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
            {coordinadores.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNAS.length}
                  className="px-4 py-10 text-center text-sm text-on-surface-secondary"
                >
                  No hay coordinadores registrados.
                </td>
              </tr>
            ) : (
              coordinadores.map((coordinador) => (
                <tr key={coordinador.id} className="transition-colors hover:bg-nav-hover-bg">
                  <td className="px-4 py-3 text-on-surface">{coordinador.identificador}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">{coordinador.nombre}</td>
                  <td className="px-4 py-3 text-on-surface-secondary">{coordinador.email}</td>
                  <td className="px-4 py-3 text-on-surface-secondary">{coordinador.contacto}</td>
                  <td className="px-4 py-3 text-on-surface">{coordinador.estado}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        coordinador.vigente
                          ? 'border-transparent bg-secondary-muted text-secondary-muted-foreground'
                          : 'border-border bg-surface-secondary text-on-surface-secondary',
                      ].join(' ')}
                    >
                      {coordinador.vigente ? 'Vigente' : 'Dado de baja'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onRemover(coordinador)}
                      disabled={!coordinador.vigente}
                      aria-label={
                        coordinador.vigente
                          ? `Quitar rol coordinador a ${coordinador.nombre}`
                          : `${coordinador.nombre} ya no es coordinador vigente`
                      }
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-secondary transition-colors hover:bg-nav-hover-bg hover:text-danger disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-on-surface-secondary sm:h-9 sm:w-9"
                    >
                      <Trash2 size={16} aria-hidden />
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
        cantidadEnPagina={coordinadores.length}
        etiquetaPlural="coordinadores"
        onPageChange={onPageChange}
      />
    </div>
  );
}
