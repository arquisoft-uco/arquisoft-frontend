import { describe, it, expect } from 'vitest';
import { destinosDeEstado } from './estados-tarea';

describe('destinosDeEstado', () => {
  it('ofrece solo las transiciones permitidas y nada para estados finales o desconocidos', () => {
    // Act / Assert
    expect(destinosDeEstado('NUEVA')).toEqual(['EN_PROGRESO', 'FINALIZADA']);
    expect(destinosDeEstado('EN_PROGRESO')).toEqual(['FINALIZADA']);
    expect(destinosDeEstado('FINALIZADA')).toEqual([]);
    expect(destinosDeEstado('DESCONOCIDO')).toEqual([]);
  });
});
