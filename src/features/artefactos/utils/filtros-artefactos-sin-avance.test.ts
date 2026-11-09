import { describe, it, expect } from 'vitest';
import { construirFiltros } from './filtros-artefactos-sin-avance';

describe('filtros del reporte de artefactos sin avance', () => {
  it('arma undefined, OR de texto, predicado de estado y AND de ambos', () => {
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

    // Assert
    expect(construirFiltros({ texto: ' ', estado: '' })).toBeUndefined();
    expect(construirFiltros({ texto: ' acta ', estado: '' })).toEqual(texto);
    expect(construirFiltros({ texto: '', estado: 'Enviada' })).toEqual(estado);
    expect(construirFiltros({ texto: 'acta', estado: 'Enviada' })).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [texto, estado],
    });
  });
});
