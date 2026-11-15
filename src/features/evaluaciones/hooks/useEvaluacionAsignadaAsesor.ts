import { useQuery } from '@tanstack/react-query';
import type { EvaluacionAsignadaAsesor } from '../models/EvaluacionAsignadaAsesor';
import { evaluacionesService } from '../services/evaluacionesService';

const TAMANIO_BUSQUEDA = 50;

async function buscarAsignacion(id: string): Promise<EvaluacionAsignadaAsesor | null> {
  for (let pagina = 0; ; pagina++) {
    const resultado = await evaluacionesService.getEvaluacionesAsignadasAsesor({
      pagina,
      tamanio: TAMANIO_BUSQUEDA,
    });
    const encontrada = resultado.content.find((a) => a.id === id);
    if (encontrada) return encontrada;
    if (resultado.last || pagina + 1 >= resultado.totalPages) return null;
  }
}

export function useEvaluacionAsignadaAsesor(evaluacionAsesorId: string | undefined) {
  return useQuery({
    queryKey: ['evaluaciones', 'asesor', 'asignada', evaluacionAsesorId],
    queryFn: () => buscarAsignacion(evaluacionAsesorId ?? ''),
    enabled: Boolean(evaluacionAsesorId),
    staleTime: 0,
  });
}
