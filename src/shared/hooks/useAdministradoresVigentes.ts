import { useQuery } from '@tanstack/react-query';
import { administradoresVigentesService } from '../services/administradoresVigentesService';

const TAMANIO_PAGINA_ADMINISTRADORES = 100;

export function useAdministradoresVigentes() {
  return useQuery({
    queryKey: ['usuarios', 'administradores-vigentes'],
    queryFn: () =>
      administradoresVigentesService.consultarAdministradoresVigentes({
        pagina: 0,
        tamanio: TAMANIO_PAGINA_ADMINISTRADORES,
        ordenamiento: ['nombre:ASC'],
      }),
  });
}
