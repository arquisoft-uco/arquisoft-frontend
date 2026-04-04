import { useState, useCallback, useEffect } from 'react';
import { Menu, UserCog, CircleUser, LogOut, ChevronDown } from 'lucide-react';
import { keycloak } from '../keycloak';
import { useUsername, useRolActivo, useRolesDisponibles } from '../hooks/useAuth';
import { useRoleStore } from '../stores/roleStore';
import { ETIQUETAS_ROL, Rol } from '../shared/models/rol';

interface Props {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: Props) {
  const username = useUsername();
  const rolActivo = useRolActivo();
  const rolesDisponibles = useRolesDisponibles();
  const setRolSeleccionado = useRoleStore((s) => s.setRolSeleccionado);

  const [rolMenuOpen, setRolMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const closeMenus = useCallback(() => {
    setRolMenuOpen(false);
    setUserMenuOpen(false);
  }, []);

  // Close on Escape or outside click — equivalent to Angular HostListener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenus();
    };
    const onClick = () => closeMenus();
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onClick);
    };
  }, [closeMenus]);

  const etiquetaRolActivo = rolActivo ? ETIQUETAS_ROL[rolActivo] : 'Sin rol';
  const tieneMultiplesRoles = rolesDisponibles.length > 1;

  function seleccionarRol(rol: Rol) {
    setRolSeleccionado(rol);
    closeMenus();
  }

  function logout() {
    closeMenus();
    keycloak.logout({ redirectUri: window.location.origin });
  }

  return (
    <header
      className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-surface px-4"
      role="banner"
    >
      <button
        className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-secondary transition-colors duration-150 hover:bg-primary-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={onMenuToggle}
        aria-label="Alternar menú de navegación"
        type="button"
      >
        <Menu size={20} aria-hidden />
      </button>

      <div className="ml-1 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">A</span>
        </div>
        <div className="hidden sm:block">
          <span className="text-base font-bold tracking-tight text-on-surface">ArquiSoft</span>
          <span className="ml-1.5 text-xs text-on-surface-secondary">Portal Académico</span>
        </div>
      </div>

      <span className="flex-1" aria-hidden />

      {/* Role selector or role badge */}
      {tieneMultiplesRoles ? (
        <div className="relative">
          <button
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={(e) => {
              e.stopPropagation();
              setRolMenuOpen((v) => !v);
              setUserMenuOpen(false);
            }}
            aria-expanded={rolMenuOpen}
            aria-haspopup="true"
            aria-label={`Rol activo: ${etiquetaRolActivo}. Haz clic para cambiar.`}
            title={`Rol activo: ${etiquetaRolActivo}`}
            type="button"
          >
            <UserCog size={16} className="text-primary" aria-hidden />
            <span className="max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">
              {etiquetaRolActivo}
            </span>
            <ChevronDown
              size={14}
              className="text-on-surface-secondary"
              aria-hidden
              style={{
                transform: rolMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease-out',
              }}
            />
          </button>

          {rolMenuOpen && (
            <div
              className="animate-scale-in absolute right-0 top-full z-50 mt-1.5 min-w-[200px] overflow-hidden rounded-xl border border-border bg-surface shadow-dropdown"
              role="menu"
              aria-label="Cambiar rol activo"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-on-surface-secondary">
                Cambiar rol
              </div>
              {rolesDisponibles.map((rol) => (
                <button
                  key={rol}
                  className={[
                    'flex w-full items-center px-3 py-2.5 text-sm text-on-surface transition-colors hover:bg-primary-muted focus-visible:bg-primary-muted focus-visible:outline-none',
                    rolActivo === rol ? 'font-semibold text-primary bg-primary-muted' : '',
                  ].join(' ')}
                  role="menuitem"
                  onClick={() => seleccionarRol(rol)}
                  type="button"
                >
                  {ETIQUETAS_ROL[rol]}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <span
          className="flex items-center gap-1.5 rounded-lg bg-primary-muted px-3 py-1.5 text-sm font-medium text-primary"
          aria-label={`Rol activo: ${etiquetaRolActivo}`}
        >
          <UserCog size={16} aria-hidden />
          <span className="max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">
            {etiquetaRolActivo}
          </span>
        </span>
      )}

      {/* User menu */}
      <div className="relative ml-1">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={(e) => {
            e.stopPropagation();
            setUserMenuOpen((v) => !v);
            setRolMenuOpen(false);
          }}
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
          aria-label="Menú de cuenta de usuario"
          type="button"
        >
          <CircleUser size={20} aria-hidden />
        </button>

        {userMenuOpen && (
          <div
            className="animate-scale-in absolute right-0 top-full z-50 mt-1.5 min-w-[200px] overflow-hidden rounded-xl border border-border bg-surface shadow-dropdown"
            role="menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-on-surface">{username}</p>
              <p className="text-xs text-on-surface-secondary">{etiquetaRolActivo}</p>
            </div>
            <div className="p-1">
              <button
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-on-surface transition-colors hover:bg-primary-muted focus-visible:bg-primary-muted focus-visible:outline-none"
                role="menuitem"
                onClick={logout}
                type="button"
              >
                <LogOut size={16} className="text-on-surface-secondary" aria-hidden />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
