import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { TAMANIO_PAGINA_JURADOS, evaluacionesService } from '../services/evaluacionesService';

export function useJuradosVigentes(pagina: number, texto: string) {
  const query = useQuery({
    queryKey: ['evaluaciones', 'jurados-vigentes', texto.trim(), pagina],
    queryFn: () => evaluacionesService.getJuradosVigentes({ pagina, texto }),
    placeholderData: keepPreviousData,
  });

  return { ...query, pageSize: TAMANIO_PAGINA_JURADOS };
}
