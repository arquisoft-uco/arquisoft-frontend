import { useQuery } from '@tanstack/react-query';
import { estudiantesVigentesService } from '../services/estudiantesVigentesService';

export function useEstudiantesVigentes() {
  return useQuery({
    queryKey: ['usuarios', 'estudiantes-vigentes'],
    queryFn: estudiantesVigentesService.consultarVigentes,
  });
}
