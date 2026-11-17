import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { bibliotecaService } from '../services/bibliotecaService';

const CLAVE_DOCUMENTACIONES = ['biblioteca', 'documentaciones'];
const CODIGOS_LISTA_DESACTUALIZADA = [
  'DOCUMENTACION_NO_ENCONTRADA',
  'DOCUMENTACION_ESTADO_SIN_CAMBIO',
];

interface CambioEstado {
  documentacionId: string;
  estado: string;
}

export function useCambiarEstadoDocumentacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentacionId, estado }: CambioEstado) =>
      bibliotecaService.cambiarEstadoDocumentacion(documentacionId, { estado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_DOCUMENTACIONES });
    },
    onError: (error) => {
      if (CODIGOS_LISTA_DESACTUALIZADA.some((codigo) => hasApiErrorCode(error, codigo))) {
        queryClient.invalidateQueries({ queryKey: CLAVE_DOCUMENTACIONES });
      }
    },
  });
}
