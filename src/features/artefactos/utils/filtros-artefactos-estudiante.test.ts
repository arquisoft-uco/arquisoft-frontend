import { describe, it, expect } from 'vitest';
import {
  construirFiltros,
  leerVersion,
  ordenamientoDe,
  type FiltrosArtefactosEstudiante,
} from './filtros-artefactos-estudiante';

const SIN_FILTROS: FiltrosArtefactosEstudiante = {
  texto: '',
  proyecto: '',
  documento: '',
  repositorio: '',
  asesor: '',
  version: '',
};

describe('filtros de artefactos del estudiante', () => {
  it('sin filtros devuelve undefined', () => {
    // Assert
    expect(construirFiltros(SIN_FILTROS)).toBeUndefined();
  });

  it('solo texto arma un GRUPO OR con CONTIENE sobre los cuatro campos', () => {
    // Act
    const filtros = construirFiltros({ ...SIN_FILTROS, texto: ' acta ' });

    // Assert
    expect(filtros).toEqual({
      tipo: 'GRUPO',
      conector: 'OR',
      nodos: ['nombreDocumento', 'nombreProyecto', 'nombreRepositorio', 'nombreAsesor'].map(
        (campo) => ({ tipo: 'PREDICADO', campo, operador: 'CONTIENE', valor: 'acta' }),
      ),
    });
  });

  it('un único filtro de campo devuelve el predicado suelto', () => {
    // Act
    const filtros = construirFiltros({ ...SIN_FILTROS, proyecto: 'riego' });

    // Assert
    expect(filtros).toEqual({
      tipo: 'PREDICADO',
      campo: 'nombreProyecto',
      operador: 'CONTIENE',
      valor: 'riego',
    });
  });

  it('varios filtros arman un GRUPO AND con la búsqueda general y ES de la versión', () => {
    // Act
    const filtros = construirFiltros({
      ...SIN_FILTROS,
      texto: 'acta',
      asesor: 'Ana',
      version: '2',
    });

    // Assert
    expect(filtros).toMatchObject({ tipo: 'GRUPO', conector: 'AND' });
    expect(filtros && 'nodos' in filtros ? filtros.nodos : []).toEqual([
      expect.objectContaining({ tipo: 'GRUPO', conector: 'OR' }),
      { tipo: 'PREDICADO', campo: 'nombreAsesor', operador: 'CONTIENE', valor: 'Ana' },
      { tipo: 'PREDICADO', campo: 'versionDocumento', operador: 'ES', valor: '2' },
    ]);
  });

  it('leerVersion descarta lo que no es un entero positivo', () => {
    // Assert
    expect(leerVersion(' 3 ')).toBe('3');
    expect(leerVersion('0')).toBe('');
    expect(leerVersion('1.5')).toBe('');
    expect(leerVersion('-2')).toBe('');
    expect(leerVersion('abc')).toBe('');
    expect(leerVersion('')).toBe('');
  });

  it('ordenamientoDe agrega el documento al orden por defecto y deja el resto tal cual', () => {
    // Assert
    expect(ordenamientoDe('nombreProyecto:ASC')).toEqual([
      'nombreProyecto:ASC',
      'nombreDocumento:ASC',
    ]);
    expect(ordenamientoDe('versionDocumento:DESC')).toEqual(['versionDocumento:DESC']);
  });
});
