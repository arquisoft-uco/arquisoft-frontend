import { MessageSquare } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useObservacionesRevision } from '../../hooks/useObservacionesRevision';
import ListaObservacionesRevision from './ListaObservacionesRevision';

interface Props {
  revisionAsesorId: string;
  onCerrar: () => void;
}

export default function ObservacionesRevisionPanel({ revisionAsesorId, onCerrar }: Props) {
  const { data, isLoading, isError, error, refetch } = useObservacionesRevision(revisionAsesorId);

  return (
    <SidePanel
      titulo="Observaciones de la revisión"
      descripcion="Lo que registraste en esta revisión."
      onCerrar={onCerrar}
      pie={(solicitarCierre) => (
        <div className="sticky bottom-0 z-10 border-t border-border bg-surface p-4 sm:px-6">
          <div className="actions-row">
            <Button variante="secundario" onClick={solicitarCierre}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    >
      {isError ? (
        <ErrorState
          titulo="No pudimos cargar las observaciones"
          descripcion="Inténtalo nuevamente."
          detalle={getApiErrorMessage(error, 'No se pudieron cargar las observaciones.')}
          onReintentar={() => void refetch()}
        />
      ) : isLoading || !data ? (
        <Skeleton variante="lineas" etiqueta="Cargando observaciones…" />
      ) : data.length === 0 ? (
        <EmptyState
          icono={MessageSquare}
          titulo="Esta revisión aún no tiene observaciones"
          descripcion="Aún no hay observaciones registradas en esta revisión."
        />
      ) : (
        <ListaObservacionesRevision observaciones={data} />
      )}
    </SidePanel>
  );
}
