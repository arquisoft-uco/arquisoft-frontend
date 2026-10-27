import { describe, it, expect } from 'vitest';
import {
  construirFiltros,
  formatearFechaFiltro,
  inicioDelDiaSiguienteUtc,
  inicioDelDiaUtc,
  leerFecha,
} from './filtros-versiones-artefacto';

function utcDeDiaLocal(anio: number, mes: number, dia: number): string {
  return new Date(anio, mes - 1, dia).toISOString().slice(0, 19);
}

describe('filtros de versiones de artefactos', () => {
  it('sin filtros devuelve undefined y con solo el artefacto un predicado ES', () => {
    // Act
    const vacio = construirFiltros({ artefacto: '', desde: '', hasta: '' });
    const soloArtefacto = construirFiltros({ artefacto: 'a-1', desde: '', hasta: '' });

    // Assert
    expect(vacio).toBeUndefined();
    expect(soloArtefacto).toEqual({
      tipo: 'PREDICADO',
      campo: 'artefacto',
      operador: 'ES',
      valor: 'a-1',
    });
  });

  it('desde y hasta usan el límite del día en hora local convertido a UTC sin zona', () => {
    // Act
    const filtros = construirFiltros({ artefacto: '', desde: '2026-10-27', hasta: '2026-10-31' });

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
      artefacto: 'a-1',
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

  it('formatearFechaFiltro entrega dd/mm/aaaa sin mover el día', () => {
    // Assert
    expect(formatearFechaFiltro('2026-01-05')).toBe('05/01/2026');
  });
});
