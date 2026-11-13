import { describe, it, expect } from 'vitest';
import { LIMITES } from '../../../shared/validation';
import { construirFiltrosPlanRealProyecto } from './filtros-plan-real';

describe('construirFiltrosPlanRealProyecto', () => {
  it('sin texto o con solo espacios no devuelve filtro', () => {
    // Act / Assert
    expect(construirFiltrosPlanRealProyecto('')).toBeUndefined();
    expect(construirFiltrosPlanRealProyecto('   ')).toBeUndefined();
  });

  it('con texto devuelve un grupo OR que busca en la tarea y en la descripción del plan', () => {
    // Act
    const filtro = construirFiltrosPlanRealProyecto(' informe ');

    // Assert
    expect(filtro).toEqual({
      tipo: 'GRUPO',
      conector: 'OR',
      nodos: [
        { tipo: 'PREDICADO', campo: 'descripcionTarea', operador: 'CONTIENE', valor: 'informe' },
        { tipo: 'PREDICADO', campo: 'descripcionReal', operador: 'CONTIENE', valor: 'informe' },
      ],
    });
  });

  it('corta el texto al máximo permitido', () => {
    // Arrange
    const maximo = Math.min(LIMITES.TAREA_DESCRIPCION_MAX, LIMITES.PLAN_REAL_DESCRIPCION_MAX);

    // Act
    const filtro = construirFiltrosPlanRealProyecto('a'.repeat(maximo + 50));

    // Assert
    expect(filtro).toMatchObject({
      nodos: [{ valor: 'a'.repeat(maximo) }, { valor: 'a'.repeat(maximo) }],
    });
  });
});
