import { useQuery } from '@tanstack/react-query';
import { asesoresVigentesService } from '../services/asesoresVigentesService';

export function useAsesoresVigentes() {
  return useQuery({
    queryKey: ['usuarios', 'asesores-vigentes'],
    queryFn: asesoresVigentesService.consultarVigentes,
  });
}
