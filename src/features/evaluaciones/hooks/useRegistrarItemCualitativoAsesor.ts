import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import type { RegistrarItemCualitativoAsesorRequest } from '../models/RegistrarItemCualitativoAsesorRequest';

export function useRegistrarItemCualitativoAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: RegistrarItemCualitativoAsesorRequest) =>
      evaluacionesService.registrarItemCualitativoAsesor(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'items-cualitativos-asesor'] });
    },
  });
}
