import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { mensajeDeErrorOmitir } from './errores-omitir-artefacto';

function porCodigo(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message: 'del backend', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('mensajeDeErrorOmitir', () => {
  it('traduce los códigos de dato obsoleto y deja pasar el mensaje del servidor o el respaldo', () => {
    // Act
    const omitido = mensajeDeErrorOmitir(porCodigo('ARTEFACTOS_ARTEFACTO_OMITIDO'), 'Anteproyecto');
    const noExiste = mensajeDeErrorOmitir(
      porCodigo('ARTEFACTOS_ARTEFACTO_NO_ENCONTRADO'),
      'Anteproyecto',
    );
    const otro = mensajeDeErrorOmitir(
      porCodigo('ARTEFACTOS_ARTEFACTO_ASESOR_NO_PROPIETARIO'),
      'Anteproyecto',
    );
    const sinRed = mensajeDeErrorOmitir(new Error('Network Error'), 'Anteproyecto');

    // Assert
    expect(omitido).toBe('«Anteproyecto» ya estaba omitido.');
    expect(noExiste).toBe('El artefacto ya no existe.');
    expect(otro).toBe('del backend');
    expect(sinRed).toBe('Inténtalo nuevamente.');
  });
});
