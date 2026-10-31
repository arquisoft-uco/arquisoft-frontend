import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { AxiosError, AxiosHeaders } from 'axios';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { useVersionArtefacto } from './useVersionArtefacto';

vi.mock('../services/artefactosService', () => ({
  artefactosService: {
    getVersionArtefacto: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.getVersionArtefacto);

const VERSION: VersionArtefacto = {
  id: 'v-1',
  artefacto: 'a-1',
  version: 4,
  fechaCreacion: '2026-03-10T15:30:00Z',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  nombreAsesor: 'Marta Gómez',
  revisionAsesor: null,
  estadoRevision: null,
  nombreEstadoRevision: null,
};

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useVersionArtefacto', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: 2, retryDelay: 0 } } });
  });

  it('con id nulo no consulta', () => {
    // Act
    renderHook(() => useVersionArtefacto(null), { wrapper: crearWrapper(queryClient) });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });

  it('con id consulta el detalle y lo guarda bajo la key de la feature', async () => {
    // Arrange
    consultar.mockResolvedValue(VERSION);

    // Act
    const { result } = renderHook(() => useVersionArtefacto('v-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(consultar).toHaveBeenCalledWith('v-1');
    expect(queryClient.getQueryData(['artefactos', 'versiones-artefacto', 'detalle', 'v-1'])).toBe(
      VERSION,
    );
  });

  it('un 422 no se reintenta', async () => {
    // Arrange
    consultar.mockRejectedValue(
      new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, {
        data: {},
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: {},
        config: { headers: new AxiosHeaders() },
      }),
    );

    // Act
    const { result } = renderHook(() => useVersionArtefacto('v-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(consultar).toHaveBeenCalledTimes(1);
  });
});
