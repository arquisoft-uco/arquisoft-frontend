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
    onSuccess: (_, { req, estadoNombre }) => {
      queryClient.setQueryData<EvaluacionFichaPerfil[] | undefined>(
        ['evaluacion-representante', fichaPerfilId],
        (prev) =>
          prev?.map((e) =>
            e.id === req.evaluacionFichaPerfilId
              ? { ...e, estadoEvaluacionId: req.estadoEvaluacionId, estadoEvaluacionNombre: estadoNombre }
              : e,
          ),
      );
    },
  });
}
