import { describe, it, expect } from 'vitest';
import { LIMITES } from '../../../shared/validation';
import { construirFiltrosTarea } from './filtros-tarea';

describe('construirFiltrosTarea', () => {
  it('sin texto ni estados no devuelve filtro y con uno solo devuelve su nodo', () => {
    // Act / Assert
    expect(construirFiltrosTarea('   ', [])).toBeUndefined();
    expect(construirFiltrosTarea(' diseño ', [])).toEqual({
      tipo: 'PREDICADO',
      campo: 'descripcion',
      operador: 'CONTIENE',
      valor: 'diseño',
    });
    expect(construirFiltrosTarea('', ['NUEVA', 'FINALIZADA'])).toEqual({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoItem',
      operador: 'IN',
      valores: ['NUEVA', 'FINALIZADA'],
    });
  });

  it('con texto y estados los une en un grupo AND', () => {
    // Act
    const filtro = construirFiltrosTarea('informe', ['NUEVA']);

    // Assert
    expect(filtro).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [
        { tipo: 'PREDICADO', campo: 'descripcion', operador: 'CONTIENE', valor: 'informe' },
        { tipo: 'PREDICADO_MULTIVALOR', campo: 'estadoItem', operador: 'IN', valores: ['NUEVA'] },
      ],
    });
  });

  it('corta el texto al máximo de la descripción', () => {
    // Act
    const filtro = construirFiltrosTarea('a'.repeat(LIMITES.TAREA_DESCRIPCION_MAX + 50), []);

    // Assert
    expect(filtro).toMatchObject({ valor: 'a'.repeat(LIMITES.TAREA_DESCRIPCION_MAX) });
  });
});
