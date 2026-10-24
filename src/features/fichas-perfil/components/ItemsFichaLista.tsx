import type { ReactNode } from 'react';
import { ListChecks } from 'lucide-react';
import Badge from '../../../shared/components/ui/Badge';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Skeleton from '../../../shared/components/ui/Skeleton';
import type { Item } from '../models/fichas-perfil';

const LISTA = 'flex flex-col gap-3';
const TARJETA =
  'flex flex-col items-start gap-2 rounded-xl border border-border bg-surface p-3.5 shadow-card';
const CONTENIDO = 'w-full min-w-0 text-sm break-words text-on-surface';
const CON_ACCIONES = 'flex w-full items-start justify-between gap-2';
const TEXTOS = 'flex min-w-0 flex-1 flex-col items-start gap-2';
const INSIGNIAS = 'flex flex-wrap items-center gap-2';
const ACCIONES = 'flex shrink-0 gap-1';

interface Props {
  items: Item[] | undefined;
  cargando: boolean;
  error: boolean;
  onReintentar: () => void;
  acciones?: (item: Item) => ReactNode;
  insignias?: (item: Item) => ReactNode;
  vacio?: ReactNode;
}

export default function ItemsFichaLista({
  items,
  cargando,
  error,
  onReintentar,
  acciones,
  insignias,
  vacio,
}: Props) {
  if (error) {
    return (
      <ErrorState
        titulo="No se pudieron cargar los ítems"
        descripcion="Inténtalo nuevamente."
        onReintentar={onReintentar}
      />
    );
  }

  if (cargando || !items) return <Skeleton variante="tarjetas" etiqueta="Cargando ítems…" />;

  if (items.length === 0) {
    return vacio ?? <EmptyState icono={ListChecks} titulo="Esta ficha aún no tiene ítems." />;
  }

  return (
    <ul aria-label="Ítems de la ficha" className={LISTA}>
      {items.map((item) => {
        const extras = insignias?.(item);
        const textos = (
          <>
            <div className={INSIGNIAS}>
              <Badge variante="neutro">{item.tipoItem.nombre}</Badge>
              {extras}
            </div>
            <p className={CONTENIDO}>{item.contenido}</p>
          </>
        );
        return (
          <li key={item.id} className={TARJETA}>
            {acciones ? (
              <div className={CON_ACCIONES}>
                <div className={TEXTOS}>{textos}</div>
                <div className={ACCIONES}>{acciones(item)}</div>
              </div>
            ) : (
              textos
            )}
          </li>
        );
      })}
    </ul>
  );
}
