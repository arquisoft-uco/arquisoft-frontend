import { describe, expect, it } from 'vitest';
import { LIMITES, MENSAJES_VALIDACION } from '../../../shared/validation';
import { pesoItemCualitativoJurado } from './item-cualitativo-jurado-schema';
import { pesoItemCualitativoAsesor } from './registrar-item-cualitativo-asesor-schema';

describe.each([
  [
    'jurado',
    pesoItemCualitativoJurado,
    LIMITES.ITEM_CUALITATIVO_PESO_MIN,
    LIMITES.ITEM_CUALITATIVO_PESO_MAX,
  ],
  [
    'asesor',
    pesoItemCualitativoAsesor,
    LIMITES.ITEM_CUALITATIVO_ASESOR_PESO_MIN,
    LIMITES.ITEM_CUALITATIVO_ASESOR_PESO_MAX,
  ],
])('peso del ítem cualitativo de %s', (_rol, schema, min, max) => {
  it('acepta enteros dentro del rango y rechaza vacío, fuera de rango y no enteros', () => {
    // Arrange / Act
    const mensaje = (valor: string) => {
      const r = schema.safeParse(valor);
      return r.success ? null : r.error.issues[0].message;
    };

    // Assert
    expect(mensaje(String(min))).toBeNull();
    expect(mensaje(String(max))).toBeNull();
    expect(mensaje('')).toBe(MENSAJES_VALIDACION.requerido);
    expect(mensaje(String(min - 1))).toBe(MENSAJES_VALIDACION.valorEntre(min, max));
    expect(mensaje(String(max + 1))).toBe(MENSAJES_VALIDACION.valorEntre(min, max));
    expect(mensaje('1.5')).toBe(MENSAJES_VALIDACION.soloDigitos);
    expect(mensaje('abc')).toBe(MENSAJES_VALIDACION.soloDigitos);
  });
});
