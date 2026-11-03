import { useMutation, useQueryClient } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { artefactoYaNoDisponible } from '../utils/errores-estudiantes-artefacto';
import { ESTUDIANTE_YA_VINCULADO } from '../utils/estudiantes-artefacto-schema';

const CLAVE_LISTADO_ASESOR = ['artefactos', 'asesor'];
const CODIGO_NO_VIGENTE = 'ARTEFACTOS_ESTUDIANTE_NO_VIGENTE';

interface Variables {
  artefactoId: string;
  estudiantes: string[];
}

export function useVincularEstudiantes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ artefactoId, estudiantes }: Variables) =>
      artefactosService.vincularEstudiantes(artefactoId, { estudiantes }),
    onSuccess: (_data, { artefactoId }) =>
      queryClient.invalidateQueries({ queryKey: ['artefactos', artefactoId, 'estudiantes'] }),
    onError: (err, { artefactoId }) => {
      if (artefactoYaNoDisponible(err)) {
        return queryClient.invalidateQueries({ queryKey: CLAVE_LISTADO_ASESOR });
      }
      if (
        hasApiErrorCode(err, ESTUDIANTE_YA_VINCULADO) ||
        hasApiErrorCode(err, CODIGO_NO_VIGENTE)
      ) {
        return queryClient.invalidateQueries({
          queryKey: ['artefactos', artefactoId, 'estudiantes'],
        });
      }
    },
  });
}
