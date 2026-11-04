import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { ArtefactoEntregable } from '../models/ArtefactoEntregable';
import { entregablesService } from '../services/entregablesService';
import { useArtefactosEntregable } from './useArtefactosEntregable';

vi.mock('../services/entregablesService', () => ({
  entregablesService: {
    consultarArtefactosEntregable: vi.fn(),
  },
}));

const consultar = vi.mocked(entregablesService.consultarArtefactosEntregable);

const ARTEFACTO: ArtefactoEntregable = {
  id: 'ar-1',
  entregableProyectoGrado: 'e1',
  versionArtefacto: 'v1',
  uriArchivo: 'docs/informe.pdf',
  artefacto: 'a-1',
  versionRepositorioArtefacto: 'vr-1',
  nombreDocumento: 'Informe final',
  repositorio: 'r-1',
  nombreRepositorio: 'Repositorio central',
};

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useArtefactosEntregable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta los artefactos del entregable indicado y expone la lista', async () => {
    // Arrange
    consultar.mockResolvedValue([ARTEFACTO]);

    // Act
    const { result } = renderHook(() => useArtefactosEntregable('e1'), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('e1');
    expect(result.current.data).toEqual([ARTEFACTO]);
  });

  it('consulta por separado cada entregable', async () => {
    // Arrange
    consultar.mockResolvedValue([]);
    const wrapper = crearWrapper();

    // Act
    const primero = renderHook(() => useArtefactosEntregable('e1'), { wrapper });
    const segundo = renderHook(() => useArtefactosEntregable('e2'), { wrapper });
    await waitFor(() => expect(primero.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(segundo.result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('e1');
    expect(consultar).toHaveBeenCalledWith('e2');
  });

  it('expone isError cuando el service rechaza', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useArtefactosEntregable('e1'), {
      wrapper: crearWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
