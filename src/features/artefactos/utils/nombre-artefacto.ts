import type { ArtefactoConNombre } from '../models/ArtefactoConNombre';

export function nombreArtefacto(artefacto: ArtefactoConNombre): string {
  return `${artefacto.nombreDocumento} · ${artefacto.nombreProyecto}`;
}
