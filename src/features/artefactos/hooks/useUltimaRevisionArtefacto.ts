import { motivoBloqueoSubida } from '../utils/bloqueo-subida-version';
import { desVersion } from '../utils/revision-gestionable';
import { useUltimasVersionesEstudiante } from './useUltimasVersionesEstudiante';

export function useUltimaRevisionArtefacto(artefactoId: string) {
  const { ultimaVersion, isLoading, isError, refetch } = useUltimasVersionesEstudiante([
    artefactoId,
  ]);
  const ultima = ultimaVersion(artefactoId);

  const revision = ultima ? desVersion(ultima) : null;
  const motivoSubida = ultima === undefined ? undefined : motivoBloqueoSubida(ultima);

  return {
    ultima,
    revision,
    isLoading,
    isError,
    refetch,
    motivoSubida,
    puedeSubir: motivoSubida === null,
  };
}
