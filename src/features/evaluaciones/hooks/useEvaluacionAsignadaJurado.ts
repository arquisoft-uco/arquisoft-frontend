import { useQuery } from '@tanstack/react-query';
import type { EvaluacionAsignadaJurado } from '../models/EvaluacionAsignadaJurado';
import { evaluacionesService } from '../services/evaluacionesService';

const TAMANIO_BUSQUEDA = 50;

async function buscarAsignacion(id: string): Promise<EvaluacionAsignadaJurado | null> {
  for (let pagina = 0; ; pagina++) {
    const resultado = await evaluacionesService.getEvaluacionesAsignadasJurado({
      pagina,
      tamanio: TAMANIO_BUSQUEDA,
    });
    const encontrada = resultado.content.find((a) => a.id === id);
    if (encontrada) return encontrada;
    if (resultado.last || pagina + 1 >= resultado.totalPages) return null;
  }
}

export function useEvaluacionAsignadaJurado(evaluacionJuradoId: string | undefined) {
  return useQuery({
    queryKey: ['evaluaciones', 'jurado', 'asignada', evaluacionJuradoId],
    queryFn: () => buscarAsignacion(evaluacionJuradoId ?? ''),
    enabled: Boolean(evaluacionJuradoId),
    staleTime: 0,
  });
}
