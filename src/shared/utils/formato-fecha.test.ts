import { describe, it, expect } from 'vitest';
import { formatearFechaCorta, textoRangoFechas } from './formato-fecha';

describe('formato de fechas cortas', () => {
  it('formatearFechaCorta entrega dd/mm/aaaa sin mover el día', () => {
    expect(formatearFechaCorta('2026-10-01')).toBe('01/10/2026');
    expect(formatearFechaCorta('2026-12-31')).toBe('31/12/2026');
  });

  it('textoRangoFechas cubre rango completo, solo desde, solo hasta y vacío', () => {
    expect(textoRangoFechas('2026-10-01', '2026-10-27')).toBe('01/10/2026 – 27/10/2026');
    expect(textoRangoFechas('2026-10-01', '')).toBe('Desde 01/10/2026');
    expect(textoRangoFechas('', '2026-10-27')).toBe('Hasta 27/10/2026');
    expect(textoRangoFechas('', '')).toBe('');
  });
});
