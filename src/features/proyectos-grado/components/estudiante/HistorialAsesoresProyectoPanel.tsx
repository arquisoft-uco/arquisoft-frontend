import ErrorState from '../../../../shared/components/ui/ErrorState';
import Notice from '../../../../shared/components/ui/Notice';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useAsesoresAsignadosProyectoGrado } from '../../hooks/useAsesoresAsignadosProyectoGrado';
import { ultimoRegistroSinAsesor } from '../../utils/asesor-actual';
import AsesoresProyectoGradoTable from '../coordinador/AsesoresProyectoGradoTable';

interface Props {
  proyectoGradoId: string;
}

export default function HistorialAsesoresProyectoPanel({ proyectoGradoId }: Props) {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useAsesoresAsignadosProyectoGrado(proyectoGradoId);

  if (isError) {
    return (
      <ErrorState
        titulo="No se pudieron cargar los asesores"
        descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
        onReintentar={refetch}
      />
    );
  }

  const sinAsesor = isLoading ? null : ultimoRegistroSinAsesor(data ?? []);

  return (
    <div className="flex flex-col gap-4" aria-busy={isFetching}>
      {sinAsesor && (
        <Notice variante="info" titulo="Sin asesor asignado">
          Tu último asesor fue {sinAsesor.nombre} ({sinAsesor.estado.nombre.toLowerCase()}).
        </Notice>
      )}
      <AsesoresProyectoGradoTable
        asesores={data ?? []}
        cargando={isLoading}
        ultimoRegistroId={sinAsesor?.id}
      />
    </div>
  );
}
