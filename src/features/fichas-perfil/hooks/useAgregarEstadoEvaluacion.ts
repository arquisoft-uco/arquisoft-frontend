import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { AgregarEstadoEvaluacionRequest } from '../models/fichas-perfil';

export function useAgregarEstadoEvaluacion(fichaPerfilId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: AgregarEstadoEvaluacionRequest) =>
      fichasPerfilService.agregarEstadoEvaluacion(req),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['fichas-perfil', fichaPerfilId, 'evaluacion'] }),
  });
}
