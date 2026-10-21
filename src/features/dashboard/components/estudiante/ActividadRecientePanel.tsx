import { History } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { varianteEstadoFicha } from '../../../../shared/utils/estado-variante';
import { useActividadFichaEstudiante } from '../../hooks/useActividadFichaEstudiante';
import { useFichaDelEstudiante } from '../../hooks/useFichaDelEstudiante';
import { formatearFecha } from '../../utils/formato-fecha';
import { LISTA } from '../disposicion';
import SeccionInicio from '../SeccionInicio';

export default function ActividadRecientePanel() {
  const { ficha } = useFichaDelEstudiante();
  const { estados, cargado, hayError, reintentar } = useActividadFichaEstudiante(ficha?.id);

  if (!ficha) return null;

  return (
    <SeccionInicio titulo="Actividad reciente">
      {hayError ? (
        <ErrorState
          titulo="No pudimos cargar la actividad"
          onReintentar={() => void reintentar()}
        />
      ) : !cargado ? (
        <Skeleton variante="lineas" etiqueta="Cargando la actividad…" />
      ) : estados.length === 0 ? (
        <EmptyState icono={History} titulo="Tu ficha aún no tiene cambios de estado" />
      ) : (
        <ol className={LISTA}>
          {estados.map((estado) => (
            <li
              key={`${estado.id}-${estado.fechaActualizacion}`}
              className="flex flex-wrap items-center justify-between gap-2 py-2.5"
            >
              <Badge variante={varianteEstadoFicha(estado.id)}>{estado.nombre}</Badge>
              <time
                dateTime={estado.fechaActualizacion}
                className="text-sm text-on-surface-secondary"
              >
                {formatearFecha(estado.fechaActualizacion)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </SeccionInicio>
  );
}
