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
  estadoProyecto: '',
};

const HABILITADOS = [
  { tipo: 'PREDICADO', campo: 'proyectoFinalizado', operador: 'ES', valor: 'false' },
  { tipo: 'PREDICADO', campo: 'proyectoCancelado', operador: 'ES', valor: 'false' },
];

function nodosDe(filtros: FiltrosArtefactosAsesor) {
  return (construirFiltros(filtros) as { nodos: unknown[] }).nodos;
}

describe('filtros de artefactos asignados del asesor', () => {
  it('sin otros filtros envía solo los dos predicados de proyectos habilitados', () => {
    // Assert
    const esperado = { tipo: 'GRUPO', conector: 'AND', nodos: HABILITADOS };
    expect(construirFiltros(vacios)).toEqual(esperado);
    expect(construirFiltros({ ...vacios, texto: '   ' })).toEqual(esperado);
  });

  it('finalizados y cancelados reemplazan los dos false por un solo true', () => {
    // Assert
    expect(construirFiltros({ ...vacios, estadoProyecto: 'finalizados' })).toEqual({
      tipo: 'PREDICADO',
      campo: 'proyectoFinalizado',
      operador: 'ES',
      valor: 'true',
    });
    expect(nodosDe({ ...vacios, proyecto: 'riego', estadoProyecto: 'cancelados' })).toEqual([
      { tipo: 'PREDICADO', campo: 'nombreProyecto', operador: 'CONTIENE', valor: 'riego' },
      { tipo: 'PREDICADO', campo: 'proyectoCancelado', operador: 'ES', valor: 'true' },
    ]);
  });

  it('el texto arma un GRUPO OR de CONTIENE sin nombreAsesor', () => {
    // Act
    const filtros = nodosDe({ ...vacios, texto: ' acta ' })[0];

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
    expect(nodosDe({ ...vacios, proyecto: ' riego ' })[0]).toEqual({
      tipo: 'PREDICADO',
      campo: 'nombreProyecto',
      operador: 'CONTIENE',
      valor: 'riego',
    });
    expect(nodosDe({ ...vacios, version: '3' })[0]).toMatchObject({
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
      estadoProyecto: '',
    });
    expect(combinado).toMatchObject({ tipo: 'GRUPO', conector: 'AND' });
    expect((combinado as { nodos: unknown[] }).nodos).toHaveLength(7);
    expect(JSON.stringify(combinado)).not.toContain('nombreAsesor');
  });

  it('una versión inválida se ignora', () => {
    // Assert
    ['0', 'abc', '-1'].forEach((version) => {
      expect(nodosDe({ ...vacios, version })).toEqual(HABILITADOS);
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
