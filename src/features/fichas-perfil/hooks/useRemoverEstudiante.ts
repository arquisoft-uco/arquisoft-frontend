import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removerEstudiante } from '../services/fichasPerfilMockService';
import type { EstudianteVinculado } from '../models/EstudianteVinculado';

export function useRemoverEstudiante(idFichaPerfil: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idVinculo: string) => removerEstudiante(idVinculo),
    onSuccess: (_, idVinculo) => {
      queryClient.setQueryData(
        ['fichas-perfil', idFichaPerfil, 'estudiantes'],
        (prev: EstudianteVinculado[] = []) => prev.filter((e) => e.idVinculo !== idVinculo),
      );
    },
  });
}
