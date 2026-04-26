import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { CambiarAsesorRequest } from '../models/CambiarAsesorRequest';

export function useCambiarAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: CambiarAsesorRequest) => fichasPerfilService.cambiarAsesor(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-perfil', 'coordinador'] });
    },
  });
}
