export function contarEnFrase(total: number, singular: string, plural: string): string {
  return `${total.toLocaleString('es-CO')} ${total === 1 ? singular : plural}`;
}
