import { ClipboardCheck } from 'lucide-react';
import { useEvaluacionesMiFicha } from '../../hooks/useEvaluacionesMiFicha';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Badge from '../../../../shared/components/ui/Badge';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { varianteEstadoEvaluacion } from '../../../../shared/utils/estado-variante';
import { FechaDeEstado } from '../FichaCeldas';

const TARJETA = 'flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 shadow-card';

export default function EvaluacionesMiFichaPanel() {
  const { evaluaciones, isLoading, cargado, isError, error, refetch, fichaPerfilIdDisponible } =
    useEvaluacionesMiFicha();

  if (!fichaPerfilIdDisponible) {
    return <AvisoNoDisponible recurso="evaluaciones de tu ficha de perfil" />;
  }

  if (isError) {
    return (
      <ErrorState
        titulo="No pudimos cargar las evaluaciones"
        descripcion="Inténtalo nuevamente."
        detalle={getApiErrorMessage(error, 'No se pudieron cargar las evaluaciones.')}
        onReintentar={refetch}
      />
    );
  }

  if (isLoading || !cargado) {
    return <Skeleton variante="tarjetas" etiqueta="Cargando evaluaciones…" />;
  }

  if (evaluaciones.length === 0) {
    return (
      <EmptyState
        icono={ClipboardCheck}
        titulo="Tu ficha aún no tiene evaluaciones"
        descripcion="Cuando el comité de currículum la evalúe, verás aquí el resultado."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {evaluaciones.map((evaluacion) => (
        <li key={evaluacion.id} className={TARJETA}>
          <div>
            <Badge
              variante={
                evaluacion.estadoEvaluacionId
                  ? varianteEstadoEvaluacion(evaluacion.estadoEvaluacionId)
                  : 'neutro'
              }
            >
              {evaluacion.estadoEvaluacionNombre ?? 'Sin estado'}
            </Badge>
          </div>
          <p className="text-sm text-on-surface-secondary">
            Creada el <FechaDeEstado iso={evaluacion.fechaCreacion} />
          </p>
          <p className="text-sm text-on-surface-secondary">
            Evaluada por {evaluacion.representante.nombre}
          </p>
        </li>
      ))}
    </ul>
  );
}
