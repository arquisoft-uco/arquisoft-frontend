import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import MenuCuenta from './MenuCuenta';
import SelectorRol from './SelectorRol';
import { useClicFuera } from '../shared/hooks/useClicFuera';

type MenuAbierto = 'rol' | 'cuenta' | null;

interface Props {
  onMenuToggle: () => void;
  isSidenavOpen: boolean;
}

export default function Header({ onMenuToggle, isSidenavOpen }: Props) {
  const [menuAbierto, setMenuAbierto] = useState<MenuAbierto>(null);
  const refRol = useRef<HTMLDivElement>(null);
  const refCuenta = useRef<HTMLDivElement>(null);

  const cerrar = () => setMenuAbierto(null);
  const alternar = (menu: Exclude<MenuAbierto, null>) =>
    setMenuAbierto((actual) => (actual === menu ? null : menu));

  useClicFuera(menuAbierto !== null, [refRol, refCuenta], cerrar);

  useEffect(() => {
    const alPulsarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuAbierto(null);
    };
    document.addEventListener('keydown', alPulsarTecla);
    return () => document.removeEventListener('keydown', alPulsarTecla);
  }, []);

  return (
    <header
      className="relative z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border/50 bg-white/70 px-3 backdrop-blur-xl sm:h-16 sm:px-4"
      role="banner"
    >
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

      <div ref={refRol} className="relative">
        <SelectorRol
          abierto={menuAbierto === 'rol'}
          onAlternar={() => alternar('rol')}
          onCerrar={cerrar}
        />
      </div>

      <div ref={refCuenta} className="relative ml-1">
        <MenuCuenta
          abierto={menuAbierto === 'cuenta'}
          onAlternar={() => alternar('cuenta')}
          onCerrar={cerrar}
        />
      </div>
    </header>
  );
}
