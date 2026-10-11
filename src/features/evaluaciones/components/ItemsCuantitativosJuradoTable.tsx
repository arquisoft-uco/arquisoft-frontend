import { useMemo } from 'react';
import { Calculator } from 'lucide-react';
import DataTable from '../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import type { CategoriaItemCuantitativoJurado } from '../models/CategoriaItemCuantitativoJurado';
import type { ItemCuantitativoJurado } from '../models/ItemCuantitativoJurado';

interface Props {
  items: ItemCuantitativoJurado[];
  categorias: CategoriaItemCuantitativoJurado[] | undefined;
}

const CATEGORIA_NO_DISPONIBLE = 'No disponible';

export default function ItemsCuantitativosJuradoTable({ items, categorias }: Props) {
  const nombrePorCategoria = useMemo(
    () => new Map((categorias ?? []).map((categoria) => [categoria.id, categoria.nombre])),
    [categorias],
  );

  function nombreDeCategoria(item: ItemCuantitativoJurado) {
    return nombrePorCategoria.get(item.categoriaId) ?? CATEGORIA_NO_DISPONIBLE;
  }

  const columnas: ColumnaTabla<ItemCuantitativoJurado>[] = [
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
      id: 'categoria',
      encabezado: 'Categoría',
      celda: (item) => <span className="text-on-surface-secondary">{nombreDeCategoria(item)}</span>,
    },
    {
      id: 'valor',
      encabezado: 'Valor máximo',
      celda: (item) => <span className="tabular-nums text-on-surface">{item.valor}</span>,
    },
  ];

  return (
    <DataTable
      etiqueta="Ítems cuantitativos del jurado"
      columnas={columnas}
      filas={items}
      idDeFila={(item) => item.id}
      tarjeta={(item) => (
        <>
          <p className="font-medium text-on-surface">{item.nombre}</p>
          <p className="text-sm text-on-surface-secondary">{item.descripcion}</p>
          <p className="text-sm text-on-surface-secondary">
            {nombreDeCategoria(item)} · Valor máximo: {item.valor}
          </p>
        </>
      )}
      vacio={<EmptyState icono={Calculator} titulo="No hay ítems cuantitativos registrados." />}
    />
  );
}
