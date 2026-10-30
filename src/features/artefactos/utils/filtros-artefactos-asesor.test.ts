import { describe, it, expect } from 'vitest';
import { CAMPOS_BUSQUEDA, construirFiltros, ordenamientoDe } from './filtros-artefactos-asesor';

describe('filtros de artefactos asignados del asesor', () => {
  it('sin texto devuelve undefined', () => {
    // Assert
    expect(construirFiltros('')).toBeUndefined();
    expect(construirFiltros('   ')).toBeUndefined();
  });

  it('el texto arma un GRUPO OR de CONTIENE sin nombreAsesor', () => {
    // Act
    const filtros = construirFiltros(' acta ');

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

  it('el orden por defecto agrega el documento y los demás van tal cual', () => {
    // Assert
    expect(ordenamientoDe('nombreProyecto:ASC')).toEqual([
      'nombreProyecto:ASC',
      'nombreDocumento:ASC',
    ]);
    expect(ordenamientoDe('nombreRepositorio:DESC')).toEqual(['nombreRepositorio:DESC']);
  });
});
