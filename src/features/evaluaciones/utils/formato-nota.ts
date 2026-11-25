import type { NotasEvaluacion } from '../models/NotasEvaluacion';
import type { NotasEvaluador } from '../models/NotasEvaluador';

export function formatearNota(valor: number | null): string {
  return valor === null ? '—' : valor.toFixed(2).replace('.', ',');
}

export function textoDesgloseNotasEvaluacion(notas: NotasEvaluacion): string {
  return `Asesor ${formatearNota(notas.notaAsesor)} · Jurados ${formatearNota(notas.notaJurados)}`;
}

export function textoDesgloseNotasEvaluador(notas: NotasEvaluador): string {
  return `Cualitativa ${formatearNota(notas.resumenCualitativo)} · Cuantitativa ${formatearNota(notas.resumenCuantitativo)}`;
}
