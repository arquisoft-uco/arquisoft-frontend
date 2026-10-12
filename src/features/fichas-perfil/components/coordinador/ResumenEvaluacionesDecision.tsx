import Badge from '../../../../shared/components/ui/Badge';
import { varianteEstadoEvaluacion } from '../../../../shared/utils/estado-variante';
import type { EvaluacionFichaPerfilEstudiante } from '../../models/EvaluacionFichaPerfilEstudiante';
import { contarEvaluacionesPorEstado } from '../../utils/decision-ficha';

const RAIZ = 'flex flex-col gap-1';
const ETIQUETA = 'text-[13px] font-medium text-on-surface-secondary';
const FILA = 'flex flex-wrap gap-2';

interface Props {
  evaluaciones: EvaluacionFichaPerfilEstudiante[];
}

export default function ResumenEvaluacionesDecision({ evaluaciones }: Props) {
  const conteos = contarEvaluacionesPorEstado(evaluaciones);
  if (conteos.length === 0) return null;

  return (
    <div className={RAIZ}>
      <span className={ETIQUETA}>Evaluaciones</span>
      <div className={FILA}>
        {conteos.map(({ estadoId, nombre, cantidad }) => (
          <Badge
            key={estadoId ?? 'sin-estado'}
            variante={estadoId ? varianteEstadoEvaluacion(estadoId) : 'neutro'}
          >
            {cantidad} {nombre}
          </Badge>
        ))}
      </div>
    </div>
  );
}
