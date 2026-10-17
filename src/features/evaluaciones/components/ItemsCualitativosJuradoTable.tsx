import { ClipboardList, Pencil, Trash2 } from 'lucide-react';
import DataTable from '../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import IconButton from '../../../shared/components/ui/IconButton';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';

interface Props {
  items: ItemCualitativoJurado[];
  onEditar?: (item: ItemCualitativoJurado) => void;
  onRemover?: (item: ItemCualitativoJurado) => void;
}

const COLUMNAS: ColumnaTabla<ItemCualitativoJurado>[] = [
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
];

export default function ItemsCualitativosJuradoTable({ items, onEditar, onRemover }: Props) {
  return (
    <DataTable
      etiqueta="Ítems cualitativos del jurado"
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
        </>
      )}
      vacio={<EmptyState icono={ClipboardList} titulo="No hay ítems cualitativos registrados." />}
    />
  );
}
