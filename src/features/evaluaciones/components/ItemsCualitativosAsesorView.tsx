import ErrorState from '../../../shared/components/ui/ErrorState';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useItemsCualitativosAsesor } from '../hooks/useItemsCualitativosAsesor';
import ItemsCualitativosAsesorTable from './ItemsCualitativosAsesorTable';

export default function ItemsCualitativosAsesorView() {
  const { data, isLoading, isError, error, refetch } = useItemsCualitativosAsesor();

  return (
    <div className="flex flex-col gap-4">
      {isLoading && <Skeleton variante="tabla" etiqueta="Cargando ítems cualitativos del asesor" />}

      {isError && (
        <ErrorState
          titulo="No se pudieron cargar los ítems cualitativos del asesor."
          descripcion={getApiErrorMessage(error, 'Intenta nuevamente.')}
          onReintentar={() => void refetch()}
        />
      )}

      {data && <ItemsCualitativosAsesorTable items={data} />}
    </div>
  );
}
