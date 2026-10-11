import ErrorState from '../../../shared/components/ui/ErrorState';
import Notice from '../../../shared/components/ui/Notice';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useCategoriasItemCuantitativoJurado } from '../hooks/useCategoriasItemCuantitativoJurado';
import { useItemsCuantitativosJurado } from '../hooks/useItemsCuantitativosJurado';
import ItemsCuantitativosJuradoTable from './ItemsCuantitativosJuradoTable';

export default function ItemsCuantitativosJuradoView() {
  const { data, isLoading, isError, error, refetch } = useItemsCuantitativosJurado();
  const categorias = useCategoriasItemCuantitativoJurado();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-on-surface-secondary">
        Valores máximos con los que el jurado puntúa cada proyecto.
      </p>

      {isLoading && (
        <Skeleton variante="tabla" etiqueta="Cargando ítems cuantitativos del jurado" />
      )}

      {isError && (
        <ErrorState
          titulo="No se pudieron cargar los ítems cuantitativos del jurado."
          descripcion={getApiErrorMessage(error, 'Intenta nuevamente.')}
          onReintentar={() => void refetch()}
        />
      )}

      {data && categorias.isError && (
        <Notice variante="advertencia">No se pudieron cargar los nombres de las categorías.</Notice>
      )}

      {data && (
        <ItemsCuantitativosJuradoTable
          items={data}
          categorias={categorias.data}
          cargandoCategorias={categorias.isLoading}
        />
      )}
    </div>
  );
}
