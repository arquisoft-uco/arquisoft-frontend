import { describe, it, expect } from 'vitest';
import { construirFiltrosRevisiones } from './filtros-revisiones-estudiante';
import { inicioDelDiaSiguienteUtc, inicioDelDiaUtc } from './filtros-versiones-artefacto';

const BASE = { texto: '', desde: '', hasta: '', estadoIds: [] };

describe('construirFiltrosRevisiones', () => {
  it('sin filtros excluye solo las revisiones pendientes', () => {
    // Assert
    expect(construirFiltrosRevisiones(BASE)).toEqual({
      tipo: 'PREDICADO',
      campo: 'estadoRevisionAsesor',
      operador: 'NO_ES',
      valor: 'PENDIENTE',
    });
  });

  it('con estados usa IN y descarta PENDIENTE', () => {
    // Act
    const filtro = construirFiltrosRevisiones({
      ...BASE,
      estadoIds: ['EN_PROGRESO', 'PENDIENTE'],
    });

    // Assert
    expect(filtro).toEqual({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoRevisionAsesor',
      operador: 'IN',
      valores: ['EN_PROGRESO'],
    });
  });

  it('combina texto y fechas en un grupo AND con el estado', () => {
    // Act
    const filtro = construirFiltrosRevisiones({
      texto: ' Doc ',
      desde: '2026-03-01',
      hasta: '2026-03-31',
      estadoIds: [],
    });

    // Assert
    expect(filtro).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [
        {
          tipo: 'PREDICADO',
          campo: 'estadoRevisionAsesor',
          operador: 'NO_ES',
          valor: 'PENDIENTE',
        },
        { tipo: 'PREDICADO', campo: 'nombreDocumento', operador: 'CONTIENE', valor: 'Doc' },
        {
          tipo: 'PREDICADO',
          campo: 'fechaCreacion',
          operador: 'MAYOR_IGUAL_QUE',
          valor: inicioDelDiaUtc('2026-03-01'),
        },
        {
          tipo: 'PREDICADO',
          campo: 'fechaCreacion',
          operador: 'MENOR_QUE',
          valor: inicioDelDiaSiguienteUtc('2026-03-31'),
        },
      ],
    });
  });
});
