import { NavLink } from 'react-router';
import { University } from 'lucide-react';
import { NAV_ITEMS } from './nav-items';
import { useRolActivo } from '../hooks/useAuth';

export default function Sidebar() {
  const rolActivo = useRolActivo();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return rolActivo !== null && item.roles.includes(rolActivo);
  }).sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
          <University size={18} className="text-primary-foreground" aria-hidden />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-on-surface">ArquiSoft</span>
          <span className="text-[11px] leading-tight text-on-surface-secondary">
            Gestión Académica
          </span>
        </div>
      </div>

      <nav
        className="flex flex-col gap-0.5 px-3 pt-4 pb-3"
        aria-label="Navegación principal"
      >
        <span className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-on-surface-secondary">
          Módulos
        </span>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  'nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                  isActive ? 'nav-active' : '',
                ].join(' ')
              }
              aria-label={item.label}
            >
              <Icon size={18} className="nav-icon shrink-0" aria-hidden />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
