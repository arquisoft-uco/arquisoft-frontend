import { useQuery } from '@tanstack/react-query';
import { evaluacionesService } from '../services/evaluacionesService';

export function useCategoriasItemCuantitativoJurado() {
  return useQuery({
    queryKey: ['evaluaciones', 'categorias-item-cuantitativo-jurado'],
    queryFn: () => evaluacionesService.getCategoriasItemCuantitativoJurado(),
  });
}
