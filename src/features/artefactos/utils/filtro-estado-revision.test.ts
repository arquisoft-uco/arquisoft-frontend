import { describe, it, expect } from 'vitest';
import type { EstadoRevisionAsesor } from '../models/artefactos';
import {
  nodoEstadoUltimaRevision,
  nodoEstadosUltimaRevision,
  opcionesChipsEstadoRevision,
  opcionesEstadoRevision,
  resolverEstadoRevision,
  resolverEstadosRevision,
  SIN_REVISION,
} from './filtro-estado-revision';

const ESTADOS: EstadoRevisionAsesor[] = [
  { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: 'Nueva revisión' },
  { id: 'CERRADA', nombre: 'Cerrada', descripcion: 'Revisión cerrada' },
];

const ES_NULO = { tipo: 'PREDICADO', campo: 'estadoUltimaRevision', operador: 'ES_NULO' };

describe('filtro del estado de la última revisión', () => {
  it('nodoEstadoUltimaRevision: vacío sin nodo, sentinela ES_NULO sin valor y nombre ES', () => {
    // Assert
    expect(nodoEstadoUltimaRevision('')).toEqual([]);
    expect(nodoEstadoUltimaRevision(SIN_REVISION)).toEqual([ES_NULO]);
    expect(nodoEstadoUltimaRevision('Cerrada')).toEqual([
      { tipo: 'PREDICADO', campo: 'estadoUltimaRevision', operador: 'ES', valor: 'Cerrada' },
    ]);
  });

  it('nodoEstadosUltimaRevision usa IN con varios nombres y un OR con «Sin revisión»', () => {
    // Arrange
    const enNombres = {
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoUltimaRevision',
      operador: 'IN',
      valores: ['Pendiente', 'Cerrada'],
    };

    // Assert
    expect(nodoEstadosUltimaRevision([])).toEqual([]);
    expect(nodoEstadosUltimaRevision(['Pendiente', 'Cerrada'])).toEqual([enNombres]);
    expect(nodoEstadosUltimaRevision([SIN_REVISION, 'Pendiente', 'Cerrada'])).toEqual([
      { tipo: 'GRUPO', conector: 'OR', nodos: [ES_NULO, enNombres] },
    ]);
  });

  it('opcionesEstadoRevision ofrece «Sin revisión» solo cuando se pide y los chips omiten «Todos»', () => {
    // Assert
    expect(opcionesEstadoRevision(ESTADOS, true).map((o) => o.id)).toEqual([
      '',
      SIN_REVISION,
      'PENDIENTE',
      'CERRADA',
    ]);
    expect(opcionesEstadoRevision(ESTADOS, false).map((o) => o.etiqueta)).toEqual([
      'Todos',
      'Pendiente',
      'Cerrada',
    ]);
    expect(opcionesEstadoRevision(undefined, false)).toEqual([{ id: '', etiqueta: 'Todos' }]);
    expect(opcionesChipsEstadoRevision(ESTADOS).map((o) => o.etiqueta)).toEqual([
      'Sin revisión',
      'Pendiente',
      'Cerrada',
    ]);
  });

  it('resolverEstadoRevision acepta id o nombre sin distinguir mayúsculas y sin catálogo no resuelve', () => {
    // Assert
    expect(resolverEstadoRevision(ESTADOS, 'CERRADA')?.nombre).toBe('Cerrada');
    expect(resolverEstadoRevision(ESTADOS, ' pendiente ')?.id).toBe('PENDIENTE');
    expect(resolverEstadoRevision(ESTADOS, 'otro')).toBeUndefined();
    expect(resolverEstadoRevision(undefined, 'CERRADA')).toBeUndefined();
  });

  it('resolverEstadosRevision descarta desconocidos y repetidos y conserva «Sin revisión»', () => {
    // Assert
    expect(resolverEstadosRevision(ESTADOS, ['CERRADA', 'otro', 'cerrada', SIN_REVISION])).toEqual({
      ids: ['CERRADA', SIN_REVISION],
      consultas: ['Cerrada', SIN_REVISION],
    });
    expect(resolverEstadosRevision(undefined, ['CERRADA', SIN_REVISION])).toEqual({
      ids: [SIN_REVISION],
      consultas: [SIN_REVISION],
    });
  });
});
