import { Link } from 'react-router';
import Notice from '../../../shared/components/ui/Notice';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { useConteos } from '../hooks/useConteos';
import type { RecursoContable } from '../models/RecursoContable';
import CifraInicio from './CifraInicio';
import { LISTA, REJILLA_CIFRAS } from './disposicion';
import SeccionInicio from './SeccionInicio';

export interface Cifra {
  recurso: RecursoContable;
  etiqueta: string;
  destino?: string;
}

interface Props {
  titulo: string;
  cifras: readonly Cifra[];
  disposicion?: 'rejilla' | 'lista';
}

function formatear(valor?: number): string {
  return valor === undefined ? '—' : valor.toLocaleString('es-CO');
}

export default function CifrasPanel({ titulo, cifras, disposicion = 'rejilla' }: Props) {
  const { valores, cargando, hayError, reintentar } = useConteos(cifras.map((c) => c.recurso));

  return (
    <SeccionInicio titulo={titulo}>
      {cargando ? (
        <Skeleton variante="lineas" etiqueta="Cargando cifras…" />
      ) : (
        <div className="flex flex-col gap-4">
          {disposicion === 'rejilla' ? (
            <div className={REJILLA_CIFRAS}>
              {cifras.map((cifra, i) => (
                <CifraInicio key={cifra.recurso} {...cifra} valor={valores[i]} />
              ))}
            </div>
          ) : (
            <ul className={LISTA}>
              {cifras.map((cifra, i) => (
                <li
                  key={cifra.recurso}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  {cifra.destino ? (
                    <Link to={cifra.destino} className="font-medium text-primary hover:underline">
                      {cifra.etiqueta}
                    </Link>
                  ) : (
                    <span className="text-on-surface">{cifra.etiqueta}</span>
                  )}
                  <span className="font-semibold text-on-surface">{formatear(valores[i])}</span>
                </li>
              ))}
            </ul>
          )}
          {hayError && (
            <Notice variante="peligro" accion={{ etiqueta: 'Reintentar', onClick: reintentar }}>
              No pudimos cargar algunas cifras.
            </Notice>
          )}
        </div>
      )}
    </SeccionInicio>
  );
}
