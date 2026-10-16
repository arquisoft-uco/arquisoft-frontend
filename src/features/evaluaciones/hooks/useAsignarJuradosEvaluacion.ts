import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AsignarJuradosEvaluacionResponse } from '../models/AsignarJuradosEvaluacionResponse';
import { evaluacionesService } from '../services/evaluacionesService';

export function useAsignarJuradosEvaluacion(evaluacionId: string) {
  const queryClient = useQueryClient();

  return useMutation<AsignarJuradosEvaluacionResponse, unknown, string[]>({
    mutationFn: (juradosIds) =>
      evaluacionesService.asignarJuradosEvaluacion({ evaluacionId, juradosIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'coordinador'] });
    },
  });
}
