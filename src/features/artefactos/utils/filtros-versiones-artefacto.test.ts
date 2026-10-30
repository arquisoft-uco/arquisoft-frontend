import { describe, it, expect } from 'vitest';
import {
  construirFiltros,
  inicioDelDiaSiguienteUtc,
  inicioDelDiaUtc,
  leerArtefacto,
  leerFecha,
  SIN_REVISION,
} from './filtros-versiones-artefacto';

function utcDeDiaLocal(anio: number, mes: number, dia: number): string {
  return new Date(anio, mes - 1, dia).toISOString().slice(0, 19);
}

const BASE = { texto: '', desde: '', hasta: '', estadoIds: [], artefacto: '' };
const ARTEFACTO = '3f2b8c1e-9d4a-4e6b-8a1c-0b5d7e9f1a2c';

describe('filtros de versiones de artefactos', () => {
  it('sin texto ni fechas devuelve undefined y con solo espacios también', () => {
    // Act
    const vacio = construirFiltros(BASE);
    const espacios = construirFiltros({ ...BASE, texto: '   ' });

    // Assert
    expect(vacio).toBeUndefined();
    expect(espacios).toBeUndefined();
  });

  it('el texto arma un GRUPO OR de CONTIENE sobre documento y proyecto con el valor recortado', () => {
    // Act
    const filtros = construirFiltros({ ...BASE, texto: '  acta ', desde: '', hasta: '' });

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
    const filtros = construirFiltros({
      ...BASE,
      texto: '',
      desde: '2026-10-27',
      hasta: '2026-10-31',
    });

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
    const filtros = construirFiltros({
      ...BASE,
      texto: 'acta',
      desde: '2026-10-01',
      hasta: '2026-10-02',
    });

    // Assert
    expect(filtros).toMatchObject({ tipo: 'GRUPO', conector: 'AND' });
    const nodos = filtros && 'nodos' in filtros ? filtros.nodos : [];
    expect(nodos).toHaveLength(3);
    expect(nodos[0]).toMatchObject({ tipo: 'GRUPO', conector: 'OR' });
  });

  it('el estado arma ES_NULO, IN o un OR de ambos y nunca excluye nulos', () => {
    // Act
    const soloSin = construirFiltros({ ...BASE, estadoIds: [SIN_REVISION] });
    const soloCodigos = construirFiltros({ ...BASE, estadoIds: ['PENDIENTE', 'CERRADA'] });
    const ambos = construirFiltros({ ...BASE, estadoIds: [SIN_REVISION, 'PENDIENTE'] });

    // Assert
    expect(soloSin).toEqual({ tipo: 'PREDICADO', campo: 'estadoRevision', operador: 'ES_NULO' });
    expect(soloCodigos).toEqual({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoRevision',
      operador: 'IN',
      valores: ['PENDIENTE', 'CERRADA'],
    });
    expect(ambos).toEqual({
      tipo: 'GRUPO',
      conector: 'OR',
      nodos: [
        { tipo: 'PREDICADO', campo: 'estadoRevision', operador: 'ES_NULO' },
        {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'estadoRevision',
          operador: 'IN',
          valores: ['PENDIENTE'],
        },
      ],
    });
  });

  it('combina con AND el texto, las fechas, el artefacto y el estado', () => {
    // Act
    const filtros = construirFiltros({
      texto: 'acta',
      desde: '2026-10-01',
      hasta: '2026-10-02',
      estadoIds: [SIN_REVISION, 'PENDIENTE'],
      artefacto: ARTEFACTO,
    });

    // Assert
    const nodos = filtros && 'nodos' in filtros ? filtros.nodos : [];
    expect(filtros).toMatchObject({ tipo: 'GRUPO', conector: 'AND' });
    expect(nodos).toHaveLength(5);
    expect(nodos).toContainEqual({
      tipo: 'PREDICADO',
      campo: 'artefacto',
      operador: 'ES',
      valor: ARTEFACTO,
    });
    expect(nodos[4]).toMatchObject({ tipo: 'GRUPO', conector: 'OR' });
  });

  it('leerArtefacto acepta un UUID y descarta lo demás', () => {
    // Assert
    expect(leerArtefacto(ARTEFACTO)).toBe(ARTEFACTO);
    expect(leerArtefacto('no-es-uuid')).toBe('');
    expect(leerArtefacto('')).toBe('');
  });

  it('leerFecha descarta formatos inválidos y fechas imposibles', () => {
    // Assert
    expect(leerFecha('2026-10-27')).toBe('2026-10-27');
    expect(leerFecha('27/10/2026')).toBe('');
    expect(leerFecha('2026-02-30')).toBe('');
    expect(leerFecha('')).toBe('');
  });
});
