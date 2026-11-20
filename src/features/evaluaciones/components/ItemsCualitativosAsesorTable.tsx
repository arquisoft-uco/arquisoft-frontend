import { ClipboardList, Pencil, Trash2 } from 'lucide-react';
import DataTable from '../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import IconButton from '../../../shared/components/ui/IconButton';
import type { ItemCualitativoAsesor } from '../models/ItemCualitativoAsesor';

interface Props {
  items: ItemCualitativoAsesor[];
  onEditar?: (item: ItemCualitativoAsesor) => void;
  onRemover?: (item: ItemCualitativoAsesor) => void;
}

const COLUMNAS: ColumnaTabla<ItemCualitativoAsesor>[] = [
  {
    id: 'nombre',
    encabezado: 'Nombre',
    celda: (item) => <span className="font-medium text-on-surface">{item.nombre}</span>,
  },
  {
    id: 'descripcion',
    encabezado: 'Descripción',
    celda: (item) => <span className="text-on-surface-secondary">{item.descripcion}</span>,
  },
  {
    id: 'peso',
    encabezado: 'Peso',
    celda: (item) => <span className="tabular-nums text-on-surface">{item.peso}</span>,
  },
];

export default function ItemsCualitativosAsesorTable({ items, onEditar, onRemover }: Props) {
  return (
    <DataTable
      etiqueta="Ítems cualitativos del asesor"
      columnas={COLUMNAS}
      filas={items}
      idDeFila={(item) => String(item.id)}
      acciones={
        (onEditar || onRemover) &&
        ((item) => (
          <div className="flex shrink-0 items-center justify-end gap-1">
            {onEditar && (
              <IconButton
                etiqueta={`Editar ítem ${item.nombre}`}
                icono={Pencil}
                rotulo="Editar"
                onClick={() => onEditar(item)}
              />
            )}
            {onRemover && (
              <IconButton
                etiqueta={`Remover ítem ${item.nombre}`}
                icono={Trash2}
                tono="peligro"
                rotulo="Remover"
                onClick={() => onRemover(item)}
              />
            )}
          </div>
        ))
      }
      tarjeta={(item) => (
        <>
          <p className="font-medium text-on-surface">{item.nombre}</p>
          <p className="text-sm text-on-surface-secondary">{item.descripcion}</p>
          <p className="text-sm tabular-nums text-on-surface-secondary">Peso: {item.peso}</p>
        </>
      )}
      vacio={<EmptyState icono={ClipboardList} titulo="No hay ítems cualitativos registrados." />}
    />
  );
}
