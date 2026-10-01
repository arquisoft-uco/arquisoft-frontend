import { useQuery } from '@tanstack/react-query';
import { asesoresFichaService } from '../services/asesoresFichaService';

export function useAsesoresFichaVigentes() {
  return useQuery({
    queryKey: ['usuarios', 'asesores-ficha-vigentes'],
    queryFn: asesoresFichaService.consultarVigentes,
  });
}
