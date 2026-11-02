import { useMutation, useQueryClient } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { ARTEFACTO_NO_ENCONTRADO, ARTEFACTO_OMITIDO } from '../utils/errores-omitir-artefacto';

const CLAVE_LISTADO_ASESOR = ['artefactos', 'asesor'];

export function useOmitirArtefacto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (artefactoId: string) => artefactosService.omitirArtefacto(artefactoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLAVE_LISTADO_ASESOR }),
    onError: (err) => {
      if (
        hasApiErrorCode(err, ARTEFACTO_NO_ENCONTRADO) ||
        hasApiErrorCode(err, ARTEFACTO_OMITIDO)
      ) {
        return queryClient.invalidateQueries({ queryKey: CLAVE_LISTADO_ASESOR });
      }
    },
  });
}
