import { History } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useHistorialEstadosFichaAsesor } from '../../hooks/useHistorialEstadosFichaAsesor';
import EstadosFichaPanel from '../EstadosFichaPanel';
import LineaTiempoEstados from '../LineaTiempoEstados';

interface Props {
  fichaPerfilId: string;
}

export default function EstadosFichaAsesorPanel({ fichaPerfilId }: Props) {
  const { data, isLoading, isError, error, refetch } =
    useHistorialEstadosFichaAsesor(fichaPerfilId);

  function historial() {
    if (isError) {
      return (
        <ErrorState
          titulo="No se pudo cargar el historial de estados"
          descripcion="Inténtalo nuevamente."
          detalle={getApiErrorMessage(error, 'No se pudo cargar el historial de estados.')}
          onReintentar={refetch}
        />
      );
    }
    if (isLoading || !data) {
      return <Skeleton variante="lineas" etiqueta="Cargando historial de estados…" />;
    }
    if (data.length === 0) {
      return <EmptyState icono={History} titulo="Esta ficha aún no tiene estados registrados" />;
    }
    return <LineaTiempoEstados historial={data} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-on-surface">Historial de estados</h2>
        {historial()}
      </section>
      {data && data.length > 0 && (
        <EstadosFichaPanel fichaPerfilId={fichaPerfilId} estadoActual={data[0]} />
      )}
    </div>
  );
}
