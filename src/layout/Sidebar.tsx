import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { ChevronsLeft } from 'lucide-react';
import { agruparNavItems, navItemsDelRol } from './nav-items';
import SidebarGrupo from './SidebarGrupo';
import { useCapacidades, useRolActivo } from '../hooks/useAuth';
import { LOGO_INSTITUCIONAL } from '../config/marca';

interface Props {
  onClose: () => void;
}

export default function Sidebar({ onClose }: Props) {
  const rolActivo = useRolActivo();
  const capacidades = useCapacidades();
  const { pathname } = useLocation();

  // Cierra el cajón al navegar en celular.
  useEffect(() => {
    if (window.innerWidth < 1024) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const { trabajo, proximamente } = agruparNavItems(
    navItemsDelRol(rolActivo, undefined, capacidades),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/50 px-4 sm:h-16">
        <img
          src={LOGO_INSTITUCIONAL.src}
          alt={LOGO_INSTITUCIONAL.alt}
          width={LOGO_INSTITUCIONAL.ancho}
          height={LOGO_INSTITUCIONAL.alto}
          className="h-9 w-auto max-w-full min-w-0 object-contain object-left"
        />

        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-secondary transition-colors hover:bg-primary-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
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
