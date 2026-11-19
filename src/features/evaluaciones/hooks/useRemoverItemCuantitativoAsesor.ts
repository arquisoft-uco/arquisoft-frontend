import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { ITEM_CUANTITATIVO_ASESOR_NO_ENCONTRADO } from '../utils/codigos-error-evaluaciones';

const ITEMS_KEY = ['evaluaciones', 'items-cuantitativos-asesor'];

export function useRemoverItemCuantitativoAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => evaluacionesService.removerItemCuantitativoAsesor(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, ITEM_CUANTITATIVO_ASESOR_NO_ENCONTRADO)) {
        queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
      }
    },
  });
}
