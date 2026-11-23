import { useContextoDeNavegacion } from '../../../shared/hooks/useContextoDeNavegacion';
import type { NavegacionEvaluacionJurado } from '../models/NavegacionEvaluacionJurado';
import { esquemaContextoJurado } from '../utils/contexto-evaluacion';

export function useNavegacionEvaluacionJurado(
  evaluacionJuradoId: string,
): NavegacionEvaluacionJurado | null {
  const { contexto } = useContextoDeNavegacion({
    tipo: 'evaluacion-jurado',
    id: evaluacionJuradoId,
    esquemaEstado: esquemaContextoJurado,
    coincide: (valor) =>
      valor.evaluacionJuradoId === evaluacionJuradoId && valor.resumen.id === valor.evaluacionId,
  });
  return contexto;
}
