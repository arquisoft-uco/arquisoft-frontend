import { ETIQUETAS_ROL, Rol } from '../../../../shared/models/rol';

// Cada HU de agregar rol habilita el suyo añadiendo una entrada aquí y un método de service.
const ROLES_AGREGABLES: Partial<Record<Rol, true>> = {
  [Rol.Coordinador]: true,
  [Rol.Estudiante]: true,
};

// Cada HU de quitar rol habilita el suyo añadiendo una entrada aquí y un método de service.
const ROLES_QUITABLES: Partial<Record<Rol, true>> = {
  [Rol.Coordinador]: true,
  [Rol.Estudiante]: true,
};

interface Props {
  rolesAsignados: ReadonlySet<Rol>;
  pendiente: boolean;
  onAgregar: (rol: Rol) => void;
  onQuitar: (rol: Rol) => void;
}

export default function RolesUsuarioFieldset({
  rolesAsignados,
  pendiente,
  onAgregar,
  onQuitar,
}: Props) {
  return (
    <fieldset aria-busy={pendiente}>
      <legend className="mb-1 text-xs font-medium text-on-surface-secondary">
        Roles (se pueden agregar y quitar coordinador y estudiante)
      </legend>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {Object.values(Rol).map((rol) => {
          const asignado = rolesAsignados.has(rol);
          const agregable = !asignado && ROLES_AGREGABLES[rol] === true;
          const quitable = asignado && ROLES_QUITABLES[rol] === true;
          const bloqueado = asignado && !quitable;
          const noDisponible = !asignado && !agregable;
          return (
            <label
              key={rol}
              className={[
                'tap-target gap-2 text-sm text-on-surface',
                bloqueado || noDisponible ? 'cursor-not-allowed opacity-60' : '',
              ].join(' ')}
            >
              <input
                type="checkbox"
                value={rol}
                checked={asignado}
                disabled={(agregable || quitable) && pendiente}
                aria-disabled={bloqueado || noDisponible}
                aria-busy={(agregable || quitable) && pendiente}
                onChange={(evento) => {
                  if (agregable && evento.target.checked) onAgregar(rol);
                  if (quitable && !evento.target.checked) onQuitar(rol);
                }}
                className="checkbox-control rounded border-border text-primary focus:ring-primary"
              />
              {ETIQUETAS_ROL[rol]}
              {noDisponible && (
                <span className="text-xs text-on-surface-secondary">(Aún no disponible)</span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
