import { describe, it, expect } from 'vitest';
import { construirCriterioRespuestas, construirFiltrosRespuestas } from './criterio-respuestas';

describe('construirFiltrosRespuestas', () => {
  it('omite el filtro sin estados y arma un único predicado IN con los estados', () => {
    // Assert
    expect(construirFiltrosRespuestas([])).toBeUndefined();
    expect(construirFiltrosRespuestas(['APROBADA', 'EN_REVISION'])).toEqual({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoRespuestaId',
      operador: 'IN',
      valores: ['APROBADA', 'EN_REVISION'],
    });
  });
});

describe('construirCriterioRespuestas', () => {
  it('arma página, tamaño, orden en formato campo:DIRECCION y filtros', () => {
    // Act
    const criterio = construirCriterioRespuestas(
      {
        page: 2,
        estadoIds: ['APROBADA'],
        ordenCampo: 'destinatarioNombre',
        ordenDireccion: 'ASC',
      },
      10,
    );

    // Assert
    expect(criterio).toEqual({
      pagina: 2,
      tamanio: 10,
      ordenamiento: ['destinatarioNombre:ASC'],
      filtros: {
        tipo: 'PREDICADO_MULTIVALOR',
        campo: 'estadoRespuestaId',
        operador: 'IN',
        valores: ['APROBADA'],
      },
    });
  });
});
