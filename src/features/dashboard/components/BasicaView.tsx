import { Link } from 'react-router';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import EmptyState from '../../../shared/components/ui/EmptyState';
import { ETIQUETAS_ROL } from '../../../shared/models/rol';
import { useRolActivo } from '../../../hooks/useAuth';
import { estaDisponible, navItemsDelRol } from '../../../layout/nav-items';
import { PAGINA } from './disposicion';
import EncabezadoInicio from './EncabezadoInicio';

const TARJETA_ENLACE =
  'group flex min-h-11 items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-card transition-shadow hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

export default function BasicaView() {
  const rolActivo = useRolActivo();
  const modulos = navItemsDelRol(rolActivo).filter(
    (item) => estaDisponible(item) && item.path !== '/dashboard',
  );
  const frase = rolActivo
    ? `Estos son los módulos disponibles para tu rol de ${ETIQUETAS_ROL[rolActivo]}.`
    : undefined;

  return (
    <div className={PAGINA}>
      <EncabezadoInicio frase={frase} />
      {modulos.length === 0 ? (
        <EmptyState icono={LayoutGrid} titulo="Aún no hay módulos disponibles para tu rol" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modulos.map(({ path, label, icon: Icono }) => (
            <li key={path}>
              <Link to={path} className={TARJETA_ENLACE}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">
                  <Icono size={20} aria-hidden />
                </span>
                <span className="flex-1 font-medium text-on-surface">{label}</span>
                <ArrowRight size={16} className="text-on-surface-secondary" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
