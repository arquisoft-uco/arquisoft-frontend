import { describe, it, expect } from 'vitest';
import { destinosDeEstado, esTareaRemovible } from './estados-tarea';

describe('esTareaRemovible', () => {
  it('permite eliminar NUEVA y EN_PROGRESO y no FINALIZADA ni un estado desconocido', () => {
    // Act / Assert
    expect(esTareaRemovible('NUEVA')).toBe(true);
    expect(esTareaRemovible('EN_PROGRESO')).toBe(true);
    expect(esTareaRemovible('FINALIZADA')).toBe(false);
    expect(esTareaRemovible('DESCONOCIDO')).toBe(false);
  });
});

describe('destinosDeEstado', () => {
  it('ofrece solo las transiciones permitidas y nada para estados finales o desconocidos', () => {
    // Act / Assert
    expect(destinosDeEstado('NUEVA')).toEqual(['EN_PROGRESO', 'FINALIZADA']);
    expect(destinosDeEstado('EN_PROGRESO')).toEqual(['FINALIZADA']);
    expect(destinosDeEstado('FINALIZADA')).toEqual([]);
    expect(destinosDeEstado('DESCONOCIDO')).toEqual([]);
  });
});
