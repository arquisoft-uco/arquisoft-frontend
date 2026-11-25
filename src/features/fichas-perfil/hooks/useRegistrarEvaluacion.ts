import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useRegistrarEvaluacion(fichaPerfilId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => fichasPerfilService.registrarEvaluacion({ fichaPerfilId }),
    // Iniciar la evaluación habilita los ítems de la ficha: se refresca todo lo de esta ficha.
    // Sin devolver la promesa: el mutate no espera el refetch y el toast del componente no se pierde.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['fichas-perfil', fichaPerfilId] });
    },
  });
}
