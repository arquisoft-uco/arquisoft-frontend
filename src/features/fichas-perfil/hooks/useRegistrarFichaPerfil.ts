import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registrarFichaPerfil } from '../services/fichasPerfilMockService';
import type { RegistrarFichaPerfilRequest } from '../models/RegistrarFichaPerfilRequest';

export function useRegistrarFichaPerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: RegistrarFichaPerfilRequest) => registrarFichaPerfil(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-perfil'] });
    },
  });
}
