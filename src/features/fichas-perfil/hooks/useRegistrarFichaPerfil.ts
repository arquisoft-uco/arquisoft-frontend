import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { RegistrarFichaPerfilRequest } from '../models/RegistrarFichaPerfilRequest';

export function useRegistrarFichaPerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: RegistrarFichaPerfilRequest) => fichasPerfilService.registrarFichaPerfil(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-perfil'] });
    },
  });
}
