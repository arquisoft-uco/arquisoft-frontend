import type { VersionArtefacto } from '../models/VersionArtefacto';
import { estadoPermiteRegistrarRevision, puedeRegistrarRevision } from '../utils/revision-version';
import { useArtefactosOmitidosAsesor } from './useArtefactosOmitidosAsesor';
import { useUltimasVersionesArtefacto } from './useUltimasVersionesArtefacto';

export function usePuedeRegistrarRevision(versiones: VersionArtefacto[]) {
  const candidatos = versiones.filter(estadoPermiteRegistrarRevision).map((v) => v.artefacto);
  const catalogo = useArtefactosOmitidosAsesor();
  const ultimas = useUltimasVersionesArtefacto(candidatos, catalogo.omitidos !== undefined);

  function puedeRegistrar(version: VersionArtefacto): boolean {
    const omitidos = catalogo.omitidos;
    if (!omitidos || catalogo.isError || ultimas.isLoading || ultimas.isError) return false;
    return puedeRegistrarRevision({
      version,
      ultimaVersionId: ultimas.ultimaVersionId(version.artefacto),
      artefactoOmitido: omitidos.has(version.artefacto),
    });
  }

  return { puedeRegistrar };
}
