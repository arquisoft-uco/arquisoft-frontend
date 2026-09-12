import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useAsignarEstudiante(idFichaPerfil: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (estudiantesIds: string[]) =>
      fichasPerfilService.asignarEstudiantes({ fichaPerfilId: idFichaPerfil, estudiantesIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-perfil', idFichaPerfil, 'estudiantes'] });
    },
  });
}
