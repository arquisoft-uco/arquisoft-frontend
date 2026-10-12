import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useAsesoresProyectoGrado } from '../../hooks/useAsesoresProyectoGrado';
import AsesoresProyectoGradoTable from './AsesoresProyectoGradoTable';
import AsignarAsesorProyectoGradoPanel from './AsignarAsesorProyectoGradoPanel';

interface Props {
  proyectoGradoId: string;
  titulo: string;
  finalizado: boolean;
}

export default function AsesoresProyectoGradoPanel({ proyectoGradoId, titulo, finalizado }: Props) {
  const [abierto, setAbierto] = useState(false);
  const { data, isLoading, isFetching, isError, error, refetch } =
    useAsesoresProyectoGrado(proyectoGradoId);
  const listaCargada = !isLoading && !isError;

  return (
    <div className="flex flex-col gap-4" aria-busy={isFetching}>
      <div className="section-header">
        <h2 className="text-base font-semibold text-on-surface">Asesores del proyecto</h2>
        {listaCargada && (
          <Button icono={UserPlus} className="header-action" onClick={() => setAbierto(true)}>
            Asignar asesor
          </Button>
        )}
      </div>
      {isError ? (
        <ErrorState
          titulo="No se pudieron cargar los asesores"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={refetch}
        />
      ) : (
        <AsesoresProyectoGradoTable asesores={data ?? []} cargando={isLoading} />
      )}
      {abierto && (
        <AsignarAsesorProyectoGradoPanel
          proyectoGradoId={proyectoGradoId}
          titulo={titulo}
          asesores={data ?? []}
          finalizado={finalizado}
          onCerrar={() => setAbierto(false)}
        />
      )}
    </div>
  );
}
