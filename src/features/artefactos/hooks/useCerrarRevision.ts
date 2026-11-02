import { useMutation, useQueryClient } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import {
  cierreBloqueadoPorObservaciones,
  revisionYaNoCerrable,
} from '../utils/errores-cerrar-revision';

interface Variables {
  revisionAsesorId: string;
}

const CLAVE_VERSIONES = ['artefactos', 'versiones-artefacto'];
const CLAVE_ASESOR = ['artefactos', 'asesor'];
const CLAVE_REVISIONES = ['artefactos', 'revisiones-asesor'];

function claveObservaciones(revisionAsesorId: string) {
  return [...CLAVE_REVISIONES, revisionAsesorId, 'observaciones'];
}

export function useCerrarRevision() {
  const queryClient = useQueryClient();

  function refrescarRevision(revisionAsesorId: string) {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: CLAVE_VERSIONES }),
      queryClient.invalidateQueries({ queryKey: claveObservaciones(revisionAsesorId) }),
      queryClient.invalidateQueries({ queryKey: CLAVE_ASESOR }),
    ]);
  }

  return useMutation<void, unknown, Variables>({
    mutationFn: ({ revisionAsesorId }) => artefactosService.cerrarRevision(revisionAsesorId),
    onSuccess: (_datos, { revisionAsesorId }) => refrescarRevision(revisionAsesorId),
    onError: (err, { revisionAsesorId }) => {
      if (revisionYaNoCerrable(err)) return refrescarRevision(revisionAsesorId);
      if (cierreBloqueadoPorObservaciones(err)) {
        return queryClient.invalidateQueries({ queryKey: CLAVE_REVISIONES });
      }
    },
  });
}
