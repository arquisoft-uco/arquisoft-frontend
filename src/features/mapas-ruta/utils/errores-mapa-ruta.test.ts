import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { campoDeErrorMapaRuta, mensajeErrorMapaRuta } from './errores-mapa-ruta';

function errorApi(errorCode: string, message = 'mensaje crudo del backend') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('errores-mapa-ruta', () => {
  it.each([
    ['PROYECTO_GRADO_NO_ENCONTRADO', 'El proyecto ya no está disponible', 'proyectoGrado'],
    ['PROYECTO_GRADO_NO_PROPIETARIO', 'Solo el coordinador asignado', 'proyectoGrado'],
    ['PROYECTO_GRADO_NO_EN_PROCESO', 'ya no está en proceso', 'proyectoGrado'],
    ['MAPA_RUTA_DUPLICADO', 'ya tiene un mapa de ruta', 'proyectoGrado'],
    ['MAPA_RUTA_FECHA_FIN_NO_POSTERIOR', 'debe ser posterior', 'fechaFin'],
  ])('%s se traduce a texto propio y se atribuye a su campo', (codigo, texto, campo) => {
    // Arrange
    const err = errorApi(codigo);

    // Act / Assert
    expect(mensajeErrorMapaRuta(err)).toContain(texto);
    expect(campoDeErrorMapaRuta(err)).toBe(campo);
  });

  it('un código desconocido usa el message del backend y no se atribuye a un campo', () => {
    // Arrange
    const err = errorApi('OTRO_CODIGO', 'Algo falló');

    // Act / Assert
    expect(mensajeErrorMapaRuta(err)).toBe('Algo falló');
    expect(campoDeErrorMapaRuta(err)).toBeNull();
  });

  it('un error sin payload usa el mensaje por defecto', () => {
    // Act / Assert
    expect(mensajeErrorMapaRuta(new Error('red'))).toBe(
      'Verifica los datos e inténtalo nuevamente.',
    );
  });
});
