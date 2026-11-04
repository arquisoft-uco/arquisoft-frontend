import { describe, it, expect } from 'vitest';
import { construirFiltros, construirOrden, leerFechaIso } from './filtros-mapa-ruta';

const SIN_FECHAS = { inicioDesde: '', inicioHasta: '', finDesde: '', finHasta: '' };

describe('construirFiltros', () => {
  it('sin fechas no hay filtro y con una sola va el predicado suelto', () => {
    // Act / Assert
    expect(construirFiltros(SIN_FECHAS)).toBeUndefined();
    expect(construirFiltros({ ...SIN_FECHAS, finHasta: '2026-12-01' })).toEqual({
      tipo: 'PREDICADO',
      campo: 'fechaFin',
      operador: 'MENOR_IGUAL_QUE',
      valor: '2026-12-01',
    });
  });

  it('con dos o más fechas las une en un GRUPO AND con el campo y operador de cada una', () => {
    // Act
    const filtro = construirFiltros({
      ...SIN_FECHAS,
      inicioDesde: '2026-01-01',
      finDesde: '2026-06-01',
    });

    // Assert
    expect(filtro).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [
        {
          tipo: 'PREDICADO',
          campo: 'fechaInicio',
          operador: 'MAYOR_IGUAL_QUE',
          valor: '2026-01-01',
        },
        { tipo: 'PREDICADO', campo: 'fechaFin', operador: 'MAYOR_IGUAL_QUE', valor: '2026-06-01' },
      ],
    });
  });
});

describe('construirOrden', () => {
  it('el orden por defecto no se envía y los demás añaden la otra fecha ascendente', () => {
    // Act / Assert
    expect(construirOrden('fechaInicio', 'DESC')).toBeUndefined();
    expect(construirOrden('fechaInicio', 'ASC')).toEqual(['fechaInicio:ASC', 'fechaFin:ASC']);
    expect(construirOrden('fechaFin', 'DESC')).toEqual(['fechaFin:DESC', 'fechaInicio:ASC']);
  });
});

describe('leerFechaIso', () => {
  it('conserva una fecha válida y descarta el formato inválido y la fecha inexistente', () => {
    // Act / Assert
    expect(leerFechaIso('2026-03-05')).toBe('2026-03-05');
    expect(leerFechaIso('05/03/2026')).toBe('');
    expect(leerFechaIso('2026-02-31')).toBe('');
  });
});
