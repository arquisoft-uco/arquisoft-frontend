import type { AutorDocumentacion } from '../models/biblioteca';
import { nombresDeAutores } from '../utils/autores-documentacion';

const SIN_TITULO = 'Sin título';
const SIN_AUTORES = 'Sin autores registrados';

const RECORTE = 'line-clamp-2 max-w-xs';
const RESPALDO = 'text-muted-foreground';

export function TituloProyecto({ titulo }: { titulo: string | null }) {
  if (!titulo?.trim()) return <span className={RESPALDO}>{SIN_TITULO}</span>;

  return (
    <span title={titulo} className={`${RECORTE} font-semibold text-on-surface`}>
      {titulo}
    </span>
  );
}

export function AutoresProyecto({ autores }: { autores: AutorDocumentacion[] }) {
  const nombres = nombresDeAutores(autores);
  if (!nombres) return <span className={RESPALDO}>{SIN_AUTORES}</span>;

  return (
    <span title={nombres} className={`${RECORTE} text-on-surface-secondary`}>
      {nombres}
    </span>
  );
}
