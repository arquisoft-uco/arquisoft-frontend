import { describe, it, expect, vi } from 'vitest';
import type { EstadoRevisionAsesor } from '../models/artefactos';
import {
  aplicadoEstadoRevision,
  nodoEstadoUltimaRevision,
  opcionesEstadoRevision,
  resolverEstadoRevision,
  seccionEstadoRevision,
  SIN_REVISION,
} from './filtro-estado-revision';

const ESTADOS: EstadoRevisionAsesor[] = [
  { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: 'Nueva revisión' },
  { id: 'CERRADA', nombre: 'Cerrada', descripcion: 'Revisión cerrada' },
];

describe('filtro del estado de la última revisión', () => {
  it('nodoEstadoUltimaRevision: vacío sin nodo, sentinela ES_NULO sin valor y nombre ES', () => {
    // Assert
    expect(nodoEstadoUltimaRevision('')).toEqual([]);
    expect(nodoEstadoUltimaRevision(SIN_REVISION)).toEqual([
      { tipo: 'PREDICADO', campo: 'estadoUltimaRevision', operador: 'ES_NULO' },
    ]);
    expect(nodoEstadoUltimaRevision('Cerrada')).toEqual([
      { tipo: 'PREDICADO', campo: 'estadoUltimaRevision', operador: 'ES', valor: 'Cerrada' },
    ]);
  });

  it('opcionesEstadoRevision ofrece «Sin revisión» solo cuando se pide', () => {
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
  });

  it('resolverEstadoRevision acepta id o nombre sin distinguir mayúsculas y sin catálogo no resuelve', () => {
    // Assert
    expect(resolverEstadoRevision(ESTADOS, 'CERRADA')?.nombre).toBe('Cerrada');
    expect(resolverEstadoRevision(ESTADOS, ' pendiente ')?.id).toBe('PENDIENTE');
    expect(resolverEstadoRevision(ESTADOS, 'otro')).toBeUndefined();
    expect(resolverEstadoRevision(undefined, 'CERRADA')).toBeUndefined();
  });

  it('seccionEstadoRevision se deshabilita sin catálogo y aplicadoEstadoRevision arma el chip', () => {
    // Arrange
    const onQuitar = vi.fn();

    // Assert
    expect(
      seccionEstadoRevision({ estados: undefined, valor: '', onCambiar: vi.fn() }),
    ).toMatchObject({
      deshabilitada: true,
    });
    expect(
      seccionEstadoRevision({ estados: ESTADOS, valor: '', onCambiar: vi.fn() }),
    ).toMatchObject({
      deshabilitada: false,
    });
    expect(aplicadoEstadoRevision({ estados: ESTADOS, valor: '', onQuitar })).toBeNull();
    expect(aplicadoEstadoRevision({ estados: ESTADOS, valor: SIN_REVISION, onQuitar })).toEqual({
      id: 'estadoRevision',
      etiqueta: 'Sin revisión',
      onQuitar,
    });
    expect(aplicadoEstadoRevision({ estados: ESTADOS, valor: 'CERRADA', onQuitar })?.etiqueta).toBe(
      'Última revisión: Cerrada',
    );
    expect(
      aplicadoEstadoRevision({ estados: undefined, valor: 'CERRADA', onQuitar })?.etiqueta,
    ).toBe('Última revisión: CERRADA');
  });
});
