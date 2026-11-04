import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import { repositorioArtefactosService } from '../services/repositorioArtefactosService';
import { useModificarRepositorioArtefacto } from './useModificarRepositorioArtefacto';

vi.mock('../services/repositorioArtefactosService', () => ({
  repositorioArtefactosService: { modificarRepositorio: vi.fn() },
}));

const modificar = vi.mocked(repositorioArtefactosService.modificarRepositorio);
const VARIABLES = {
  repositorioId: 'r-1',
  req: { nombreRepositorio: 'Repositorio Alfa', descripcion: 'Artefactos' },
};
const LISTADO = { queryKey: ['repositorio-artefactos', 'administrador'] };

function errorApi(errorCode: string) {
  return new AxiosError('fallo', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message: 'm', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('useModificarRepositorioArtefacto', () => {
  let queryClient: QueryClient;

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('envía id y cuerpo al service e invalida el listado al terminar', async () => {
    // Arrange
    modificar.mockResolvedValue(undefined);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useModificarRepositorioArtefacto(), { wrapper });

    // Act
    result.current.mutate(VARIABLES);

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modificar).toHaveBeenCalledWith('r-1', VARIABLES.req);
    expect(invalidar).toHaveBeenCalledWith(LISTADO);
  });

  it('invalida el listado si el repositorio ya no existe', async () => {
    // Arrange
    modificar.mockRejectedValue(errorApi('REPOSITORIO_ARTEFACTO_NO_ENCONTRADO'));
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useModificarRepositorioArtefacto(), { wrapper });

    // Act
    result.current.mutate(VARIABLES);

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith(LISTADO);
  });

  it('no invalida el listado ante cualquier otro error', async () => {
    // Arrange
    modificar.mockRejectedValue(errorApi('REPOSITORIO_ARTEFACTO_DUPLICADO'));
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useModificarRepositorioArtefacto(), { wrapper });

    // Act
    result.current.mutate(VARIABLES);

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
