import { describe, it, expect } from 'vitest';
import { destinosPermitidos } from './transiciones-estado-documentacion';

describe('destinosPermitidos', () => {
  it('ofrece solo destinos válidos: nunca Pendiente ni el estado actual', () => {
    // Act / Assert
    expect(destinosPermitidos('PENDIENTE')).toEqual(['PUBLICADO', 'NO_PUBLICADO']);
    expect(destinosPermitidos('PUBLICADO')).toEqual(['NO_PUBLICADO']);
    expect(destinosPermitidos('NO_PUBLICADO')).toEqual(['PUBLICADO']);
    expect(destinosPermitidos('VACIO')).toEqual([]);
    expect(destinosPermitidos('DESCONOCIDO')).toEqual([]);
    for (const estado of ['PENDIENTE', 'PUBLICADO', 'NO_PUBLICADO']) {
      expect(destinosPermitidos(estado)).not.toContain('PENDIENTE');
      expect(destinosPermitidos(estado)).not.toContain(estado);
    }
  });
});
