import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

// Tope del backend (QueryCriteria.MAX_TAMANIO): cubre las evaluaciones de la ficha sin paginar
const TAMANIO_EVALUACIONES = 100;

export function useEvaluacionesFichaAsesor(fichaPerfilId: string, habilitado = true) {
  return useQuery({
    queryKey: ['fichas-perfil', fichaPerfilId, 'asesor-evaluaciones'],
    queryFn: () =>
      fichasPerfilService.consultarEvaluacionesFichasAsesor({
        pagina: 0,
        tamanio: TAMANIO_EVALUACIONES,
        filtros: { tipo: 'PREDICADO', campo: 'fichaPerfil', operador: 'ES', valor: fichaPerfilId },
      }),
    select: (pagina) => pagina.content,
    enabled: !!fichaPerfilId && habilitado,
  });
}
