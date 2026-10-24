import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import type { ModificarItemCuantitativoJuradoRequest } from '../models/ModificarItemCuantitativoJuradoRequest';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { ITEM_CUANTITATIVO_JURADO_NO_ENCONTRADO } from '../utils/codigos-error-evaluaciones';

const ITEMS_KEY = ['evaluaciones', 'items-cuantitativos-jurado'];

export function useModificarItemCuantitativoJurado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ModificarItemCuantitativoJuradoRequest) =>
      evaluacionesService.modificarItemCuantitativoJurado(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, ITEM_CUANTITATIVO_JURADO_NO_ENCONTRADO)) {
        queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
      }
    },
  });
}
