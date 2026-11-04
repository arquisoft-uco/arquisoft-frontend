import { useQuery } from '@tanstack/react-query';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { artefactosService } from '../services/artefactosService';

const REINTENTOS_MAXIMOS = 2;

export function useVersionArtefacto(versionId: string | null) {
  return useQuery({
    queryKey: ['artefactos', 'versiones-artefacto', 'detalle', versionId],
    queryFn: () => artefactosService.getVersionArtefacto(versionId!),
    enabled: !!versionId,
    retry: (intentos, error) => !isApiErrorWithStatus(error, 422) && intentos < REINTENTOS_MAXIMOS,
  });
}
