import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../test-utils/render';
import { administradoresVigentesService } from '../services/administradoresVigentesService';
import { useAdministradoresVigentes } from './useAdministradoresVigentes';

vi.mock('../services/administradoresVigentesService', () => ({
  administradoresVigentesService: { consultarAdministradoresVigentes: vi.fn() },
}));

const consultar = vi.mocked(administradoresVigentesService.consultarAdministradoresVigentes);

const PAGINA = {
  content: [
    {
      id: 'adm-1',
      identificador: '1',
      nombre: 'Ana',
      email: 'ana@uco.edu.co',
      contacto: '3000000000',
      estado: 'ACTIVO',
    },
  ],
  page: 0,
  size: 100,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
  empty: false,
};

function crearContexto() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient };
}

describe('useAdministradoresVigentes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pide una página grande ordenada por nombre y la cachea bajo su propia key', async () => {
    // Arrange
    consultar.mockResolvedValue(PAGINA);
    const { Wrapper, queryClient } = crearContexto();

    // Act
    const { result } = renderHook(() => useAdministradoresVigentes(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 100,
      ordenamiento: ['nombre:ASC'],
    });
    expect(result.current.data).toEqual(PAGINA);
    expect(queryClient.getQueryData(['usuarios', 'administradores-vigentes'])).toEqual(PAGINA);
  });

  it('expone el error cuando el service falla', async () => {
    consultar.mockRejectedValue(new Error('falló'));
    const { Wrapper } = crearContexto();

    const { result } = renderHook(() => useAdministradoresVigentes(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
