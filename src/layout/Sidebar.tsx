import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router';
import { University, ChevronsLeft } from 'lucide-react';
import { NAV_ITEMS } from './nav-items';
import { useRolActivo } from '../hooks/useAuth';

interface Props {
  onClose: () => void;
}

export default function Sidebar({ onClose }: Props) {
  const rolActivo = useRolActivo();
  const { pathname } = useLocation();

  // Close drawer on navigation (mobile behaviour)
  useEffect(() => {
    if (window.innerWidth < 1024) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return rolActivo !== null && item.roles.includes(rolActivo);
  }).sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-full flex-col">
      {/* Sidebar header */}
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/50 px-4 sm:h-16">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm">
            <University size={16} className="text-primary-foreground" aria-hidden />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[14px] font-bold tracking-tight text-on-surface">ArquiSoft</span>
            <span className="text-[11px] text-on-surface-secondary">Gestión Académica</span>
          </div>
        </div>

        {/* Close / collapse button */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-secondary transition-colors hover:bg-primary-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          onClick={onClose}
          aria-label="Ocultar menú de navegación"
          type="button"
        >
          <ChevronsLeft size={17} aria-hidden />
        </button>
      </div>

      {/* Nav items */}
      <nav
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4"
        aria-label="Navegación principal"
      >
        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-secondary">
          Módulos
        </p>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  'nav-link group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                  isActive ? 'nav-active' : '',
                ].join(' ')
              }
            >
              <Icon size={17} className="nav-icon shrink-0" aria-hidden />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border/50 px-4 py-3">
        <p className="text-[11px] text-on-surface-secondary">
          ArquiSoft &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

