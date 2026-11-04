import { describe, it, expect } from 'vitest';
import { CAMPOS_BUSQUEDA, construirFiltros } from './filtros-versiones-repositorio';

describe('construirFiltros de versiones de repositorio', () => {
  it('texto vacío no filtra y con texto arma un OR CONTIENE por campo con el valor recortado', () => {
    // Act
    const vacio = construirFiltros('');
    const espacios = construirFiltros('   ');
    const conTexto = construirFiltros('  acta  ');

    // Assert
    expect(vacio).toBeUndefined();
    expect(espacios).toBeUndefined();
    expect(conTexto).toEqual({
      tipo: 'GRUPO',
      conector: 'OR',
      nodos: CAMPOS_BUSQUEDA.map((campo) => ({
        tipo: 'PREDICADO',
        campo,
        operador: 'CONTIENE',
        valor: 'acta',
      })),
    });
  });
});
