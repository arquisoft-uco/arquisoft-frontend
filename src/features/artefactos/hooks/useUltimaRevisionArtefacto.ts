import { motivoBloqueoSubida } from '../utils/bloqueo-subida-version';
import { desVersion } from '../utils/revision-gestionable';
import { useRevisionEnProgresoReciente } from './useRevisionEnProgresoReciente';
import { useUltimasVersionesEstudiante } from './useUltimasVersionesEstudiante';

export function useUltimaRevisionArtefacto(artefactoId: string) {
  const ultimas = useUltimasVersionesEstudiante([artefactoId]);
  const ultima = ultimas.ultimaVersion(artefactoId);

  const revisionDeUltima = ultima ? desVersion(ultima) : null;
  const buscarAnterior = ultima !== undefined && ultima !== null && revisionDeUltima === null;
  const anterior = useRevisionEnProgresoReciente(artefactoId, buscarAnterior);

  const revision = revisionDeUltima ?? anterior.revision ?? null;
  const motivoSubida = ultima === undefined ? undefined : motivoBloqueoSubida(ultima);

  return {
    ultima,
    revision,
    isLoading: ultimas.isLoading || anterior.isLoading,
    isError: ultimas.isError || anterior.isError,
    refetch: () =>
      Promise.all([ultimas.refetch(), buscarAnterior ? anterior.refetch() : undefined]),
    motivoSubida,
    puedeSubir: motivoSubida === null,
  };
}
