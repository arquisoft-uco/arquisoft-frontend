import { useMutation, useQueryClient } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import { revisionYaNoRegistrable } from '../utils/errores-registrar-revision';

const CLAVE_VERSIONES = ['artefactos', 'versiones-artefacto'];
const CLAVE_ASESOR = ['artefactos', 'asesor'];

export function useRegistrarRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionArtefactoId: string) =>
      artefactosService.registrarRevision(versionArtefactoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLAVE_VERSIONES }),
    onError: (err) => {
      if (revisionYaNoRegistrable(err)) {
        return Promise.all([
          queryClient.invalidateQueries({ queryKey: CLAVE_VERSIONES }),
          queryClient.invalidateQueries({ queryKey: CLAVE_ASESOR }),
        ]);
      }
    },
  });
}
