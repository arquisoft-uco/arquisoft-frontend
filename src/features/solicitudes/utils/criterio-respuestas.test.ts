import { describe, it, expect } from 'vitest';
import { construirCriterioRespuestas, construirFiltrosRespuestas } from './criterio-respuestas';

describe('construirFiltrosRespuestas', () => {
  it('omite lo vacío, recorta el texto y combina texto y estados con AND', () => {
    // Assert
    expect(construirFiltrosRespuestas('   ', [])).toBeUndefined();
    expect(construirFiltrosRespuestas('  reunión  ', [])).toEqual({
      tipo: 'PREDICADO',
      campo: 'contenido',
      operador: 'CONTIENE',
      valor: 'reunión',
    });
    expect(construirFiltrosRespuestas('', ['APROBADA', 'EN_REVISION'])).toEqual({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoRespuestaId',
      operador: 'IN',
      valores: ['APROBADA', 'EN_REVISION'],
    });
    expect(construirFiltrosRespuestas('reunión', ['APROBADA'])).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [
        { tipo: 'PREDICADO', campo: 'contenido', operador: 'CONTIENE', valor: 'reunión' },
        {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'estadoRespuestaId',
          operador: 'IN',
          valores: ['APROBADA'],
        },
      ],
    });
  });
});

describe('construirCriterioRespuestas', () => {
  it('arma página, tamaño, orden en formato campo:DIRECCION y filtros', () => {
    // Act
    const criterio = construirCriterioRespuestas(
      {
        page: 2,
        texto: '',
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
