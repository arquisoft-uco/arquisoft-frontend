import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import type { ModificarItemCualitativoJuradoRequest } from '../models/ModificarItemCualitativoJuradoRequest';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { ITEM_CUALITATIVO_JURADO_NO_ENCONTRADO } from '../utils/codigos-error-evaluaciones';

const ITEMS_KEY = ['evaluaciones', 'items-cualitativos-jurado'];

export function useModificarItemCualitativoJurado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ModificarItemCualitativoJuradoRequest) =>
      evaluacionesService.modificarItemCualitativoJurado(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, ITEM_CUALITATIVO_JURADO_NO_ENCONTRADO)) {
        queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
      }
    },
  });
}
