import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { cierraPanelModificarObservacionItemAsesor } from './errores-modificar-observacion-item-asesor';

function errorApi(status: number, errorCode?: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message: 'x', status },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('cierraPanelModificarObservacionItemAsesor', () => {
  it('es verdadero para no encontrada, otro asesor y finalizada, y falso para el resto', () => {
    // Assert
    expect(
      cierraPanelModificarObservacionItemAsesor(
        errorApi(422, 'OBSERVACION_ITEM_ASESOR_NO_ENCONTRADA'),
      ),
    ).toBe(true);
    expect(
      cierraPanelModificarObservacionItemAsesor(
        errorApi(422, 'EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR'),
      ),
    ).toBe(true);
    expect(
      cierraPanelModificarObservacionItemAsesor(
        errorApi(422, 'OBSERVACION_ITEM_ASESOR_MODIFICACION_EVALUACION_FINALIZADA'),
      ),
    ).toBe(true);
    expect(
      cierraPanelModificarObservacionItemAsesor(
        errorApi(422, 'OBSERVACION_ITEM_ASESOR_DESCRIPCION_DUPLICADA'),
      ),
    ).toBe(false);
    expect(cierraPanelModificarObservacionItemAsesor(errorApi(400))).toBe(false);
    expect(cierraPanelModificarObservacionItemAsesor(new Error('red'))).toBe(false);
  });
});
