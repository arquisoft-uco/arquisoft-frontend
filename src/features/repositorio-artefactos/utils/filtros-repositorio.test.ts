import { describe, it, expect } from 'vitest';
import { construirFiltros } from './filtros-repositorio';

describe('construirFiltros', () => {
  it('devuelve undefined con texto vacío o solo espacios', () => {
    // Act / Assert
    expect(construirFiltros('')).toBeUndefined();
    expect(construirFiltros('   ')).toBeUndefined();
  });

  it('arma un grupo OR con tres predicados CONTIENE y el texto recortado', () => {
    // Act
    const filtros = construirFiltros('  proyecto ');

    // Assert
    expect(filtros).toEqual({
      tipo: 'GRUPO',
      conector: 'OR',
      nodos: [
        { tipo: 'PREDICADO', campo: 'nombreRepositorio', operador: 'CONTIENE', valor: 'proyecto' },
        { tipo: 'PREDICADO', campo: 'descripcion', operador: 'CONTIENE', valor: 'proyecto' },
        {
          tipo: 'PREDICADO',
          campo: 'administradorNombre',
          operador: 'CONTIENE',
          valor: 'proyecto',
        },
      ],
    });
  });
});
