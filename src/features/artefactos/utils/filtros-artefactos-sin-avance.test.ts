import { describe, it, expect } from 'vitest';
import { construirFiltros } from './filtros-artefactos-sin-avance';

describe('filtros del reporte de artefactos sin avance', () => {
  it('arma los predicados de habilitados, OR de texto, estado y AND de todos', () => {
    // Arrange
    const texto = {
      tipo: 'GRUPO',
      conector: 'OR',
      nodos: [
        { tipo: 'PREDICADO', campo: 'nombreProyecto', operador: 'CONTIENE', valor: 'acta' },
        { tipo: 'PREDICADO', campo: 'nombreDocumento', operador: 'CONTIENE', valor: 'acta' },
      ],
    };
    const estado = {
      tipo: 'PREDICADO',
      campo: 'estadoUltimaRevision',
      operador: 'ES',
      valor: 'Enviada',
    };

    const habilitados = [
      { tipo: 'PREDICADO', campo: 'proyectoFinalizado', operador: 'ES', valor: 'false' },
      { tipo: 'PREDICADO', campo: 'proyectoCancelado', operador: 'ES', valor: 'false' },
    ];
    const base = { texto: '', estado: '', estadoProyecto: '' as const };

    // Assert
    expect(construirFiltros({ ...base, texto: ' ' })).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: habilitados,
    });
    expect(construirFiltros({ ...base, texto: ' acta ' })).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [texto, ...habilitados],
    });
    expect(construirFiltros({ ...base, texto: 'acta', estado: 'Enviada' })).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [texto, estado, ...habilitados],
    });
    expect(construirFiltros({ ...base, estado: 'Enviada', estadoProyecto: 'cancelados' })).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [
        estado,
        { tipo: 'PREDICADO', campo: 'proyectoCancelado', operador: 'ES', valor: 'true' },
      ],
    });
  });
});
