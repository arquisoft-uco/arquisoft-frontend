import type { Usuario } from '../../models/Usuario';
import { ETIQUETAS_ROL, Rol } from '../../../../shared/models/rol';
import PaginadorListado from './PaginadorListado';

interface Props {
  usuarios: Usuario[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const COLUMNAS = [
  'Identificador',
  'Nombre',
  'Correo',
  'Contacto',
  'Estado',
  'Vigente',
  'Roles',
];

const ROLES_INSIGNIA: { rol: Rol; campo: keyof Usuario }[] = [
  { rol: Rol.Estudiante, campo: 'esEstudiante' },
  { rol: Rol.Asesor, campo: 'esAsesor' },
  { rol: Rol.AsesorFicha, campo: 'esAsesorFicha' },
  { rol: Rol.Coordinador, campo: 'esCoordinador' },
  { rol: Rol.RepresentanteComiteCurriculum, campo: 'esRepresentanteComite' },
  { rol: Rol.Administrador, campo: 'esAdministrador' },
];

function rolesDe(usuario: Usuario): Rol[] {
  return ROLES_INSIGNIA.filter(({ campo }) => usuario[campo] === true).map(({ rol }) => rol);
}

export default function UsuariosTable({
  usuarios,
  totalElements,
  totalPages,
  page,
  pageSize,
  onPageChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm" aria-label="Todos los usuarios">
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
            {usuarios.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNAS.length}
                  className="px-4 py-10 text-center text-sm text-on-surface-secondary"
                >
                  No hay usuarios que coincidan con el filtro.
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="transition-colors hover:bg-nav-hover-bg">
                  <td className="px-4 py-3 text-on-surface">{usuario.identificador}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">{usuario.nombre}</td>
                  <td className="px-4 py-3 text-on-surface-secondary">{usuario.email}</td>
                  <td className="px-4 py-3 text-on-surface-secondary">{usuario.contacto}</td>
                  <td className="px-4 py-3 text-on-surface">{usuario.estado}</td>
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
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {rolesDe(usuario).map((rol) => (
                        <span
                          key={rol}
                          className="inline-flex items-center rounded-full border border-transparent bg-primary-muted px-2.5 py-0.5 text-xs font-medium text-primary-muted-foreground"
                        >
                          {ETIQUETAS_ROL[rol]}
                        </span>
                      ))}
                    </div>
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
        cantidadEnPagina={usuarios.length}
        etiquetaPlural="usuarios"
        onPageChange={onPageChange}
      />
    </div>
  );
}
