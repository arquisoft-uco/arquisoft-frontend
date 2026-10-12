import type { LucideIcon } from 'lucide-react';

export interface ItemPestana<T extends string> {
  id: T;
  etiqueta: string;
  contador?: number;
  icono?: LucideIcon;
  to?: string;
}

const CONTADOR = 'rounded-full px-2 py-px text-xs font-semibold';
const CONTADOR_ACTIVO = 'bg-primary-muted text-primary-muted-foreground';
const CONTADOR_INACTIVO = 'bg-muted text-muted-foreground';

interface Props<T extends string> {
  item: ItemPestana<T>;
  activa: boolean;
}

export default function ContenidoPestana<T extends string>({ item, activa }: Props<T>) {
  const Icono = item.icono;

  return (
    <>
      {Icono && <Icono size={16} aria-hidden />}
      {item.etiqueta}
      {item.contador !== undefined && (
        <span className={[CONTADOR, activa ? CONTADOR_ACTIVO : CONTADOR_INACTIVO].join(' ')}>
          {item.contador}
        </span>
      )}
    </>
  );
}
