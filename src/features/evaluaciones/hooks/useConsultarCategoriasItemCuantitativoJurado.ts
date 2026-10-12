import { useQuery } from '@tanstack/react-query';
import { LIMITES } from '../../../shared/validation';
import { evaluacionesService } from '../services/evaluacionesService';

export function useConsultarCategoriasItemCuantitativoJurado(nombre: string) {
  const filtro = nombre.trim().slice(0, LIMITES.CATEGORIA_ITEM_CUANTITATIVO_NOMBRE_FILTRO_MAX);

  return useQuery({
    queryKey: ['evaluaciones', 'categorias-item-cuantitativo-jurado', 'consulta', filtro],
    queryFn: () => evaluacionesService.getCategoriasItemCuantitativoJurado(filtro || undefined),
  });
}
