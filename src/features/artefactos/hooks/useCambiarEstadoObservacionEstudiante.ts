import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '../../../shared/hooks/useToast';
import type { CambiarEstadoObservacionEstudianteRequest } from '../models/CambiarEstadoObservacionEstudianteRequest';
import { artefactosService } from '../services/artefactosService';
import { ESTADO_OBSERVACION_SOLUCIONADA } from '../utils/decision-observacion';
import {
  avanceObservacionYaNoAplica,
  mensajeErrorAvanceObservacion,
} from '../utils/errores-avance-observacion';
import { claveObservacionesRevisionEstudiante } from './useObservacionesRevisionEstudiante';

interface Variables extends CambiarEstadoObservacionEstudianteRequest {
  observacionId: string;
  revisionAsesorId: string;
}

export function useCambiarEstadoObservacionEstudiante() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, Variables>({
    mutationFn: ({ observacionId, estado }) =>
      artefactosService.cambiarEstadoObservacionEstudiante(observacionId, { estado }),
    onSuccess: (_data, { revisionAsesorId, estado }) => {
      toast.success(
        estado === ESTADO_OBSERVACION_SOLUCIONADA
          ? 'Observación marcada como solucionada'
          : 'Observación marcada como en progreso',
      );
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: claveObservacionesRevisionEstudiante(revisionAsesorId),
        }),
      ]);
    },
    onError: (err, { revisionAsesorId }) => {
      toast.error(
        'No se pudo actualizar la observación',
        mensajeErrorAvanceObservacion(err, 'Inténtalo nuevamente.'),
      );
      if (avanceObservacionYaNoAplica(err)) {
        return Promise.all([
          queryClient.invalidateQueries({
            queryKey: claveObservacionesRevisionEstudiante(revisionAsesorId),
          }),
          queryClient.invalidateQueries({ queryKey: ['artefactos', 'versiones-artefacto'] }),
          queryClient.invalidateQueries({ queryKey: ['artefactos', 'estudiante'] }),
        ]);
      }
    },
  });
}
