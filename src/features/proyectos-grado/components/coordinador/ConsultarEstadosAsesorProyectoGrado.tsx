import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstadosAsesorProyectoGrado } from '../../hooks/useEstadosAsesorProyectoGrado';
import EstadosAsesorProyectoGradoTable from './EstadosAsesorProyectoGradoTable';

export default function ConsultarEstadosAsesorProyectoGrado() {
  const { data, isPending, isError, error, refetch } = useEstadosAsesorProyectoGrado();

  if (isError) {
    return (
      <ErrorState
        titulo="No se pudieron cargar los estados de asesor"
        descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
        onReintentar={() => void refetch()}
      />
    );
  }

  return <EstadosAsesorProyectoGradoTable estados={data ?? []} cargando={isPending} />;
}
