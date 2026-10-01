import { Trash2 } from 'lucide-react';
import type { Estudiante } from '../../models/Estudiante';
import PaginadorListado from './PaginadorListado';

interface Props {
  estudiantes: Estudiante[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRemover: (estudiante: Estudiante) => void;
}

const COLUMNAS = ['Identificador', 'Nombre', 'Correo', 'Contacto', 'Estado', 'Vigente', 'Acciones'];

export default function EstudiantesTable({
  estudiantes,
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
        <table className="w-full text-left text-sm" aria-label="Estudiantes">
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
            {estudiantes.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNAS.length}
                  className="px-4 py-10 text-center text-sm text-on-surface-secondary"
                >
                  No hay estudiantes registrados.
                </td>
              </tr>
            ) : (
              estudiantes.map((estudiante) => (
                <tr key={estudiante.id} className="transition-colors hover:bg-nav-hover-bg">
                  <td className="px-4 py-3 text-on-surface">{estudiante.identificador}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">{estudiante.nombre}</td>
                  <td className="px-4 py-3 text-on-surface-secondary">{estudiante.email}</td>
                  <td className="px-4 py-3 text-on-surface-secondary">{estudiante.contacto}</td>
                  <td className="px-4 py-3 text-on-surface">{estudiante.estado}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        estudiante.vigente
                          ? 'border-transparent bg-secondary-muted text-secondary-muted-foreground'
                          : 'border-border bg-surface-secondary text-on-surface-secondary',
                      ].join(' ')}
                    >
                      {estudiante.vigente ? 'Vigente' : 'Dado de baja'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onRemover(estudiante)}
                      disabled={!estudiante.vigente}
                      aria-label={
                        estudiante.vigente
                          ? `Quitar rol estudiante a ${estudiante.nombre}`
                          : `${estudiante.nombre} ya no es estudiante vigente`
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
        cantidadEnPagina={estudiantes.length}
        etiquetaPlural="estudiantes"
        onPageChange={onPageChange}
      />
    </div>
  );
}
