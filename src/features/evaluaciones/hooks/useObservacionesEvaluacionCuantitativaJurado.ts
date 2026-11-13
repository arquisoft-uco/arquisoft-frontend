import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { evaluacionesService } from '../services/evaluacionesService';

const PAGE_SIZE = 10;
const REINTENTOS_MAXIMOS = 3;

export function useObservacionesEvaluacionCuantitativaJurado(
  evaluacionCuantitativaJuradoId: string,
) {
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: [
      'evaluaciones',
      'jurado',
      'observaciones-cuantitativa',
      evaluacionCuantitativaJuradoId,
      page,
    ],
    queryFn: () =>
      evaluacionesService.getObservacionesEvaluacionCuantitativaJurado(
        evaluacionCuantitativaJuradoId,
        { pagina: page, tamanio: PAGE_SIZE },
      ),
    enabled: !!evaluacionCuantitativaJuradoId,
    placeholderData: keepPreviousData,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });

  return { ...query, page, pageSize: PAGE_SIZE, goToPage: setPage };
}
