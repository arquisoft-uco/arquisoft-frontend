import { describe, it, expect } from 'vitest';
import {
  construirFiltros,
  inicioDelDiaSiguienteUtc,
  inicioDelDiaUtc,
  leerFecha,
} from './filtros-versiones-artefacto';

function utcDeDiaLocal(anio: number, mes: number, dia: number): string {
  return new Date(anio, mes - 1, dia).toISOString().slice(0, 19);
}

describe('filtros de versiones de artefactos', () => {
  it('sin filtros devuelve undefined y con solo el artefacto un predicado IN', () => {
    // Act
    const vacio = construirFiltros({ artefactos: [], desde: '', hasta: '' });
    const soloArtefacto = construirFiltros({ artefactos: ['a-1'], desde: '', hasta: '' });

    // Assert
    expect(vacio).toBeUndefined();
    expect(soloArtefacto).toEqual({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'artefacto',
      operador: 'IN',
      valores: ['a-1'],
    });
  });

  it('desde y hasta usan el límite del día en hora local convertido a UTC sin zona', () => {
    // Act
    const filtros = construirFiltros({ artefactos: [], desde: '2026-10-27', hasta: '2026-10-31' });

    // Assert
    expect(filtros).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [
        {
          tipo: 'PREDICADO',
          campo: 'fechaCreacion',
          operador: 'MAYOR_IGUAL_QUE',
          valor: utcDeDiaLocal(2026, 10, 27),
        },
        {
          tipo: 'PREDICADO',
          campo: 'fechaCreacion',
          operador: 'MENOR_QUE',
          valor: utcDeDiaLocal(2026, 11, 1),
        },
      ],
    });
    expect(inicioDelDiaUtc('2026-10-27')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    expect(inicioDelDiaSiguienteUtc('2026-12-31')).toBe(utcDeDiaLocal(2027, 1, 1));
  });

  it('con artefacto y fechas arma un GRUPO AND de tres predicados', () => {
    // Act
    const filtros = construirFiltros({
      artefactos: ['a-1'],
      desde: '2026-10-01',
      hasta: '2026-10-02',
    });

    // Assert
    expect(filtros).toMatchObject({ tipo: 'GRUPO', conector: 'AND' });
    expect(filtros && 'nodos' in filtros ? filtros.nodos : []).toHaveLength(3);
  });

  it('leerFecha descarta formatos inválidos y fechas imposibles', () => {
    // Assert
    expect(leerFecha('2026-10-27')).toBe('2026-10-27');
    expect(leerFecha('27/10/2026')).toBe('');
    expect(leerFecha('2026-02-30')).toBe('');
    expect(leerFecha('')).toBe('');
  });
});
