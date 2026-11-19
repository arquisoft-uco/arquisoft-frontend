import { useQuery } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';

export function useCategoriasItemCuantitativoAsesor() {
  return useQuery({
    queryKey: ['evaluaciones', 'categorias-item-cuantitativo-asesor'],
    queryFn: () => evaluacionesService.getCategoriasItemCuantitativoAsesor(),
  });
}
