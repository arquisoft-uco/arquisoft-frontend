import { describe, it, expect } from 'vitest';
import {
  CAMPOS_BUSQUEDA,
  construirFiltros,
  ordenamientoDe,
  type FiltrosArtefactosAsesor,
} from './filtros-artefactos-asesor';

const vacios: FiltrosArtefactosAsesor = {
  texto: '',
  proyecto: '',
  documento: '',
  repositorio: '',
  version: '',
};

describe('filtros de artefactos asignados del asesor', () => {
  it('sin texto devuelve undefined', () => {
    // Assert
    expect(construirFiltros(vacios)).toBeUndefined();
    expect(construirFiltros({ ...vacios, texto: '   ' })).toBeUndefined();
  });

  it('el texto arma un GRUPO OR de CONTIENE sin nombreAsesor', () => {
    // Act
    const filtros = construirFiltros({ ...vacios, texto: ' acta ' });

    // Assert
    expect(CAMPOS_BUSQUEDA).not.toContain('nombreAsesor');
    expect(filtros).toEqual({
      tipo: 'GRUPO',
      conector: 'OR',
      nodos: ['nombreDocumento', 'nombreProyecto', 'nombreRepositorio'].map((campo) => ({
        tipo: 'PREDICADO',
        campo,
        operador: 'CONTIENE',
        valor: 'acta',
      })),
    });
  });

  it('cada filtro por campo es un predicado suelto y varios se combinan con AND', () => {
    // Assert
    expect(construirFiltros({ ...vacios, proyecto: ' riego ' })).toEqual({
      tipo: 'PREDICADO',
      campo: 'nombreProyecto',
      operador: 'CONTIENE',
      valor: 'riego',
    });
    expect(construirFiltros({ ...vacios, version: '3' })).toMatchObject({
      tipo: 'PREDICADO',
      campo: 'versionDocumento',
      operador: 'ES',
    });
    const combinado = construirFiltros({
      texto: 'acta',
      proyecto: 'riego',
      documento: 'plan',
      repositorio: 'base',
      version: '2',
    });
    expect(combinado).toMatchObject({ tipo: 'GRUPO', conector: 'AND' });
    expect((combinado as { nodos: unknown[] }).nodos).toHaveLength(5);
    expect(JSON.stringify(combinado)).not.toContain('nombreAsesor');
  });

  it('una versión inválida se ignora', () => {
    // Assert
    ['0', 'abc', '-1'].forEach((version) => {
      expect(construirFiltros({ ...vacios, version })).toBeUndefined();
    });
  });

  it('el orden por defecto agrega el documento y los demás van tal cual', () => {
    // Assert
    expect(ordenamientoDe('nombreProyecto:ASC')).toEqual([
      'nombreProyecto:ASC',
      'nombreDocumento:ASC',
    ]);
    expect(ordenamientoDe('nombreRepositorio:DESC')).toEqual(['nombreRepositorio:DESC']);
  });
});
