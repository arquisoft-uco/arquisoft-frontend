import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { University, ChevronsLeft } from 'lucide-react';
import { agruparNavItems, navItemsDelRol } from './nav-items';
import SidebarGrupo from './SidebarGrupo';
import { useRolActivo } from '../hooks/useAuth';

interface Props {
  onClose: () => void;
}

export default function Sidebar({ onClose }: Props) {
  const rolActivo = useRolActivo();
  const { pathname } = useLocation();

  // Cierra el cajón al navegar en celular.
  useEffect(() => {
    if (window.innerWidth < 1024) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const { trabajo, proximamente } = agruparNavItems(navItemsDelRol(rolActivo));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/50 px-4 sm:h-16">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm">
            <University size={16} className="text-primary-foreground" aria-hidden />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-on-surface">ArquiSoft</span>
            <span className="text-xs text-on-surface-secondary">Gestión Académica</span>
          </div>
        </div>

        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-secondary transition-colors hover:bg-primary-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          onClick={onClose}
          aria-label="Ocultar menú de navegación"
          type="button"
        >
          <ChevronsLeft size={17} aria-hidden />
        </button>
      </div>

      <nav
        className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4"
        aria-label="Navegación principal"
      >
        <SidebarGrupo etiqueta="Trabajo" items={trabajo} variante="trabajo" />
        {proximamente.length > 0 && (
          <SidebarGrupo etiqueta="Próximamente" items={proximamente} variante="proximamente" />
        )}
      </nav>

      <div className="shrink-0 border-t border-border/50 px-4 py-3">
        <p className="text-xs text-on-surface-secondary">
          ArquiSoft &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
