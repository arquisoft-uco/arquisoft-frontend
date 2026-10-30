import { ClipboardList } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { varianteEstadoObservacion } from '../../../../shared/utils/estado-variante';
import { useEstadosObservacionRevision } from '../../hooks/useEstadosObservacionRevision';
import type { EstadoObservacionRevision } from '../../models/fichas-perfil';

const DATO_TARJETA = 'text-[13px] text-on-surface-secondary';

function InsigniaEstado({ estado }: { estado: EstadoObservacionRevision }) {
  return <Badge variante={varianteEstadoObservacion(estado.id)}>{estado.nombre}</Badge>;
}

const COLUMNAS: ColumnaTabla<EstadoObservacionRevision>[] = [
  {
    id: 'estado',
    encabezado: 'Estado',
    celda: (estado) => <InsigniaEstado estado={estado} />,
  },
  {
    id: 'descripcion',
    encabezado: 'Descripción',
    celda: (estado) => <span>{estado.descripcion}</span>,
  },
];

export default function EstadosObservacionPanel() {
  const { data, isPending, isError, error, refetch } = useEstadosObservacionRevision();

  if (isError) {
    return (
      <ErrorState
        titulo="No se pudieron cargar los estados de observación"
        descripcion="Inténtalo nuevamente."
        detalle={getApiErrorMessage(error, 'No se pudieron cargar los estados de observación.')}
        onReintentar={() => void refetch()}
      />
    );
  }

  return (
    <DataTable
      etiqueta="Estados de una observación"
      columnas={COLUMNAS}
      filas={data ?? []}
      idDeFila={(estado) => estado.id}
      cargando={isPending}
      vacio={
        <EmptyState
          icono={ClipboardList}
          titulo="Aún no hay estados de observación"
          descripcion="Cuando estén disponibles, aparecerán aquí."
        />
      }
      tarjeta={(estado) => (
        <>
          <div>
            <InsigniaEstado estado={estado} />
          </div>
          <p className={DATO_TARJETA}>{estado.descripcion}</p>
        </>
      )}
    />
  );
}
