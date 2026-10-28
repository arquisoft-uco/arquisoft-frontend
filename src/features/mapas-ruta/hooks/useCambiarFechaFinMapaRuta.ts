import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mapasRutaService } from '../services/mapasRutaService';
import type { CambiarFechaFinMapaRutaRequest } from '../models/CambiarFechaFinMapaRutaRequest';
import { hasApiErrorCode } from '../../../shared/utils/api-error';

interface Variables {
  mapaRutaId: string;
  req: CambiarFechaFinMapaRutaRequest;
}

export function useCambiarFechaFinMapaRuta() {
  const queryClient = useQueryClient();
  const invalidarListado = () => queryClient.invalidateQueries({ queryKey: ['mapas-ruta'] });

  return useMutation({
    mutationFn: ({ mapaRutaId, req }: Variables) =>
      mapasRutaService.cambiarFechaFin(mapaRutaId, req),
    onSuccess: invalidarListado,
    onError: (err: unknown) => {
      if (hasApiErrorCode(err, 'MAPA_RUTA_NO_ENCONTRADO')) invalidarListado();
    },
  });
}
