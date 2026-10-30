import { normalizarTexto } from '../../../shared/hooks/useCombobox';
import type { ArtefactoConNombre } from '../models/ArtefactoConNombre';

export function buscarArtefactos(artefactos: ArtefactoConNombre[], texto: string): string[] {
  const buscado = normalizarTexto(texto.trim());
  if (buscado === '') return [];
  return artefactos
    .filter(
      (a) =>
        normalizarTexto(a.nombreDocumento).includes(buscado) ||
        normalizarTexto(a.nombreProyecto).includes(buscado),
    )
    .map((a) => a.id);
}
