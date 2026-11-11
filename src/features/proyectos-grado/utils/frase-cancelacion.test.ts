import { describe, it, expect } from 'vitest';
import { coincideFraseConfirmacion, FRASE_CONFIRMACION_CANCELACION } from './frase-cancelacion';

describe('coincideFraseConfirmacion', () => {
  it('acepta la frase exacta, con espacios o con otra capitalización y rechaza lo demás', () => {
    // Assert
    expect(coincideFraseConfirmacion(FRASE_CONFIRMACION_CANCELACION)).toBe(true);
    expect(coincideFraseConfirmacion('  Cancelar proyecto de grado  ')).toBe(true);
    expect(coincideFraseConfirmacion('CANCELAR PROYECTO DE GRADO')).toBe(true);
    expect(coincideFraseConfirmacion('Cancelar proyecto')).toBe(false);
    expect(coincideFraseConfirmacion('')).toBe(false);
  });
});
