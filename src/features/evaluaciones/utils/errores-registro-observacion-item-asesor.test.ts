import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { cierraPanelRegistrarObservacionItemAsesor } from './errores-registro-observacion-item-asesor';
import {
  EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR,
  EVALUACION_ESTADO_FINALIZADA,
  OBSERVACION_ITEM_ASESOR_DESCRIPCION_DUPLICADA,
  OBSERVACION_ITEM_ASESOR_EVALUACION_NO_ENCONTRADA,
} from './codigos-error-evaluaciones';

function errorApi(status: number, errorCode?: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { status, errorCode, message: 'x' },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('cierraPanelRegistrarObservacionItemAsesor', () => {
  it('es verdadero solo para los 422 que el usuario no corrige en el campo', () => {
    // Arrange / Act / Assert
    expect(
      cierraPanelRegistrarObservacionItemAsesor(
        errorApi(422, OBSERVACION_ITEM_ASESOR_EVALUACION_NO_ENCONTRADA),
      ),
    ).toBe(true);
    expect(
      cierraPanelRegistrarObservacionItemAsesor(
        errorApi(422, EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR),
      ),
    ).toBe(true);
    expect(
      cierraPanelRegistrarObservacionItemAsesor(errorApi(422, EVALUACION_ESTADO_FINALIZADA)),
    ).toBe(true);
    expect(
      cierraPanelRegistrarObservacionItemAsesor(
        errorApi(422, OBSERVACION_ITEM_ASESOR_DESCRIPCION_DUPLICADA),
      ),
    ).toBe(false);
    expect(cierraPanelRegistrarObservacionItemAsesor(errorApi(400))).toBe(false);
    expect(cierraPanelRegistrarObservacionItemAsesor(new Error('red'))).toBe(false);
  });
});
