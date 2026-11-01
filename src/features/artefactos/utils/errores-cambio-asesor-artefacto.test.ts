import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import type { ApiError } from '../../../shared/models/api-response';
import {
  MENSAJE_ASESOR_NO_ASIGNADO_AL_PROYECTO,
  esAsesorNoAsignadoAlProyecto,
} from './errores-cambio-asesor-artefacto';

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: cuerpo.error,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function porCodigo(errorCode: string) {
  return crearErrorApi({
    error: 'Unprocessable Entity',
    errorCode,
    message: 'del backend',
    status: 422,
  });
}

describe('errores-cambio-asesor-artefacto', () => {
  it('solo el código de asesor no asignado al proyecto se reconoce', () => {
    // Assert
    expect(
      esAsesorNoAsignadoAlProyecto(porCodigo('ARTEFACTOS_ASESOR_PROYECTO_GRADO_NO_ASIGNADO')),
    ).toBe(true);
    expect(esAsesorNoAsignadoAlProyecto(porCodigo('ARTEFACTOS_ASESOR_NO_VIGENTE'))).toBe(false);
    expect(esAsesorNoAsignadoAlProyecto(new Error('fallo de red'))).toBe(false);
    expect(MENSAJE_ASESOR_NO_ASIGNADO_AL_PROYECTO).toMatch(/no está asignado/);
  });
});
