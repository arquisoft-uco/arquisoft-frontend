import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import type { RemoverEstudianteArtefactoRequest } from '../models/RemoverEstudianteArtefactoRequest';
import { artefactosService } from '../services/artefactosService';
import {
  artefactoYaNoDisponible,
  ESTUDIANTE_ARTEFACTO_ESTUDIANTE_NO_VINCULADO_ARTEFACTO,
} from '../utils/errores-estudiantes-artefacto';

const CLAVE_LISTADO_ASESOR = ['artefactos', 'asesor'];

export function useRemoverEstudianteArtefacto() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, RemoverEstudianteArtefactoRequest>({
    mutationFn: artefactosService.removerEstudianteArtefacto,
    onSuccess: (_data, { artefactoId }) =>
      queryClient.invalidateQueries({ queryKey: ['artefactos', artefactoId, 'estudiantes'] }),
    onError: async (err, { artefactoId }) => {
      const claveEstudiantes = ['artefactos', artefactoId, 'estudiantes'];
      if (artefactoYaNoDisponible(err)) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: claveEstudiantes }),
          queryClient.invalidateQueries({ queryKey: CLAVE_LISTADO_ASESOR }),
        ]);
      } else if (hasApiErrorCode(err, ESTUDIANTE_ARTEFACTO_ESTUDIANTE_NO_VINCULADO_ARTEFACTO)) {
        await queryClient.invalidateQueries({ queryKey: claveEstudiantes });
      }
    },
  });
}
