import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { renderHook } from '../../../test-utils/render';
import { resetAllStores } from '../../../test-utils/store.utils';
import {
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../test-utils/temporizadores';
import { TTL_CONTEXTO_MS } from '../../../shared/utils/contexto-temporal';
import { useNavegacionEvaluacionJurado } from './useNavegacionEvaluacionJurado';

function montar(state: unknown) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[{ pathname: '/evaluaciones/ej-1/cualitativas', state }]}>
        {children}
      </MemoryRouter>
    );
  }
  return renderHook(() => useNavegacionEvaluacionJurado('ej-1'), { wrapper: Wrapper }).result
    .current;
}

const VALIDO = {
  evaluacionJuradoId: 'ej-1',
  evaluacionId: 'e-1',
  jurado: 'Ana Pérez',
  resumen: { id: 'e-1', proyecto: 'Sistema de monitoreo', version: 3 },
  search: '?q=sis',
  searchJurados: '?pagina=2',
};

describe('useNavegacionEvaluacionJurado', () => {
  beforeEach(() => {
    resetAllStores();
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('devuelve la navegación cuando el state es válido y coincide con la ruta', () => {
    // Act & Assert
    expect(montar(VALIDO)).toEqual(VALIDO);
  });

  it('devuelve null sin state ni snapshot, con state de otro jurado, sin resumen o malformado', () => {
    // Act & Assert
    expect(montar(undefined)).toBeNull();
    expect(montar({ ...VALIDO, evaluacionJuradoId: 'otro' })).toBeNull();
    expect(montar({ ...VALIDO, resumen: null })).toBeNull();
    expect(montar({ ...VALIDO, jurado: 5 })).toBeNull();
    expect(montar({ ...VALIDO, searchJurados: undefined })).toBeNull();
    expect(montar({ ...VALIDO, resumen: { id: 'e-1', proyecto: 'X', version: '1' } })).toBeNull();
  });

  it('sin state recupera el snapshot vigente y lo descarta cuando vence', () => {
    // Arrange
    usarTemporizadoresFalsos();
    vi.setSystemTime(new Date('2026-11-23T10:00:00Z'));
    montar(VALIDO);

    // Act
    vi.setSystemTime(Date.now() + TTL_CONTEXTO_MS - 1000);
    const vigente = montar(undefined);
    vi.setSystemTime(Date.now() + 2000);
    const vencido = montar(undefined);

    // Assert
    expect(vigente).toEqual(VALIDO);
    expect(vencido).toBeNull();
  });
});
