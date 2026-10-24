import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import type { RegistrarItemCualitativoJuradoRequest } from '../models/RegistrarItemCualitativoJuradoRequest';

export function useRegistrarItemCualitativoJurado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: RegistrarItemCualitativoJuradoRequest) =>
      evaluacionesService.registrarItemCualitativoJurado(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'items-cualitativos-jurado'] });
    },
  });
}
