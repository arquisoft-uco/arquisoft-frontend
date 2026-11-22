import type { ItemEvaluacionJurado } from '../models/ItemEvaluacionJurado';

export function marcarItemsPendientes<T extends { id: string }>(
  catalogo: T[],
  realizadas: { item: { id: string } }[],
): ItemEvaluacionJurado<T>[] {
  const evaluados = new Set(realizadas.map((r) => r.item.id));
  return catalogo.map((item) => ({ item, pendiente: !evaluados.has(item.id) }));
}

export function soloPendientes<T>(filas: ItemEvaluacionJurado<T>[]): T[] {
  return filas.filter((f) => f.pendiente).map((f) => f.item);
}
