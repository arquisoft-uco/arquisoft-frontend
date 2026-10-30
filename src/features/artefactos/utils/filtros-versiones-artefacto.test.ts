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
  it('sin texto ni fechas devuelve undefined y con solo espacios también', () => {
    // Act
    const vacio = construirFiltros({ texto: '', desde: '', hasta: '' });
    const espacios = construirFiltros({ texto: '   ', desde: '', hasta: '' });

    // Assert
    expect(vacio).toBeUndefined();
    expect(espacios).toBeUndefined();
  });

  it('el texto arma un GRUPO OR de CONTIENE sobre documento y proyecto con el valor recortado', () => {
    // Act
    const filtros = construirFiltros({ texto: '  acta ', desde: '', hasta: '' });

    // Assert
    expect(filtros).toEqual({
      tipo: 'GRUPO',
      conector: 'OR',
      nodos: [
        { tipo: 'PREDICADO', campo: 'nombreDocumento', operador: 'CONTIENE', valor: 'acta' },
        { tipo: 'PREDICADO', campo: 'nombreProyecto', operador: 'CONTIENE', valor: 'acta' },
      ],
    });
  });

  it('desde y hasta usan el límite del día en hora local convertido a UTC sin zona', () => {
    // Act
    const filtros = construirFiltros({ texto: '', desde: '2026-10-27', hasta: '2026-10-31' });

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

  it('con texto y fechas arma un GRUPO AND con el grupo del texto y los dos predicados', () => {
    // Act
    const filtros = construirFiltros({ texto: 'acta', desde: '2026-10-01', hasta: '2026-10-02' });

    // Assert
    expect(filtros).toMatchObject({ tipo: 'GRUPO', conector: 'AND' });
    const nodos = filtros && 'nodos' in filtros ? filtros.nodos : [];
    expect(nodos).toHaveLength(3);
    expect(nodos[0]).toMatchObject({ tipo: 'GRUPO', conector: 'OR' });
  });

  it('leerFecha descarta formatos inválidos y fechas imposibles', () => {
    // Assert
    expect(leerFecha('2026-10-27')).toBe('2026-10-27');
    expect(leerFecha('27/10/2026')).toBe('');
    expect(leerFecha('2026-02-30')).toBe('');
    expect(leerFecha('')).toBe('');
  });
});
