import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CambiarVersionRepositorioArtefactoRequest } from '../models/CambiarVersionRepositorioArtefactoRequest';
import { artefactosService } from '../services/artefactosService';
import { esErrorQueDesactualizaListado } from '../utils/errores-cambio-version-repositorio';

const CLAVE_LISTADO_ASESOR = ['artefactos', 'asesor'];
const CLAVE_VERSIONES_ARTEFACTO = ['artefactos', 'versiones-artefacto'];

export function useCambiarVersionRepositorioArtefacto() {
  const queryClient = useQueryClient();

  function invalidar() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: CLAVE_LISTADO_ASESOR }),
      queryClient.invalidateQueries({ queryKey: CLAVE_VERSIONES_ARTEFACTO }),
    ]);
  }

  return useMutation({
    mutationFn: (req: CambiarVersionRepositorioArtefactoRequest) =>
      artefactosService.cambiarVersionRepositorioArtefacto(req),
    onSuccess: invalidar,
    onError: (err) => {
      if (esErrorQueDesactualizaListado(err)) return invalidar();
    },
  });
}
