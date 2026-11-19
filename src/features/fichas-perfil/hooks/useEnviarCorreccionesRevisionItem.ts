import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';

export function useEnviarCorreccionesRevisionItem() {
  const queryClient = useQueryClient();
  const { fichaPerfilId } = useFichaPerfilIdEstudiante();

  return useMutation({
    mutationFn: fichasPerfilService.enviarCorreccionesRevisionItem,
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ['fichas-perfil', 'estudiante', fichaPerfilId, 'revisiones'],
      }),
  });
}
