import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';

interface Miga {
  etiqueta: string;
  to?: string;
  onClick?: (evento: MouseEvent<HTMLAnchorElement>) => void;
}

const RAIZ = 'flex flex-col gap-4';
const FILA = 'flex flex-wrap items-end justify-between gap-4';
const TITULO = 'text-xl font-bold text-on-surface sm:text-2xl';
const DESCRIPCION = 'mt-1 text-sm text-on-surface-secondary';
const MIGAS = 'flex flex-wrap items-center gap-1.5 text-[13px] text-on-surface-secondary';
const MIGA_ACTUAL = 'font-medium text-on-surface';

interface Props {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
  migas?: Miga[];
}

export default function PageHeader({ titulo, descripcion, acciones, migas }: Props) {
  return (
    <div className={RAIZ}>
      {migas && migas.length > 0 && (
        <nav aria-label="Ruta de navegación">
          <ol className={MIGAS}>
            {migas.map(({ etiqueta, to, onClick }, indice) => {
              const actual = indice === migas.length - 1;
              return (
                <li key={etiqueta} className="inline-flex items-center gap-1.5">
                  {to && !actual ? (
                    <Link
                      to={to}
                      onClick={onClick}
                      className="hover:text-on-surface hover:underline"
                    >
                      {etiqueta}
                    </Link>
                  ) : (
                    <span
                      aria-current={actual ? 'page' : undefined}
                      className={actual ? MIGA_ACTUAL : undefined}
                    >
                      {etiqueta}
                    </span>
                  )}
                  {!actual && <ChevronRight size={14} aria-hidden />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      <div className={FILA}>
        <div className="min-w-0">
          <h1 className={TITULO}>{titulo}</h1>
          {descripcion && <p className={DESCRIPCION}>{descripcion}</p>}
        </div>
        {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
      </div>
    </div>
  );
}
