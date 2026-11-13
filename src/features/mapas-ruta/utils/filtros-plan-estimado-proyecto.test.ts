import { describe, it, expect } from 'vitest';
import { LIMITES } from '../../../shared/validation';
import { construirFiltrosPlanEstimadoProyecto } from './filtros-plan-estimado-proyecto';

describe('construirFiltrosPlanEstimadoProyecto', () => {
  it('sin texto no filtra y con texto arma un grupo OR recortado y cortado al máximo', () => {
    // Act / Assert
    expect(construirFiltrosPlanEstimadoProyecto('   ')).toBeUndefined();
    expect(construirFiltrosPlanEstimadoProyecto(' informe ')).toEqual({
      tipo: 'GRUPO',
      conector: 'OR',
      nodos: [
        { tipo: 'PREDICADO', campo: 'descripcionTarea', operador: 'CONTIENE', valor: 'informe' },
        {
          tipo: 'PREDICADO',
          campo: 'descripcionEstimado',
          operador: 'CONTIENE',
          valor: 'informe',
        },
      ],
    });

    const largo = construirFiltrosPlanEstimadoProyecto('a'.repeat(1000));
    const maximo = Math.max(LIMITES.TAREA_DESCRIPCION_MAX, LIMITES.PLAN_ESTIMADO_DESCRIPCION_MAX);
    expect(largo).toMatchObject({
      nodos: [{ valor: 'a'.repeat(maximo) }, { valor: 'a'.repeat(maximo) }],
    });
  });
});
