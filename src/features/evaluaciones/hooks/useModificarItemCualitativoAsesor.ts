import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import type { ModificarItemCualitativoAsesorRequest } from '../models/ModificarItemCualitativoAsesorRequest';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { ITEM_CUALITATIVO_ASESOR_NO_ENCONTRADO } from '../utils/codigos-error-evaluaciones';

const ITEMS_KEY = ['evaluaciones', 'items-cualitativos-asesor'];

export function useModificarItemCualitativoAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ModificarItemCualitativoAsesorRequest) =>
      evaluacionesService.modificarItemCualitativoAsesor(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
    },
    onError: (err) => {
      if (hasApiErrorCode(err, ITEM_CUALITATIVO_ASESOR_NO_ENCONTRADO)) {
        queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
      }
    },
  });
}
