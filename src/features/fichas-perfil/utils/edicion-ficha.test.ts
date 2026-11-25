import { describe, expect, it } from 'vitest';
import { admiteEdicionFicha } from './edicion-ficha';

describe('admiteEdicionFicha', () => {
  it('solo admite edición con la ficha en construcción', () => {
    expect(admiteEdicionFicha('EN_CONSTRUCCION')).toBe(true);
    [
      'DISPONIBLE_PARA_EVALUACION',
      'DESCARTADA',
      'APROBADA',
      'APROBADA_CON_OBSERVACIONES',
      'NO_APROBADA',
      undefined,
    ].forEach((estado) => expect(admiteEdicionFicha(estado)).toBe(false));
  });
});
