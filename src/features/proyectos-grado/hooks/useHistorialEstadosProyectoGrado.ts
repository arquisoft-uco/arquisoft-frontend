import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { ordenarMasRecientePrimero } from '../utils/historial-estados';

const REINTENTOS_MAXIMOS = 3;

export function useHistorialEstadosProyectoGrado(proyectoGradoId: string) {
  return useQuery({
    queryKey: ['proyectos-grado', proyectoGradoId, 'historial-estados'],
    queryFn: () => proyectosGradoService.getHistorialEstadosProyecto(proyectoGradoId),
    enabled: !!proyectoGradoId,
    select: ordenarMasRecientePrimero,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });
}
