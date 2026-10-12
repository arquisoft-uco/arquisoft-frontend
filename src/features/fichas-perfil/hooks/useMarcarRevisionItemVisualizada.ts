import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';

export function useMarcarRevisionItemVisualizada() {
  const queryClient = useQueryClient();
  const { fichaPerfilId } = useFichaPerfilIdEstudiante();

  return useMutation({
    mutationFn: fichasPerfilService.marcarRevisionItemVisualizada,
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ['fichas-perfil', 'estudiante', fichaPerfilId, 'revisiones'],
      }),
  });
}
