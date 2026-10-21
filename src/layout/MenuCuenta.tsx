import { LogOut } from 'lucide-react';
import { cerrarSesion } from '../auth/session';
import { useNombreUsuario, useRolActivo } from '../hooks/useAuth';
import Avatar from '../shared/components/ui/Avatar';
import { ETIQUETAS_ROL } from '../shared/models/rol';

const BOTON =
  'flex h-11 w-11 items-center justify-center rounded-full transition-all duration-150 hover:shadow-md active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-9 sm:w-9';
const MENU =
  'animate-scale-in absolute right-0 top-full z-50 mt-1.5 min-w-[210px] overflow-hidden rounded-xl border border-white/40 bg-white/85 shadow-dropdown backdrop-blur-xl';

interface Props {
  abierto: boolean;
  onAlternar: () => void;
  onCerrar: () => void;
}

export default function MenuCuenta({ abierto, onAlternar, onCerrar }: Props) {
  const { nombreCompleto } = useNombreUsuario();
  const rolActivo = useRolActivo();

  function logout() {
    onCerrar();
    // Revoca el token en el backend (blacklist Redis) y luego cierra la sesión SSO.
    void cerrarSesion();
  }

  return (
    <>
      <button
        className={BOTON}
        onClick={onAlternar}
        aria-expanded={abierto}
        aria-haspopup="true"
        aria-label="Menú de cuenta de usuario"
        type="button"
      >
        <Avatar nombre={nombreCompleto} />
      </button>

      {abierto && (
        <div className={MENU} role="menu">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-on-surface">{nombreCompleto}</p>
            <p className="mt-0.5 truncate text-xs text-on-surface-secondary">
              {rolActivo ? ETIQUETAS_ROL[rolActivo] : 'Sin rol'}
            </p>
          </div>
          <div className="p-1">
            <button
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-on-surface transition-colors hover:bg-danger/10 hover:text-danger focus-visible:bg-danger/10 focus-visible:text-danger focus-visible:outline-none"
              role="menuitem"
              onClick={logout}
              type="button"
            >
              <LogOut size={15} aria-hidden />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
}
