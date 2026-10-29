import { describe, it, expect } from 'vitest';
import { construirFiltros } from './filtros-entregable';

describe('construirFiltros', () => {
  it('arma el nodo según el texto y los estados recibidos', () => {
    // Assert
    expect(construirFiltros('   ', [])).toBeUndefined();
    expect(construirFiltros('  riego ', [])).toEqual({
      tipo: 'PREDICADO',
      campo: 'proyectoGradoNombre',
      operador: 'CONTIENE',
      valor: 'riego',
    });
    expect(construirFiltros('', ['APROBADO'])).toEqual({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoEntregable',
      operador: 'IN',
      valores: ['APROBADO'],
    });
    expect(construirFiltros('riego', ['APROBADO', 'CERRADO'])).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [
        { tipo: 'PREDICADO', campo: 'proyectoGradoNombre', operador: 'CONTIENE', valor: 'riego' },
        {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'estadoEntregable',
          operador: 'IN',
          valores: ['APROBADO', 'CERRADO'],
        },
      ],
    });
  });
});
