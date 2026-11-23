import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { renderHook } from '../../../test-utils/render';
import { resetAllStores } from '../../../test-utils/store.utils';
import {
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../test-utils/temporizadores';
import { TTL_CONTEXTO_CORTO_MS } from '../../../shared/utils/contexto-temporal';
import { useResumenProyectoGrado } from './useResumenProyectoGrado';

function leer(state: unknown, proyectoId = 'p-1', ttlMs?: number) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[{ pathname: '/proyectos-grado/p-1/asesores', state }]}>
      {children}
    </MemoryRouter>
  );
  return renderHook(() => useResumenProyectoGrado(proyectoId, ttlMs), { wrapper }).result.current;
}

const ESTADO_VALIDO = {
  search: '?q=monitoreo',
  resumen: { id: 'p-1', titulo: 'Sistema', estadoId: 'EN_PROCESO', estadoNombre: 'En proceso' },
};

describe('useResumenProyectoGrado', () => {
  beforeEach(() => {
    resetAllStores();
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('lee el resumen y la search del state cuando corresponden al proyecto', () => {
    // Act
    const resultado = leer({
      search: '?q=monitoreo',
      resumen: { id: 'p-1', titulo: 'Sistema', estadoId: 'EN_PROCESO', estadoNombre: 'En proceso' },
    });

    // Assert
    expect(resultado).toEqual({
      search: '?q=monitoreo',
      resumen: { id: 'p-1', titulo: 'Sistema', estadoId: 'EN_PROCESO', estadoNombre: 'En proceso' },
    });
  });

  it('devuelve resumen nulo y search vacía sin state ni snapshot, con state de otro proyecto o sin search', () => {
    // Arrange
    const deOtroProyecto = { search: '?q=x', resumen: { id: 'p-2', titulo: 'Otro' } };
    const sinSearch = { resumen: { id: 'p-1', titulo: 'Sistema' } };

    // Act / Assert
    expect(leer(undefined)).toEqual({ resumen: null, search: '' });
    expect(leer(deOtroProyecto)).toEqual({ resumen: null, search: '' });
    expect(leer(sinSearch)).toEqual({ resumen: null, search: '' });
  });

  it('sin state recupera el snapshot vigente y lo descarta cuando supera la vigencia corta', () => {
    // Arrange
    usarTemporizadoresFalsos();
    vi.setSystemTime(new Date('2026-11-23T10:00:00Z'));
    leer(ESTADO_VALIDO);
    vi.setSystemTime(Date.now() + TTL_CONTEXTO_CORTO_MS + 1000);

    // Act
    const porDefecto = leer(undefined);
    const corto = leer(undefined, 'p-1', TTL_CONTEXTO_CORTO_MS);

    // Assert
    expect(porDefecto).toEqual(ESTADO_VALIDO);
    expect(corto).toEqual({ resumen: null, search: '' });
  });

  it('ignora el estado que no es string', () => {
    // Act
    const resultado = leer({
      search: '',
      resumen: { id: 'p-1', titulo: 'Sistema', estadoId: 5, estadoNombre: null },
    });

    // Assert
    expect(resultado.resumen).toEqual({ id: 'p-1', titulo: 'Sistema' });
  });
});
