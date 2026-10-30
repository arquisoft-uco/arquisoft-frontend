import type { FaseSubida } from '../models/FaseSubida';

export function textoDeAvanceSubida(fase: FaseSubida | null, porcentaje: number): string {
  if (fase === 'subiendo') return `Subiendo… ${porcentaje} %`;
  if (fase === 'registrando') return 'Registrando la versión…';
  return 'Preparando la carga…';
}
