import Avatar from '../../../../shared/components/ui/Avatar';
import Badge from '../../../../shared/components/ui/Badge';
import { ETIQUETAS_ROL } from '../../../../shared/models/rol';
import { varianteEstadoUsuario } from '../../../../shared/utils/estado-variante';
import type { EstadoUsuario } from '../../models/EstadoUsuario';
import type { Usuario } from '../../models/Usuario';
import { nombreEstadoUsuario } from '../../utils/estados-usuario';
import { rolesDeUsuario } from '../../utils/roles-usuario';

const ROLES_VISIBLES = 2;

const IDENTIDAD = 'flex min-w-0 items-center gap-3 sm:max-w-56';
const TEXTOS = 'flex min-w-0 flex-col';
const TITULO =
  'block truncate text-left font-semibold text-on-surface hover:text-primary hover:underline hover:underline-offset-4';
const SUBTEXTO = 'block truncate text-[13px] text-on-surface-secondary';
const ROLES = 'flex flex-wrap items-center gap-1.5';
const SIN_ROLES = 'text-sm text-on-surface-secondary';

interface PropsIdentidad {
  usuario: Usuario;
  onEditar: (usuario: Usuario) => void;
}

export function IdentidadUsuario({ usuario, onEditar }: PropsIdentidad) {
  return (
    <div className={IDENTIDAD}>
      <Avatar nombre={usuario.nombre} />
      <div className={TEXTOS}>
        <button
          type="button"
          aria-label={`Editar ${usuario.nombre}`}
          title={usuario.nombre}
          onClick={() => onEditar(usuario)}
          className={TITULO}
        >
          {usuario.nombre}
        </button>
        <span className={SUBTEXTO} title={usuario.email}>
          {usuario.email}
        </span>
      </div>
    </div>
  );
}

interface PropsRoles {
  usuario: Usuario;
}

export function InsigniasRol({ usuario }: PropsRoles) {
  const roles = rolesDeUsuario(usuario);
  if (roles.length === 0) return <span className={SIN_ROLES}>Sin roles</span>;

  const restantes = roles.slice(ROLES_VISIBLES);
  const nombresRestantes = restantes.map((rol) => ETIQUETAS_ROL[rol]).join(', ');

  return (
    <div className={ROLES}>
      {roles.slice(0, ROLES_VISIBLES).map((rol) => (
        <Badge key={rol} variante="info">
          {ETIQUETAS_ROL[rol]}
        </Badge>
      ))}
      {restantes.length > 0 && (
        <span title={nombresRestantes}>
          <Badge variante="neutro">
            {`+${restantes.length}`}
            <span className="sr-only">{`: ${nombresRestantes}`}</span>
          </Badge>
        </span>
      )}
    </div>
  );
}

interface PropsEstado {
  usuario: Usuario;
  estados?: EstadoUsuario[];
}

export function InsigniaEstadoUsuario({ usuario, estados }: PropsEstado) {
  const texto = usuario.vigente ? nombreEstadoUsuario(estados, usuario.estado) : 'Dado de baja';

  return <Badge variante={varianteEstadoUsuario(usuario.estado, usuario.vigente)}>{texto}</Badge>;
}
