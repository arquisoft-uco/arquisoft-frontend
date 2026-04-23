import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cambiarAsesor } from '../services/fichasPerfilMockService';
import type { CambiarAsesorRequest } from '../models/CambiarAsesorRequest';

export function useCambiarAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: CambiarAsesorRequest) => cambiarAsesor(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-perfil', 'coordinador'] });
    },
  });
}
