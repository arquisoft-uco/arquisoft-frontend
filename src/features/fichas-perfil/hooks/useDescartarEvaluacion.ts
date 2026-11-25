import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useDescartarEvaluacion(fichaPerfilId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (evaluacionId: string) => fichasPerfilService.descartarEvaluacion(evaluacionId),
    // Sin devolver la promesa: al invalidar el botón se desmonta y el toast del mutate se perdería.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['fichas-perfil', fichaPerfilId] });
      void queryClient.invalidateQueries({ queryKey: ['fichas-perfil', 'representante'] });
    },
  });
}
