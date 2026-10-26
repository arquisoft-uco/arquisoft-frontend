import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { repositorioArtefactosService } from '../services/repositorioArtefactosService';
import { useVersionesRepositorioArtefacto } from './useVersionesRepositorioArtefacto';

vi.mock('../services/repositorioArtefactosService', () => ({
  repositorioArtefactosService: {
    consultarVersionesRepositorio: vi.fn(),
  },
}));

const consultar = vi.mocked(repositorioArtefactosService.consultarVersionesRepositorio);

const VERSION = {
  id: 'v-1',
  nombreDocumento: 'Manual',
  numeroVersion: 2,
  fechaCreacion: '2026-03-15T14:30:00Z',
  tipoContenido: 'application/pdf',
  tamanoBytes: 2048,
  nombreArchivo: 'manual.pdf',
};

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useVersionesRepositorioArtefacto', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue([VERSION]);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('consulta las versiones del repositorio bajo la key de la feature y expone los datos', async () => {
    // Act
    const { result } = renderHook(() => useVersionesRepositorioArtefacto('r-1'), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith('r-1');
    expect(result.current.data).toEqual([VERSION]);
    expect(queryClient.getQueryCache().getAll()[0].queryKey).toEqual([
      'repositorio-artefactos',
      'r-1',
      'versiones',
    ]);
  });

  it('sin id no consulta el service', () => {
    // Act
    renderHook(() => useVersionesRepositorioArtefacto(''), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });

  it('expone el error cuando la consulta falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('falla'));

    // Act
    const { result } = renderHook(() => useVersionesRepositorioArtefacto('r-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
