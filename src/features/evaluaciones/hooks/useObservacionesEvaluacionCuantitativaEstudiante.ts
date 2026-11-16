import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { evaluacionesService } from '../services/evaluacionesService';

export const OBSERVACIONES_EVALUACION_CUANTITATIVA_ESTUDIANTE_KEY = [
  'evaluaciones',
  'estudiante',
  'observaciones-cuantitativa',
];

const PAGE_SIZE = 10;
const REINTENTOS_MAXIMOS = 3;

export function useObservacionesEvaluacionCuantitativaEstudiante(
  evaluacionCuantitativaJuradoId: string,
) {
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: [
      ...OBSERVACIONES_EVALUACION_CUANTITATIVA_ESTUDIANTE_KEY,
      evaluacionCuantitativaJuradoId,
      page,
    ],
    queryFn: () =>
      evaluacionesService.getObservacionesEvaluacionCuantitativaJuradoEstudiante(
        evaluacionCuantitativaJuradoId,
        { pagina: page, tamanio: PAGE_SIZE },
      ),
    enabled: !!evaluacionCuantitativaJuradoId,
    placeholderData: keepPreviousData,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });

  return { ...query, page, pageSize: PAGE_SIZE, goToPage: setPage };
}
