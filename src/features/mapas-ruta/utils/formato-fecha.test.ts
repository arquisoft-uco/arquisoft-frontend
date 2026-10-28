import { describe, it, expect } from 'vitest';
import { formatearFechaCivil } from './formato-fecha';

describe('formatearFechaCivil', () => {
  it('muestra el mismo día de la LocalDate y devuelve "—" si no es una fecha válida', () => {
    // Arrange
    const valida = '2026-03-05';

    // Act
    const texto = formatearFechaCivil(valida);

    // Assert
    expect(texto).toContain('5');
    expect(texto).toContain('2026');
    expect(formatearFechaCivil('no-es-fecha')).toBe('—');
    expect(formatearFechaCivil('2026-02-31')).toBe('—');
  });
});
