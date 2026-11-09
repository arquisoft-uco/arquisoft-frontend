import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useArtefactosSinAvanceAsesor } from './useArtefactosSinAvanceAsesor';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { consultarArtefactosSinAvanceAsesor: vi.fn() },
}));

const consultar = vi.mocked(artefactosService.consultarArtefactosSinAvanceAsesor);

const PAGINA_VACIA = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 10,
  first: true,
  last: true,
  empty: true,
};

function crearWrapper(queryClient: QueryClient, ruta = '/artefactos?vista=sin-avance') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[ruta]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useArtefactosSinAvanceAsesor', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(PAGINA_VACIA);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('la primera consulta usa 15 días, orden por antigüedad y la key de la feature', async () => {
    // Act
    const { result } = renderHook(() => useArtefactosSinAvanceAsesor(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      diasSinAvance: 15,
      criterio: {
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['fechaUltimaVersion:ASC'],
        filtros: undefined,
      },
    });
    expect(
      queryClient
        .getQueryCache()
        .getAll()
        .map((q) => q.queryKey)
        .find((k) => k[1] === 'asesor'),
    ).toEqual(['artefactos', 'asesor', 'sin-avance', 0, 15, '', '', 'fechaUltimaVersion:ASC']);
  });

  it('un plazo inválido en la URL no dispara consulta y expone errorDias', async () => {
    // Act
    const { result } = renderHook(() => useArtefactosSinAvanceAsesor(), {
      wrapper: crearWrapper(queryClient, '/artefactos?vista=sin-avance&dias=0'),
    });

    // Assert
    expect(result.current.dias).toBeNull();
    expect(result.current.errorDias).toBeTruthy();
    expect(consultar).not.toHaveBeenCalled();
  });

  it('un plazo válido reenvía la consulta con el nuevo valor', async () => {
    // Arrange
    const { result } = renderHook(() => useArtefactosSinAvanceAsesor(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.setDias('30'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ diasSinAvance: 30 })),
    );
    expect(result.current.dias).toBe(30);
  });
});
