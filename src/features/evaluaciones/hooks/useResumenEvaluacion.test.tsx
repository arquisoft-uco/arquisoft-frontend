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
import { useResumenEvaluacion } from './useResumenEvaluacion';

function montar(state: unknown) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[{ pathname: '/evaluaciones/e-1/jurados', state }]}>
        {children}
      </MemoryRouter>
    );
  }
  return renderHook(() => useResumenEvaluacion('e-1'), { wrapper: Wrapper }).result.current;
}

describe('useResumenEvaluacion', () => {
  beforeEach(() => {
    resetAllStores();
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('devuelve el resumen y el search cuando el state es válido y coincide con la ruta', () => {
    // Act
    const resultado = montar({
      resumen: { id: 'e-1', proyecto: 'Sistema de monitoreo', version: 3 },
      search: '?q=sis&pagina=2',
    });

    // Assert
    expect(resultado).toEqual({
      resumen: { id: 'e-1', proyecto: 'Sistema de monitoreo', version: 3 },
      search: '?q=sis&pagina=2',
    });
  });

  it('devuelve null y cadena vacía sin state ni snapshot, con state de otra evaluación o malformado', () => {
    // Arrange
    const vacio = { resumen: null, search: '' };

    // Act & Assert
    expect(montar(undefined)).toEqual(vacio);
    expect(montar({ resumen: { id: 'otra', proyecto: 'X', version: 1 }, search: '' })).toEqual(
      vacio,
    );
    expect(montar({ resumen: { id: 'e-1', proyecto: 'X', version: '1' }, search: '' })).toEqual(
      vacio,
    );
    expect(montar({ resumen: { id: 'e-1', proyecto: 'X', version: 1 }, search: 5 })).toEqual(vacio);
  });

  it('sin state recupera el snapshot vigente y lo descarta pasados cinco minutos', () => {
    // Arrange
    usarTemporizadoresFalsos();
    vi.setSystemTime(new Date('2026-11-23T10:00:00Z'));
    const state = { resumen: { id: 'e-1', proyecto: 'Sistema', version: 3 }, search: '?q=sis' };
    montar(state);

    // Act
    vi.setSystemTime(Date.now() + TTL_CONTEXTO_CORTO_MS - 1000);
    const vigente = montar(undefined);
    vi.setSystemTime(Date.now() + 2000);
    const vencido = montar(undefined);

    // Assert
    expect(vigente).toEqual(state);
    expect(vencido).toEqual({ resumen: null, search: '' });
  });

  it('conserva finalizada cuando es booleano y la omite cuando no lo es', () => {
    // Act
    const finalizada = montar({
      resumen: { id: 'e-1', proyecto: 'X', version: 1, finalizada: true },
      search: '',
    });
    const invalida = montar({
      resumen: { id: 'e-1', proyecto: 'X', version: 1, finalizada: 'si' },
      search: '',
    });

    // Assert
    expect(finalizada.resumen).toEqual({ id: 'e-1', proyecto: 'X', version: 1, finalizada: true });
    expect(invalida.resumen).toEqual({ id: 'e-1', proyecto: 'X', version: 1 });
  });
});
