import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useItemsCualitativosJurado } from '../hooks/useItemsCualitativosJurado';
import ItemsCualitativosJuradoTable from './ItemsCualitativosJuradoTable';

export default function ItemsCualitativosJuradoView() {
  const { data, isLoading, isError, error, refetch } = useItemsCualitativosJurado();

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        titulo="Ítems cualitativos del jurado"
        descripcion="Criterios con los que el jurado valora cada proyecto."
      />

      {isLoading && <Skeleton variante="tabla" etiqueta="Cargando ítems cualitativos del jurado" />}

      {isError && (
        <ErrorState
          titulo="No se pudieron cargar los ítems cualitativos del jurado."
          descripcion={getApiErrorMessage(error, 'Intenta nuevamente.')}
          onReintentar={() => void refetch()}
        />
      )}

      {data && <ItemsCualitativosJuradoTable items={data} />}
    </div>
  );
}
