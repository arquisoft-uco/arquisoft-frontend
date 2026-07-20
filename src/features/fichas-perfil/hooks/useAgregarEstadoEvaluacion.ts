import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { AgregarEstadoEvaluacionRequest, EvaluacionFichaPerfil } from '../models/fichas-perfil';

interface AgregarEstadoVariables {
  req: AgregarEstadoEvaluacionRequest;
  estadoNombre: string;
}

export function useAgregarEstadoEvaluacion(fichaPerfilId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ req }: AgregarEstadoVariables) =>
      fichasPerfilService.agregarEstadoEvaluacion(req),
    onSuccess: (_, { estadoNombre }) => {
      queryClient.setQueryData<EvaluacionFichaPerfil | undefined>(
        ['evaluacion-representante', fichaPerfilId],
        (prev) => (prev ? { ...prev, estadoActual: estadoNombre } : prev),
      );
    },
  });
}
