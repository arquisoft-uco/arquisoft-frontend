import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { evaluacionesService } from '../services/evaluacionesService';
import { useJuradosVigentes } from './useJuradosVigentes';

vi.mock('../services/evaluacionesService', () => ({
  TAMANIO_PAGINA_JURADOS: 10,
  evaluacionesService: { getJuradosVigentes: vi.fn() },
}));

const getJurados = vi.mocked(evaluacionesService.getJuradosVigentes);

const PAGINA = {
  content: [{ id: 'j-1', nombre: 'Ana', email: 'ana@uco.edu.co' }],
  page: 1,
  size: 10,
  totalElements: 11,
  totalPages: 2,
  first: false,
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

describe('useJuradosVigentes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pide la página y el texto indicados y los incluye en la query key', async () => {
    // Arrange
    getJurados.mockResolvedValue(PAGINA);
    const { Wrapper, queryClient } = crearContexto();

    // Act
    const { result } = renderHook(() => useJuradosVigentes(1, '  ana '), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getJurados).toHaveBeenCalledWith({ pagina: 1, texto: '  ana ' });
    expect(result.current.pageSize).toBe(10);
    expect(queryClient.getQueryData(['evaluaciones', 'jurados-vigentes', 'ana', 1])).toEqual(
      PAGINA,
    );
  });

  it('expone el error cuando la consulta falla', async () => {
    // Arrange
    getJurados.mockRejectedValue(new Error('500'));
    const { Wrapper } = crearContexto();

    // Act
    const { result } = renderHook(() => useJuradosVigentes(0, ''), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
