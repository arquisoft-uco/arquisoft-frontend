import { useMutation, useQueryClient } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import {
  artefactoYaNoDisponible,
  ESTUDIANTE_NO_VINCULADO_ARTEFACTO,
} from '../utils/errores-estudiantes-artefacto';

interface Variables {
  artefactoId: string;
  estudianteId: string;
}

export function useRemoverEstudiante() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ artefactoId, estudianteId }: Variables) =>
      artefactosService.removerEstudiante(artefactoId, estudianteId),
    onSuccess: (_data, { artefactoId }) =>
      queryClient.invalidateQueries({ queryKey: ['artefactos', artefactoId, 'estudiantes'] }),
    onError: (err, { artefactoId }) => {
      if (hasApiErrorCode(err, ESTUDIANTE_NO_VINCULADO_ARTEFACTO)) {
        return queryClient.invalidateQueries({
          queryKey: ['artefactos', artefactoId, 'estudiantes'],
        });
      }
      if (artefactoYaNoDisponible(err)) {
        return queryClient.invalidateQueries({ queryKey: ['artefactos', 'asesor'] });
      }
    },
  });
}
