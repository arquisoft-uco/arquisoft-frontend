import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useVersionesRepositorioAsesor } from './useVersionesRepositorioAsesor';

vi.mock('../services/artefactosService', () => ({
  artefactosService: {
    consultarVersionesRepositorioAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.consultarVersionesRepositorioAsesor);

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

function crearWrapper(queryClient: QueryClient, ruta = '/artefactos') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[ruta]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useVersionesRepositorioAsesor', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(PAGINA_VACIA);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('con el orden por defecto pide la página 0 con el doble orden del criterio y la key de la feature', async () => {
    // Act
    const { result } = renderHook(() => useVersionesRepositorioAsesor(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['nombreDocumento:ASC', 'numeroVersion:DESC'],
      filtros: undefined,
    });
    expect(result.current.ordenCampo).toBe('nombreDocumento');
    expect(result.current.ordenDireccion).toBe('ASC');
    expect(queryClient.getQueryCache().getAll()[0].queryKey).toEqual([
      'artefactos',
      'versiones-repositorio',
      'asesor',
      0,
      '',
      'nombreDocumento:ASC',
    ]);
  });

  it('con ?q y ?orden envía el filtro de búsqueda y solo ese orden', async () => {
    // Act
    const { result } = renderHook(() => useVersionesRepositorioAsesor(), {
      wrapper: crearWrapper(queryClient, '/artefactos?q=acta&orden=fechaCreacion:DESC'),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith(
      expect.objectContaining({
        ordenamiento: ['fechaCreacion:DESC'],
        filtros: expect.objectContaining({ tipo: 'GRUPO', conector: 'OR' }),
      }),
    );
    expect(result.current.texto).toBe('acta');
  });

  it('un orden fuera de la lista cae al de por defecto', async () => {
    // Act
    const { result } = renderHook(() => useVersionesRepositorioAsesor(), {
      wrapper: crearWrapper(queryClient, '/artefactos?orden=tipoContenido:ASC'),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith(
      expect.objectContaining({ ordenamiento: ['nombreDocumento:ASC', 'numeroVersion:DESC'] }),
    );
  });

  it('goToPage consulta la página pedida', async () => {
    // Arrange
    const { result } = renderHook(() => useVersionesRepositorioAsesor(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.goToPage(2));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 2 })),
    );
  });
});
