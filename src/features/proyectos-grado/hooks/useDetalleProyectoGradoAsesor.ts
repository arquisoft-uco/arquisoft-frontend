import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { proyectosGradoService } from '../services/proyectosGradoService';

const REINTENTOS_MAXIMOS = 3;

export function useDetalleProyectoGradoAsesor(proyectoGradoId: string) {
  return useQuery({
    queryKey: ['proyectos-grado', proyectoGradoId, 'asesor'],
    queryFn: () => proyectosGradoService.getDetalleProyectoAsesor(proyectoGradoId),
    enabled: !!proyectoGradoId,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });
}
