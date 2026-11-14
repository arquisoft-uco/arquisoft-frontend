import { describe, it, expect } from 'vitest';
import {
  coincideFrase,
  FRASE_CONFIRMACION_CANCELACION,
  FRASE_CONFIRMACION_FINALIZACION,
} from './frase-confirmacion';

describe('coincideFrase', () => {
  it('acepta la frase exacta, con espacios o con otra capitalización y rechaza lo demás', () => {
    // Assert
    expect(coincideFrase(FRASE_CONFIRMACION_CANCELACION, FRASE_CONFIRMACION_CANCELACION)).toBe(
      true,
    );
    expect(coincideFrase('  Cancelar proyecto de grado  ', FRASE_CONFIRMACION_CANCELACION)).toBe(
      true,
    );
    expect(coincideFrase('FINALIZAR PROYECTO DE GRADO', FRASE_CONFIRMACION_FINALIZACION)).toBe(
      true,
    );
    expect(coincideFrase('Cancelar proyecto', FRASE_CONFIRMACION_CANCELACION)).toBe(false);
    expect(coincideFrase(FRASE_CONFIRMACION_CANCELACION, FRASE_CONFIRMACION_FINALIZACION)).toBe(
      false,
    );
    expect(coincideFrase('', FRASE_CONFIRMACION_FINALIZACION)).toBe(false);
  });
});
