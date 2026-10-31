import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useOpcionesEstadoRevision } from './useOpcionesEstadoRevision';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { getEstadosRevisionAsesor: vi.fn() },
}));

const getEstados = vi.mocked(artefactosService.getEstadosRevisionAsesor);

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useOpcionesEstadoRevision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con el catálogo devuelve «Sin revisión» primero y los estados con su nombre', async () => {
    // Arrange
    getEstados.mockResolvedValue([
      { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: 'Nueva' },
      { id: 'CERRADA', nombre: 'Cerrada', descripcion: 'Cerrada' },
    ]);

    // Act
    const { result } = renderHook(() => useOpcionesEstadoRevision(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current).toBeDefined());
    expect(result.current).toEqual([
      { id: 'SIN_REVISION', etiqueta: 'Sin revisión' },
      { id: 'PENDIENTE', etiqueta: 'Pendiente' },
      { id: 'CERRADA', etiqueta: 'Cerrada' },
    ]);
  });

  it('si el catálogo falla devuelve undefined', async () => {
    // Arrange
    getEstados.mockRejectedValue(new Error('403'));

    // Act
    const { result } = renderHook(() => useOpcionesEstadoRevision(), { wrapper: crearWrapper() });
    await waitFor(() => expect(getEstados).toHaveBeenCalled());

    // Assert
    expect(result.current).toBeUndefined();
  });
});
