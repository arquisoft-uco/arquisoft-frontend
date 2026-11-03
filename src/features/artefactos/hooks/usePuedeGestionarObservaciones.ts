import type { VersionArtefacto } from '../models/VersionArtefacto';
import { puedeGestionarObservaciones } from '../utils/revision-version';
import { useArtefactosOmitidosAsesor } from './useArtefactosOmitidosAsesor';

export function usePuedeGestionarObservaciones() {
  const catalogo = useArtefactosOmitidosAsesor();

  function puedeGestionar(version: VersionArtefacto): boolean {
    const omitidos = catalogo.omitidos;
    if (!omitidos || catalogo.isError) return false;
    return puedeGestionarObservaciones({
      version,
      artefactoOmitido: omitidos.has(version.artefacto),
    });
  }

  return { puedeGestionar, omitidos: catalogo.omitidos };
}
