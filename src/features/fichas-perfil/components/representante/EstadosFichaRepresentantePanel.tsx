import { History } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useHistorialEstadosFichaRepresentante } from '../../hooks/useHistorialEstadosFichaRepresentante';
import LineaTiempoEstados from '../LineaTiempoEstados';

interface Props {
  fichaPerfilId: string;
}

export default function EstadosFichaRepresentantePanel({ fichaPerfilId }: Props) {
  const { data, isLoading, isError, error, refetch } =
    useHistorialEstadosFichaRepresentante(fichaPerfilId);

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
      return (
        <EmptyState
          icono={History}
          titulo="Sin estados para mostrar"
          descripcion="Aquí aparecerán los estados de la ficha cuando comiences a evaluarla."
        />
      );
    }
    return <LineaTiempoEstados historial={data} />;
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-on-surface">Historial de estados</h2>
      {historial()}
    </section>
  );
}
