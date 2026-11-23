import { useContextoDeNavegacion } from '../../../shared/hooks/useContextoDeNavegacion';
import { TTL_CONTEXTO_CORTO_MS } from '../../../shared/utils/contexto-temporal';
import type { ResumenEvaluacion } from '../models/ResumenEvaluacion';
import { esquemaContextoEvaluacion } from '../utils/contexto-evaluacion';

interface ResultadoResumenEvaluacion {
  resumen: ResumenEvaluacion | null;
  search: string;
}

export function useResumenEvaluacion(evaluacionId: string): ResultadoResumenEvaluacion {
  const { contexto } = useContextoDeNavegacion({
    tipo: 'evaluacion',
    id: evaluacionId,
    esquemaEstado: esquemaContextoEvaluacion,
    coincide: (valor) => valor.resumen.id === evaluacionId,
    ttlMs: TTL_CONTEXTO_CORTO_MS,
  });

  return { resumen: contexto?.resumen ?? null, search: contexto?.search ?? '' };
}
