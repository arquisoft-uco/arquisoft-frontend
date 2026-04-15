import { useState, useCallback, useEffect } from 'react';
import { Menu, UserCog, CircleUser, LogOut, ChevronDown, Check } from 'lucide-react';
import { keycloak } from '../keycloak';
import { useUsername, useRolActivo, useRolesDisponibles } from '../hooks/useAuth';
import { useRoleStore } from '../stores/roleStore';
import { ETIQUETAS_ROL, Rol } from '../shared/models/rol';

interface Props {
  onMenuToggle: () => void;
  isSidenavOpen: boolean;
}

export default function Header({ onMenuToggle, isSidenavOpen }: Props) {
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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenus(); };
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
      className="relative z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/50 bg-white/70 px-3 backdrop-blur-xl sm:h-16 sm:px-4"
      role="banner"
    >
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Ir al contenido principal
      </a>

      {!isSidenavOpen && (
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-secondary transition-all duration-150 hover:bg-primary-muted hover:text-primary active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={onMenuToggle}
          aria-label="Abrir menú de navegación"
          type="button"
        >
          <Menu size={19} aria-hidden />
        </button>
      )}

      <span className="flex-1" aria-hidden />

      {/* Role selector */}
      {tieneMultiplesRoles ? (
        <div className="relative">
          <button
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-on-surface transition-all duration-150 hover:border-primary/40 hover:bg-primary-muted hover:text-primary active:scale-[0.97] sm:text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={(e) => { e.stopPropagation(); setRolMenuOpen((v) => !v); setUserMenuOpen(false); }}
            aria-expanded={rolMenuOpen}
            aria-haspopup="true"
            aria-label={`Rol activo: ${etiquetaRolActivo}. Haz clic para cambiar.`}
            type="button"
          >
            <UserCog size={14} className="text-primary" aria-hidden />
            <span className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap sm:max-w-[160px]">
              {etiquetaRolActivo}
            </span>
            <ChevronDown
              size={13}
              className="shrink-0 text-on-surface-secondary transition-transform duration-150"
              aria-hidden
              style={{ transform: rolMenuOpen ? 'rotate(180deg)' : 'none' }}
            />
          </button>

          {rolMenuOpen && (
            <div
              className="animate-scale-in absolute right-0 top-full z-50 mt-1.5 min-w-[210px] overflow-hidden rounded-xl border border-white/40 bg-white/85 shadow-dropdown backdrop-blur-xl"
              role="menu"
              aria-label="Cambiar rol activo"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="border-b border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-on-surface-secondary">
                Cambiar rol
              </p>
              <div className="p-1">
                {rolesDisponibles.map((rol) => (
                  <button
                    key={rol}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-on-surface transition-colors hover:bg-primary-muted focus-visible:bg-primary-muted focus-visible:outline-none"
                    role="menuitem"
                    onClick={() => seleccionarRol(rol)}
                    type="button"
                  >
                    <span className={rolActivo === rol ? 'font-semibold text-primary' : ''}>
                      {ETIQUETAS_ROL[rol]}
                    </span>
                    {rolActivo === rol && <Check size={14} className="shrink-0 text-primary" aria-hidden />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : rolActivo ? (
        <span
          className="flex items-center gap-1.5 rounded-full bg-primary-muted px-3 py-1 text-xs font-semibold text-primary sm:text-sm"
          aria-label={`Rol activo: ${etiquetaRolActivo}`}
        >
          <UserCog size={13} aria-hidden />
          <span className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap sm:max-w-[160px]">
            {etiquetaRolActivo}
          </span>
        </span>
      ) : null}

      {/* User menu */}
      <div className="relative ml-1">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary-hover hover:shadow-md active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-9 sm:w-9"
          onClick={(e) => { e.stopPropagation(); setUserMenuOpen((v) => !v); setRolMenuOpen(false); }}
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
          aria-label="Menú de cuenta de usuario"
          type="button"
        >
          <CircleUser size={18} aria-hidden />
        </button>

        {userMenuOpen && (
          <div
            className="animate-scale-in absolute right-0 top-full z-50 mt-1.5 min-w-[210px] overflow-hidden rounded-xl border border-white/40 bg-white/85 shadow-dropdown backdrop-blur-xl"
            role="menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border px-4 py-3">
              <p className="truncate text-sm font-semibold text-on-surface">{username}</p>
              <p className="mt-0.5 truncate text-xs text-on-surface-secondary">{etiquetaRolActivo}</p>
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
      </div>
    </header>
  );
}

