import { UserCog, ChevronDown, Check } from 'lucide-react';
import { useRoleStore } from '../auth/roleStore';
import { useRolActivo, useRolesDisponibles } from '../hooks/useAuth';
import { ETIQUETAS_ROL } from '../shared/models/rol';
import type { Rol } from '../shared/models/rol';

const BOTON =
  'flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-on-surface transition-all duration-150 hover:border-primary/40 hover:bg-primary-muted hover:text-primary active:scale-[0.97] sm:text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const MENU =
  'animate-scale-in absolute right-0 top-full z-50 mt-1.5 min-w-[210px] overflow-hidden rounded-xl border border-white/40 bg-white/85 shadow-dropdown backdrop-blur-xl';
const OPCION =
  'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-on-surface transition-colors hover:bg-primary-muted focus-visible:bg-primary-muted focus-visible:outline-none';
const ETIQUETA_TRUNCADA =
  'max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap sm:max-w-[160px]';

interface Props {
  abierto: boolean;
  onAlternar: () => void;
  onCerrar: () => void;
}

export default function SelectorRol({ abierto, onAlternar, onCerrar }: Props) {
  const rolActivo = useRolActivo();
  const rolesDisponibles = useRolesDisponibles();
  const setRolSeleccionado = useRoleStore((s) => s.setRolSeleccionado);
  const etiquetaRolActivo = rolActivo ? ETIQUETAS_ROL[rolActivo] : 'Sin rol';

  function seleccionarRol(rol: Rol) {
    setRolSeleccionado(rol);
    onCerrar();
  }

  if (rolesDisponibles.length <= 1) {
    if (!rolActivo) return null;
    return (
      <span
        className="flex items-center gap-1.5 rounded-full bg-primary-muted px-3 py-1 text-xs font-semibold text-primary sm:text-sm"
        aria-label={`Rol activo: ${etiquetaRolActivo}`}
      >
        <UserCog size={13} aria-hidden />
        <span className={ETIQUETA_TRUNCADA}>{etiquetaRolActivo}</span>
      </span>
    );
  }

  return (
    <>
      <button
        className={BOTON}
        onClick={onAlternar}
        aria-expanded={abierto}
        aria-haspopup="true"
        aria-label={`Rol activo: ${etiquetaRolActivo}. Haz clic para cambiar.`}
        type="button"
      >
        <UserCog size={14} className="text-primary" aria-hidden />
        <span className={ETIQUETA_TRUNCADA}>{etiquetaRolActivo}</span>
        <ChevronDown
          size={13}
          className={[
            'shrink-0 text-on-surface-secondary transition-transform duration-150',
            abierto ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden
        />
      </button>

      {abierto && (
        <div className={MENU} role="menu" aria-label="Cambiar rol activo">
          <p className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-surface-secondary">
            Cambiar rol
          </p>
          <div className="p-1">
            {rolesDisponibles.map((rol) => (
              <button
                key={rol}
                className={OPCION}
                role="menuitem"
                onClick={() => seleccionarRol(rol)}
                type="button"
              >
                <span className={rolActivo === rol ? 'font-semibold text-primary' : ''}>
                  {ETIQUETAS_ROL[rol]}
                </span>
                {rolActivo === rol && (
                  <Check size={14} className="shrink-0 text-primary" aria-hidden />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
