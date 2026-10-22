import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mapasRutaService } from '../services/mapasRutaService';

export function useAgregarMapaRuta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mapasRutaService.agregarMapaRuta,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mapas-ruta'] }),
  });
}
