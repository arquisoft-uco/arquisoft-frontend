import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { EstudianteVinculado } from '../models/EstudianteVinculado';

export function useRemoverEstudiante(idFichaPerfil: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (estudianteId: string) =>
      fichasPerfilService.removerEstudiante(idFichaPerfil, estudianteId),
    onSuccess: (_, estudianteId) => {
      queryClient.setQueryData(
        ['fichas-perfil', idFichaPerfil, 'estudiantes'],
        (prev: EstudianteVinculado[] = []) => prev.filter((e) => e.id !== estudianteId),
      );
    },
  });
}
