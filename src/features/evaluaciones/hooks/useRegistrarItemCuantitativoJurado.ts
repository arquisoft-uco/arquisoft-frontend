import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import type { RegistrarItemCuantitativoJuradoRequest } from '../models/RegistrarItemCuantitativoJuradoRequest';

export function useRegistrarItemCuantitativoJurado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: RegistrarItemCuantitativoJuradoRequest) =>
      evaluacionesService.registrarItemCuantitativoJurado(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'items-cuantitativos-jurado'] });
    },
  });
}
