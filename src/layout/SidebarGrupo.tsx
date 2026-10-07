import { useId } from 'react';
import { NavLink } from 'react-router';
import type { NavItem } from './nav-items';

const ETIQUETA =
  'mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-on-surface-secondary';
const ITEM = 'flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium';
const ENLACE = `nav-link group ${ITEM} outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1`;
const PROXIMAMENTE = `${ITEM} cursor-default text-on-surface-secondary opacity-70`;

interface Props {
  etiqueta: string;
  items: NavItem[];
  variante: 'trabajo' | 'proximamente';
}

export default function SidebarGrupo({ etiqueta, items, variante }: Props) {
  const idEtiqueta = useId();

  return (
    <div>
      <p id={idEtiqueta} className={ETIQUETA}>
        {etiqueta}
      </p>
      <ul aria-labelledby={idEtiqueta} className="flex flex-col gap-0.5">
        {items.map(({ path, label, icon: Icono }) => (
          <li key={path}>
            {variante === 'trabajo' ? (
              <NavLink
                to={path}
                className={({ isActive }) => [ENLACE, isActive ? 'nav-active' : ''].join(' ')}
              >
                <Icono size={17} className="nav-icon shrink-0" aria-hidden />
                <span>{label}</span>
              </NavLink>
            ) : (
              <span role="link" aria-disabled="true" className={PROXIMAMENTE}>
                <Icono size={17} className="shrink-0" aria-hidden />
                <span>{label}</span>
                <span className="sr-only">Próximamente</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
