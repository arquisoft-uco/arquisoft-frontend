import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { renderHook, waitFor, act } from '../../../test-utils/render';
import { repositorioArtefactosService } from '../services/repositorioArtefactosService';
import { VERSION_EN_USO, VERSION_NO_ENCONTRADA } from '../utils/errores-eliminar-version';
import { useEliminarVersionRepositorio } from './useEliminarVersionRepositorio';

vi.mock('../services/repositorioArtefactosService', () => ({
  repositorioArtefactosService: { eliminarVersion: vi.fn() },
}));

const eliminar = vi.mocked(repositorioArtefactosService.eliminarVersion);

const KEY = ['repositorio-artefactos', 'r-1', 'versiones'];
const base = {
  nombreDocumento: 'Manual',
  fechaCreacion: '2026-03-15T14:30:00Z',
  tipoContenido: 'application/pdf',
  tamanoBytes: 1,
  nombreArchivo: 'a.pdf',
};
const VERSIONES = [
  { ...base, id: 'v-2', numeroVersion: 2 },
  { ...base, id: 'v-1', numeroVersion: 1 },
];

function errorApi(errorCode: string) {
  return new AxiosError('fallo', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message: 'm', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('useEliminarVersionRepositorio', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  async function ejecutar() {
    const { result } = renderHook(() => useEliminarVersionRepositorio('r-1'), { wrapper });
    await act(async () => {
      result.current.mutate('v-2');
    });
    return result;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    queryClient.setQueryData(KEY, VERSIONES);
  });

  it('al eliminar quita la fila de la caché sin invalidar la query', async () => {
    // Arrange
    eliminar.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');

    // Act
    const result = await ejecutar();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(eliminar.mock.calls[0][0]).toBe('v-2');
    expect(queryClient.getQueryData(KEY)).toEqual([VERSIONES[1]]);
    expect(invalidar).not.toHaveBeenCalled();
  });

  it('si la versión ya no existe también quita la fila', async () => {
    // Arrange
    eliminar.mockRejectedValue(errorApi(VERSION_NO_ENCONTRADA));

    // Act
    const result = await ejecutar();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(KEY)).toEqual([VERSIONES[1]]);
  });

  it('si está en uso deja la caché intacta', async () => {
    // Arrange
    eliminar.mockRejectedValue(errorApi(VERSION_EN_USO));

    // Act
    const result = await ejecutar();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(KEY)).toEqual(VERSIONES);
  });
});
