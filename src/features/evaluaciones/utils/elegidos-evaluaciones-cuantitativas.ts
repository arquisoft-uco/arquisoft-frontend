import type { OpcionCombobox } from '../../../shared/hooks/useCombobox';
import type { ItemCuantitativoJurado } from '../models/ItemCuantitativoJurado';
import type { ParEvaluacionCuantitativaJurado } from '../models/ParEvaluacionCuantitativaJurado';

export function armarElegidos(
  pares: ParEvaluacionCuantitativaJurado[],
  itemsPorId: ReadonlyMap<string, ItemCuantitativoJurado>,
  nombresCategoria: ReadonlyMap<string, string>,
): OpcionCombobox[] {
  return pares.map(({ itemId, puntaje, observacion }) => {
    const item = itemsPorId.get(itemId);
    const categoria = item ? (nombresCategoria.get(item.categoriaId) ?? 'Sin categoría') : '';
    const base = `${categoria} · puntaje ${puntaje} de ${item?.valor ?? '—'}`;
    return {
      id: itemId,
      etiqueta: item?.nombre ?? itemId,
      descripcion: observacion ? `${base} · con observación` : base,
    };
  });
}
