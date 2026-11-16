import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';
import type { ModificarItemCuantitativoAsesorRequest } from '../models/ModificarItemCuantitativoAsesorRequest';
import { hasApiErrorCode } from '../../../shared/utils/api-error';
import { ITEM_CUANTITATIVO_ASESOR_NO_ENCONTRADO } from '../utils/codigos-error-evaluaciones';

const ITEMS_KEY = ['evaluaciones', 'items-cuantitativos-asesor'];

export function useModificarItemCuantitativoAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: ModificarItemCuantitativoAsesorRequest) =>
      evaluacionesService.modificarItemCuantitativoAsesor(req),
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
