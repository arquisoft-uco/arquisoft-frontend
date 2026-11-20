import { describe, it, expect } from 'vitest';
import { errorApi } from '../../test-utils/errores-api';
import { debeReintentarConsulta, REINTENTOS_MAXIMOS } from './reintentar-consulta';

describe('debeReintentarConsulta', () => {
  it('no reintenta errores 4xx de negocio y sí los transitorios, de red y 5xx, hasta el máximo', () => {
    // Assert
    for (const status of [400, 403, 404, 422]) {
      expect(debeReintentarConsulta(0, errorApi(status))).toBe(false);
    }
    for (const status of [408, 429, 500, 503]) {
      expect(debeReintentarConsulta(0, errorApi(status))).toBe(true);
    }
    expect(debeReintentarConsulta(0, new Error('sin respuesta'))).toBe(true);
    expect(debeReintentarConsulta(REINTENTOS_MAXIMOS - 1, errorApi(500))).toBe(true);
    expect(debeReintentarConsulta(REINTENTOS_MAXIMOS, errorApi(500))).toBe(false);
  });
});
