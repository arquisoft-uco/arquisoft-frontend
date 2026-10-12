import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useAsesoresProyectoGrado } from '../../hooks/useAsesoresProyectoGrado';
import AsesoresProyectoGradoTable from './AsesoresProyectoGradoTable';

interface Props {
  proyectoGradoId: string;
}

export default function AsesoresProyectoGradoPanel({ proyectoGradoId }: Props) {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useAsesoresProyectoGrado(proyectoGradoId);

  return (
    <div aria-busy={isFetching}>
      {isError ? (
        <ErrorState
          titulo="No se pudieron cargar los asesores"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={refetch}
        />
      ) : (
        <AsesoresProyectoGradoTable asesores={data ?? []} cargando={isLoading} />
      )}
    </div>
  );
}
