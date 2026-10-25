import { MessageSquare } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import SidePanel from '../../../shared/components/ui/SidePanel';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import type { ObservacionRevision } from '../models/ObservacionRevision';
import ListaObservacionesRevision from './ListaObservacionesRevision';

interface Props {
  descripcion: string;
  descripcionVacia: string;
  observaciones: ObservacionRevision[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onReintentar: () => void;
  onCerrar: () => void;
}

export default function ObservacionesRevisionPanelBase({
  descripcion,
  descripcionVacia,
  observaciones,
  isLoading,
  isError,
  error,
  onReintentar,
  onCerrar,
}: Props) {
  return (
    <SidePanel
      titulo="Observaciones de la revisión"
      descripcion={descripcion}
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
        <ListaObservacionesRevision observaciones={observaciones} />
      )}
    </SidePanel>
  );
}
