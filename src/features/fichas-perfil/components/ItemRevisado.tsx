import type { Item } from '../models/fichas-perfil';

const IDENTIDAD = 'flex min-w-0 flex-col';
const TITULO = 'font-semibold text-on-surface';
const SUBTEXTO = 'line-clamp-2 text-[13px] text-on-surface-secondary';

export default function ItemRevisado({ item }: { item: Item | undefined }) {
  return (
    <div className={IDENTIDAD}>
      <span className={TITULO}>{item?.tipoItem.nombre ?? 'Ítem no disponible'}</span>
      {item && <span className={SUBTEXTO}>{item.contenido}</span>}
    </div>
  );
}
