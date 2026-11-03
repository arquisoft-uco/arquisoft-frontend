import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import {
  VERSION_EN_USO,
  VERSION_NO_ENCONTRADA,
  mensajeErrorEliminarVersion,
  versionYaNoExiste,
} from './errores-eliminar-version';

function porCodigo(errorCode: string, message = 'del backend') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('errores-eliminar-version', () => {
  it('traduce EN_USO y NO_ENCONTRADA y usa el mensaje del backend o el respaldo en el resto', () => {
    // Assert
    expect(mensajeErrorEliminarVersion(porCodigo(VERSION_EN_USO), 'r')).toBe(
      'Esta versión está asignada a artefactos de proyectos de grado y no se puede eliminar.',
    );
    expect(mensajeErrorEliminarVersion(porCodigo(VERSION_NO_ENCONTRADA), 'r')).toBe(
      'La versión ya no existe.',
    );
    expect(mensajeErrorEliminarVersion(porCodigo('OTRO', 'otro motivo'), 'r')).toBe('otro motivo');
    expect(mensajeErrorEliminarVersion(new Error('Network Error'), 'respaldo')).toBe('respaldo');
  });

  it('versionYaNoExiste solo reconoce NO_ENCONTRADA', () => {
    // Assert
    expect(versionYaNoExiste(porCodigo(VERSION_NO_ENCONTRADA))).toBe(true);
    expect(versionYaNoExiste(porCodigo(VERSION_EN_USO))).toBe(false);
  });
});
