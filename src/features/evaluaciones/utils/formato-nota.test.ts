import { describe, it, expect } from 'vitest';
import {
  formatearNota,
  textoDesgloseNotasEvaluacion,
  textoDesgloseNotasEvaluador,
} from './formato-nota';

describe('formatearNota', () => {
  it('da dos decimales con coma, distingue 0 de null y no recorta hacia arriba', () => {
    // Act / Assert
    expect(formatearNota(null)).toBe('—');
    expect(formatearNota(0)).toBe('0,00');
    expect(formatearNota(4.5)).toBe('4,50');
    expect(formatearNota(3.456)).toBe('3,46');
    expect(formatearNota(5)).toBe('5,00');
  });
});

describe('desgloses de notas', () => {
  it('compone el texto con cada parte formateada y «—» donde falta', () => {
    // Act / Assert
    expect(textoDesgloseNotasEvaluacion({ notaAsesor: 4, notaJurados: 3.5, notaFinal: 3.75 })).toBe(
      'Asesor 4,00 · Jurados 3,50',
    );
    expect(
      textoDesgloseNotasEvaluacion({ notaAsesor: null, notaJurados: null, notaFinal: null }),
    ).toBe('Asesor — · Jurados —');
    expect(
      textoDesgloseNotasEvaluador({
        resumenCualitativo: 3.5,
        resumenCuantitativo: 4,
        notaAcumulada: 3.75,
      }),
    ).toBe('Cualitativa 3,50 · Cuantitativa 4,00');
    expect(
      textoDesgloseNotasEvaluador({
        resumenCualitativo: 0,
        resumenCuantitativo: null,
        notaAcumulada: null,
      }),
    ).toBe('Cualitativa 0,00 · Cuantitativa —');
  });
});
