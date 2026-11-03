import type { ReactNode } from 'react';
import { MessageSquare } from 'lucide-react';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import SidePanel from '../../../shared/components/ui/SidePanel';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import type { ObservacionRevision } from '../models/ObservacionRevision';
import ListaObservacionesRevision from './ListaObservacionesRevision';
import PieRevision from './PieRevision';

interface Props {
  titulo?: string;
  descripcion: string;
  descripcionVacia: string;
  observaciones: ObservacionRevision[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onReintentar: () => void;
  onCerrar: () => void;
  encabezado?: ReactNode;
  barra?: ReactNode;
  notaPie?: string;
  accionesPie?: ReactNode;
  acciones?: (observacion: ObservacionRevision) => ReactNode;
  seccionAnterior?: ReactNode;
}

export default function ObservacionesRevisionPanelBase({
  titulo = 'Observaciones de la revisión',
  descripcion,
  descripcionVacia,
  observaciones,
  isLoading,
  isError,
  error,
  onReintentar,
  onCerrar,
  encabezado,
  barra,
  notaPie,
  accionesPie,
  acciones,
  seccionAnterior,
}: Props) {
  return (
    <SidePanel
      titulo={titulo}
      descripcion={descripcion}
      onCerrar={onCerrar}
      pie={(solicitarCierre) => (
        <PieRevision nota={notaPie} onCerrar={solicitarCierre}>
          {accionesPie}
        </PieRevision>
      )}
    >
      <div className="flex flex-col gap-4">
        {encabezado}
        {!isError && barra}
        {isError ? (
          <ErrorState
            titulo="No pudimos cargar las observaciones"
            descripcion="Inténtalo nuevamente."
            detalle={getApiErrorMessage(error, 'No se pudieron cargar las observaciones.')}
            onReintentar={onReintentar}
          />
        ) : isLoading || !observaciones ? (
          <Skeleton variante="lineas" etiqueta="Cargando observaciones…" />
        ) : observaciones.length === 0 ? (
          <EmptyState
            icono={MessageSquare}
            titulo="Esta revisión aún no tiene observaciones"
            descripcion={descripcionVacia}
          />
        ) : (
          <ListaObservacionesRevision observaciones={observaciones} acciones={acciones} />
        )}
        {seccionAnterior}
      </div>
    </SidePanel>
  );
}
