import { ClipboardCheck } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import { varianteEstadoEvaluacionJurado } from '../../../../shared/utils/estado-variante';
import { useEvaluacionesPorEvaluar } from '../../hooks/useEvaluacionesPorEvaluar';
import { LISTA } from '../disposicion';
import BandejaInicio from '../BandejaInicio';

export default function EvaluacionesPorEvaluarPanel() {
  const { evaluaciones, estadoPorEvaluar, cargado, hayError, reintentar } =
    useEvaluacionesPorEvaluar();

  return (
    <BandejaInicio
      titulo="Evaluaciones por evaluar"
      nombre="las evaluaciones por evaluar"
      verTodos={{
        etiqueta: 'Ver todas',
        destino: `/evaluaciones?estadoJurado=${estadoPorEvaluar}`,
      }}
      cargado={cargado}
      hayError={hayError}
      reintentar={() => void reintentar()}
      vacia={evaluaciones.length === 0}
      vacio={{
        icono: ClipboardCheck,
        titulo: 'No tienes evaluaciones por evaluar',
        descripcion: 'Cuando te asignen la evaluación de un entregable, aparecerá aquí.',
      }}
    >
      <ul className={LISTA}>
        {evaluaciones.map((evaluacion) => (
          <li
            key={evaluacion.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <p className="font-medium text-on-surface">{evaluacion.proyecto}</p>
              <p className="text-sm text-on-surface-secondary">
                Versión {evaluacion.versionEntregable} del entregable
              </p>
            </div>
            <Badge variante={varianteEstadoEvaluacionJurado(evaluacion.estadoId)}>
              {evaluacion.estadoNombre}
            </Badge>
          </li>
        ))}
      </ul>
    </BandejaInicio>
  );
}
