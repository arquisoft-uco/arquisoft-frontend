import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstadosRevisionAsesor } from '../../hooks/useEstadosRevisionAsesor';
import EstadosRevisionAsesorTable from './EstadosRevisionAsesorTable';

export default function ConsultarEstadosRevisionAsesor() {
  const { data, isPending, isError, error, refetch } = useEstadosRevisionAsesor();

  if (isError) {
    return (
      <ErrorState
        titulo="No se pudieron cargar los estados de revisión"
        descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
        onReintentar={() => void refetch()}
      />
    );
  }

  return <EstadosRevisionAsesorTable estados={data ?? []} cargando={isPending} />;
}
