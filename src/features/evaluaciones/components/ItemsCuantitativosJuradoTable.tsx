import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Calculator, Pencil, Trash2 } from 'lucide-react';
import DataTable from '../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import IconButton from '../../../shared/components/ui/IconButton';
import type { CategoriaItemCuantitativoJurado } from '../models/CategoriaItemCuantitativoJurado';
import type { ItemCuantitativoJurado } from '../models/ItemCuantitativoJurado';

interface Props {
  items: ItemCuantitativoJurado[];
  categorias: CategoriaItemCuantitativoJurado[] | undefined;
  cargandoCategorias: boolean;
  onEditar?: (item: ItemCuantitativoJurado) => void;
  onRemover?: (item: ItemCuantitativoJurado) => void;
}

const CATEGORIA_NO_DISPONIBLE = 'No disponible';

const CATEGORIA_CARGANDO = (
  <>
    <span aria-hidden="true">—</span>
    <span className="sr-only">Cargando categoría</span>
  </>
);

export default function ItemsCuantitativosJuradoTable({
  items,
  categorias,
  cargandoCategorias,
  onEditar,
  onRemover,
}: Props) {
  const nombrePorCategoria = useMemo(
    () => new Map((categorias ?? []).map((categoria) => [categoria.id, categoria.nombre])),
    [categorias],
  );

  function nombreDeCategoria(item: ItemCuantitativoJurado): ReactNode {
    if (cargandoCategorias) return CATEGORIA_CARGANDO;
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
          <p className="text-sm text-on-surface-secondary">
            {nombreDeCategoria(item)} · Valor máximo: {item.valor}
          </p>
        </>
      )}
      vacio={<EmptyState icono={Calculator} titulo="No hay ítems cuantitativos registrados." />}
    />
  );
}
