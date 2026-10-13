import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Notice from '../../../../shared/components/ui/Notice';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useAsesoresProyectoGrado } from '../../hooks/useAsesoresProyectoGrado';
import { ultimoRegistroSinAsesor } from '../../utils/asesor-actual';
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
  const sinAsesor = listaCargada ? ultimoRegistroSinAsesor(data ?? []) : null;

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
      {sinAsesor && (
        <Notice variante="info" titulo="Sin asesor asignado">
          El último registro es de {sinAsesor.nombre} ({sinAsesor.estado.nombre.toLowerCase()}).
          Puedes asignar un asesor con «Asignar asesor».
        </Notice>
      )}
      {isError ? (
        <ErrorState
          titulo="No se pudieron cargar los asesores"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={refetch}
        />
      ) : (
        <AsesoresProyectoGradoTable
          asesores={data ?? []}
          cargando={isLoading}
          ultimoRegistroId={sinAsesor?.id}
        />
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
