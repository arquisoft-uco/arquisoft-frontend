import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import type { RegistrarItemCuantitativoAsesorRequest } from '../models/RegistrarItemCuantitativoAsesorRequest';

export function useRegistrarItemCuantitativoAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: RegistrarItemCuantitativoAsesorRequest) =>
      evaluacionesService.registrarItemCuantitativoAsesor(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', 'items-cuantitativos-asesor'] });
    },
  });
}
