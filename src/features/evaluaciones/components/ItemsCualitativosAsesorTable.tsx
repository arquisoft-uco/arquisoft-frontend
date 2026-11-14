import { ClipboardList } from 'lucide-react';
import DataTable from '../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import type { ItemCualitativoAsesor } from '../models/ItemCualitativoAsesor';

interface Props {
  items: ItemCualitativoAsesor[];
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
];

export default function ItemsCualitativosAsesorTable({ items }: Props) {
  return (
    <DataTable
      etiqueta="Ítems cualitativos del asesor"
      columnas={COLUMNAS}
      filas={items}
      idDeFila={(item) => String(item.id)}
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
