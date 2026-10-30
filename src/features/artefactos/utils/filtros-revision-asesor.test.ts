import { describe, it, expect } from 'vitest';
import { construirFiltros } from './filtros-revision-asesor';

describe('construirFiltros', () => {
  it('sin estados no hay filtro y con estados arma un único IN sobre el estado de la revisión', () => {
    // Act
    const sinEstados = construirFiltros([]);
    const conEstados = construirFiltros(['PENDIENTE', 'CERRADA']);

    // Assert
    expect(sinEstados).toBeUndefined();
    expect(conEstados).toEqual({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoRevisionAsesor',
      operador: 'IN',
      valores: ['PENDIENTE', 'CERRADA'],
    });
  });
});
