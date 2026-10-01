import { Trash2 } from 'lucide-react';
import type { UsuarioRolListado } from '../../models/UsuarioRolListado';
import type { EstadoUsuario } from '../../models/EstadoUsuario';
import { nombreEstadoUsuario } from '../../utils/estados-usuario';
import PaginadorListado from './PaginadorListado';

interface Props<T extends UsuarioRolListado> {
  usuarios: T[];
  estados?: EstadoUsuario[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  titulo: string;
  etiquetaSingular: string;
  etiquetaPlural: string;
  onRemover?: (usuario: T) => void;
}

const COLUMNAS = ['Identificador', 'Nombre', 'Correo', 'Contacto', 'Estado', 'Vigente'];

export default function UsuariosRolTable<T extends UsuarioRolListado>({
  usuarios,
  estados,
  totalElements,
  totalPages,
  page,
  pageSize,
  onPageChange,
  titulo,
  etiquetaSingular,
  etiquetaPlural,
  onRemover,
}: Props<T>) {
  const columnas = onRemover ? [...COLUMNAS, 'Acciones'] : COLUMNAS;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm" aria-label={titulo}>
          <thead className="border-b border-border bg-surface-secondary">
            <tr>
              {columnas.map((columna) => (
                <th key={columna} scope="col" className="px-4 py-3 font-semibold text-on-surface">
                  {columna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {usuarios.length === 0 ? (
              <tr>
                <td
                  colSpan={columnas.length}
                  className="px-4 py-10 text-center text-sm text-on-surface-secondary"
                >
                  No hay {etiquetaPlural} registrados.
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="transition-colors hover:bg-nav-hover-bg">
                  <td className="px-4 py-3 text-on-surface">{usuario.identificador}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">{usuario.nombre}</td>
                  <td className="px-4 py-3 text-on-surface-secondary">{usuario.email}</td>
                  <td className="px-4 py-3 text-on-surface-secondary">{usuario.contacto}</td>
                  <td className="px-4 py-3 text-on-surface">{nombreEstadoUsuario(estados, usuario.estado)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        usuario.vigente
                          ? 'border-transparent bg-secondary-muted text-secondary-muted-foreground'
                          : 'border-border bg-surface-secondary text-on-surface-secondary',
                      ].join(' ')}
                    >
                      {usuario.vigente ? 'Vigente' : 'Dado de baja'}
                    </span>
                  </td>
                  {onRemover && (
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onRemover(usuario)}
                        disabled={!usuario.vigente}
                        aria-label={
                          usuario.vigente
                            ? `Quitar rol ${etiquetaSingular} a ${usuario.nombre}`
                            : `${usuario.nombre} ya no es ${etiquetaSingular} vigente`
                        }
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-secondary transition-colors hover:bg-nav-hover-bg hover:text-danger disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-on-surface-secondary sm:h-9 sm:w-9"
                      >
                        <Trash2 size={16} aria-hidden />
                      </button>
                    </td>
                  )}
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
        cantidadEnPagina={usuarios.length}
        etiquetaPlural={etiquetaPlural}
        onPageChange={onPageChange}
      />
    </div>
  );
}
