import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';

export function useAsignarAsesorEvaluacion(evaluacionId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (asesorId) =>
      evaluacionesService.asignarAsesorEvaluacion({ evaluacionId, asesorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'coordinador'] });
      queryClient.invalidateQueries({
        queryKey: ['evaluaciones', evaluacionId, 'evaluacion-asesor'],
      });
    },
  });
}
