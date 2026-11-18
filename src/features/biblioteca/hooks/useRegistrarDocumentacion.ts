import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { bibliotecaService } from '../services/bibliotecaService';

const CLAVE_ENTREGABLES = ['biblioteca', 'entregables-disponibles'];
const CLAVE_DOCUMENTACIONES = ['biblioteca', 'documentaciones'];
const CODIGOS_LISTA_DESACTUALIZADA = [
  'DOCUMENTACION_YA_REGISTRADA',
  'ENTREGABLE_PROYECTO_GRADO_NO_ENCONTRADO',
];

export function useRegistrarDocumentacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entregableProyectoGradoId: string) =>
      bibliotecaService.registrarDocumentacion({ entregableProyectoGradoId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_ENTREGABLES });
      queryClient.invalidateQueries({ queryKey: CLAVE_DOCUMENTACIONES });
    },
    onError: (error) => {
      if (CODIGOS_LISTA_DESACTUALIZADA.some((codigo) => hasApiErrorCode(error, codigo))) {
        queryClient.invalidateQueries({ queryKey: CLAVE_ENTREGABLES });
      }
    },
  });
}
