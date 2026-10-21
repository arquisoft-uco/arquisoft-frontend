import { describe, it, expect } from 'vitest';
import { construirFiltros } from './filtros-proyecto-grado';

describe('construirFiltros', () => {
  it('combina el título y los estados según lo que haya', () => {
    // Arrange
    const titulo = {
      tipo: 'PREDICADO',
      campo: 'tituloProyecto',
      operador: 'CONTIENE',
      valor: 'monitoreo',
    };
    const estados = {
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoProyectoGrado',
      operador: 'IN',
      valores: ['EN_PROCESO', 'ATRASADO'],
    };

    // Act / Assert
    expect(construirFiltros('   ', [])).toBeUndefined();
    expect(construirFiltros('  monitoreo ', [])).toEqual(titulo);
    expect(construirFiltros('', ['EN_PROCESO', 'ATRASADO'])).toEqual(estados);
    expect(construirFiltros('monitoreo', ['EN_PROCESO', 'ATRASADO'])).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [titulo, estados],
    });
  });
});
