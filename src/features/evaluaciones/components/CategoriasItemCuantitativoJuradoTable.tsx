import { Tags } from 'lucide-react';
import DataTable from '../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import type { CategoriaItemCuantitativoJurado } from '../models/CategoriaItemCuantitativoJurado';

interface Props {
  categorias: CategoriaItemCuantitativoJurado[];
}

const COLUMNAS: ColumnaTabla<CategoriaItemCuantitativoJurado>[] = [
  {
    id: 'nombre',
    encabezado: 'Nombre',
    celda: (categoria) => <span className="font-medium text-on-surface">{categoria.nombre}</span>,
  },
  {
    id: 'descripcion',
    encabezado: 'Descripción',
    celda: (categoria) => (
      <span className="text-on-surface-secondary">{categoria.descripcion}</span>
    ),
  },
];

export default function CategoriasItemCuantitativoJuradoTable({ categorias }: Props) {
  return (
    <DataTable
      etiqueta="Categorías de ítems cuantitativos del jurado"
      columnas={COLUMNAS}
      filas={categorias}
      idDeFila={(categoria) => categoria.id}
      tarjeta={(categoria) => (
        <>
          <p className="font-medium text-on-surface">{categoria.nombre}</p>
          <p className="text-sm text-on-surface-secondary">{categoria.descripcion}</p>
        </>
      )}
      vacio={<EmptyState icono={Tags} titulo="No hay categorías registradas." />}
    />
  );
}
