import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstadosEntregable } from '../../hooks/useEstadosEntregable';
import EstadosEntregableAsesorTable from './EstadosEntregableAsesorTable';

export default function ConsultarEstadosEntregableAsesor() {
  const { data, isPending, isError, error, refetch } = useEstadosEntregable();

  if (isError) {
    return (
      <ErrorState
        titulo="No se pudieron cargar los estados de entregable"
        descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
        onReintentar={() => void refetch()}
      />
    );
  }

  return <EstadosEntregableAsesorTable estados={data ?? []} cargando={isPending} />;
}
