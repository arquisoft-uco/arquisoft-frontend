import { useContextoDeNavegacion } from '../../../shared/hooks/useContextoDeNavegacion';
import type { ResumenProyectoGrado } from '../models/ResumenProyectoGrado';
import { esquemaContextoProyectoGrado } from '../utils/contexto-proyecto-grado';

interface ResultadoResumenProyectoGrado {
  resumen: ResumenProyectoGrado | null;
  search: string;
}

export function useResumenProyectoGrado(
  proyectoId: string,
  ttlMs?: number,
): ResultadoResumenProyectoGrado {
  const { contexto } = useContextoDeNavegacion({
    tipo: 'proyecto-grado',
    id: proyectoId,
    esquemaEstado: esquemaContextoProyectoGrado,
    coincide: (valor) => valor.resumen.id === proyectoId,
    ttlMs,
  });

  return { resumen: contexto?.resumen ?? null, search: contexto?.search ?? '' };
}
