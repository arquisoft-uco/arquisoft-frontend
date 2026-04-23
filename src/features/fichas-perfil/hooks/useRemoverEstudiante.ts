import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removerEstudiante } from '../services/fichasPerfilMockService';

export function useRemoverEstudiante(idFichaPerfil: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idVinculo: string) => removerEstudiante(idVinculo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-perfil', idFichaPerfil, 'estudiantes'] });
    },
  });
}
