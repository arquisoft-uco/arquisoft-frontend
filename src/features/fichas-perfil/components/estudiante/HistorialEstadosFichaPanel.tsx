import { History } from 'lucide-react';
import { useEstadosFichaPerfilEstudiante } from '../../hooks/useEstadosFichaPerfilEstudiante';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Badge from '../../../../shared/components/ui/Badge';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

export default function HistorialEstadosFichaPanel() {
  const { historial, isLoading, isError, error, refetch, fichaPerfilIdDisponible } =
    useEstadosFichaPerfilEstudiante();

  if (!fichaPerfilIdDisponible) {
    return <AvisoNoDisponible recurso="historial de estados de tu ficha de perfil" />;
  }

  if (isLoading) {
    return <Skeleton variante="tarjetas" etiqueta="Cargando historial de estados" />;
  }

  if (isError) {
    return (
      <ErrorState
        titulo={getApiErrorMessage(error, 'No se pudo cargar el historial de estados.')}
        onReintentar={refetch}
      />
    );
  }

  return (
    <section aria-labelledby="historial-estados-titulo" className="space-y-3">
      <h3 id="historial-estados-titulo" className="text-sm font-semibold text-on-surface">
        Historial de estados
      </h3>
      {historial.length === 0 ? (
        <EmptyState icono={History} titulo="Tu ficha aún no tiene estados registrados." />
      ) : (
        <ul className="space-y-2">
          {historial.map((estado, indice) => (
            <li
              key={estado.id + estado.fechaActualizacion}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface p-3"
            >
              <span className="flex items-center gap-2 text-sm text-on-surface">
                {estado.nombre}
                {indice === 0 && <Badge variante="info">Actual</Badge>}
              </span>
              <time
                dateTime={estado.fechaActualizacion}
                className="text-xs text-on-surface-secondary"
              >
                {formatoFecha.format(new Date(estado.fechaActualizacion))}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
