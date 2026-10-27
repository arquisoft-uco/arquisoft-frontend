import { describe, it, expect } from 'vitest';
import { formatearFechaCreacion, formatearTamano } from './formato-version';

describe('formato-version', () => {
  it('formatearTamano usa la unidad que corresponde con un decimal', () => {
    // Assert
    expect(formatearTamano(0)).toBe('0 B');
    expect(formatearTamano(1023)).toBe('1023 B');
    expect(formatearTamano(1024)).toBe('1.0 KB');
    expect(formatearTamano(1536)).toBe('1.5 KB');
    expect(formatearTamano(5 * 1024 * 1024)).toBe('5.0 MB');
    expect(formatearTamano(3 * 1024 ** 3)).toBe('3.0 GB');
  });

  it('formatearFechaCreacion devuelve texto legible para un ISO válido', () => {
    // Act
    const texto = formatearFechaCreacion('2026-03-15T14:30:00Z');

    // Assert
    expect(texto).not.toBe('');
    expect(texto).toContain('2026');
  });
});
