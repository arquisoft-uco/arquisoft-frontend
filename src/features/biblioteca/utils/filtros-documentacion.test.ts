import { describe, it, expect } from 'vitest';
import { construirFiltros } from './filtros-documentacion';

describe('construirFiltros', () => {
  it('sin estados no hay filtro y con estados arma el predicado IN por estadoDocumentacion', () => {
    // Assert
    expect(construirFiltros([])).toBeUndefined();
    expect(construirFiltros(['PENDIENTE', 'PUBLICADO'])).toEqual({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoDocumentacion',
      operador: 'IN',
      valores: ['PENDIENTE', 'PUBLICADO'],
    });
  });
});
