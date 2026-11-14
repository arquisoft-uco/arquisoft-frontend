import { useMutation, useQueryClient } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import { revisionYaNoEliminable } from '../utils/errores-eliminar-revision';

interface Variables {
  revisionAsesorId: string;
}

const CLAVE_VERSIONES = ['artefactos', 'versiones-artefacto'];
const CLAVE_ASESOR = ['artefactos', 'asesor'];
const CLAVE_REVISIONES = ['artefactos', 'revisiones-asesor'];

export function useEliminarRevision() {
  const queryClient = useQueryClient();

  function refrescar() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: CLAVE_VERSIONES }),
      queryClient.invalidateQueries({ queryKey: CLAVE_ASESOR }),
      queryClient.invalidateQueries({ queryKey: CLAVE_REVISIONES }),
    ]);
  }

  return useMutation<void, unknown, Variables>({
    mutationFn: ({ revisionAsesorId }) => artefactosService.eliminarRevision(revisionAsesorId),
    onSuccess: () => refrescar(),
    onError: (err) => {
      if (revisionYaNoEliminable(err)) return refrescar();
    },
  });
}
