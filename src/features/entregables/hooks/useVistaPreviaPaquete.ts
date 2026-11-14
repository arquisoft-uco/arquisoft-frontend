import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { entregablesService } from '../services/entregablesService';

const REINTENTOS_MAXIMOS = 3;

export function useVistaPreviaPaquete(proyectoGradoId: string) {
  return useQuery({
    queryKey: ['entregables', 'vista-previa-paquete', proyectoGradoId],
    queryFn: () => entregablesService.consultarVistaPreviaPaquete(proyectoGradoId),
    enabled: !!proyectoGradoId,
    staleTime: 0,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });
}
