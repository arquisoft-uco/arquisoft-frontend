import type { ArtefactoAsesor } from '../models/ArtefactoAsesor';

export function nombreArtefacto(artefacto: ArtefactoAsesor): string {
  return `${artefacto.nombreDocumento} · ${artefacto.nombreProyecto}`;
}
