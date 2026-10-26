import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { repositorioArtefactosService } from '../services/repositorioArtefactosService';
import { useRepositoriosArtefacto } from './useRepositoriosArtefacto';

vi.mock('../services/repositorioArtefactosService', () => ({
  repositorioArtefactosService: {
    consultarRepositoriosAdministrador: vi.fn(),
  },
}));

const consultar = vi.mocked(repositorioArtefactosService.consultarRepositoriosAdministrador);

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

function crearWrapper(queryClient: QueryClient, ruta = '/repositorio-artefactos') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[ruta]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useRepositoriosArtefacto', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(PAGINA_VACIA);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('consulta la página 0 con 10 por página, orden por defecto y sin filtros bajo la key de la feature', async () => {
    // Act
    const { result } = renderHook(() => useRepositoriosArtefacto(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['nombreRepositorio:ASC'],
      filtros: undefined,
    });
    expect(queryClient.getQueryCache().getAll()[0].queryKey).toEqual([
      'repositorio-artefactos',
      'administrador',
      0,
      '',
      'nombreRepositorio:ASC',
    ]);
  });

  it('al escribir texto envía el grupo OR y vuelve a la página 0', async () => {
    // Arrange
    const { result } = renderHook(() => useRepositoriosArtefacto(), {
      wrapper: crearWrapper(queryClient, '/repositorio-artefactos?pagina=3'),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.setTexto('abc'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          pagina: 0,
          filtros: expect.objectContaining({ tipo: 'GRUPO', conector: 'OR' }),
        }),
      ),
    );
    expect(result.current.page).toBe(0);
  });

  it('setOrden cambia el ordenamiento enviado', async () => {
    // Arrange
    const { result } = renderHook(() => useRepositoriosArtefacto(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.setOrden('administradorNombre', 'DESC'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({ ordenamiento: ['administradorNombre:DESC'] }),
      ),
    );
    expect(result.current.ordenCampo).toBe('administradorNombre');
    expect(result.current.ordenDireccion).toBe('DESC');
  });

  it('un orden inválido en la URL cae al orden por defecto', async () => {
    // Act
    const { result } = renderHook(() => useRepositoriosArtefacto(), {
      wrapper: crearWrapper(queryClient, '/repositorio-artefactos?orden=campoInventado:ASC'),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith(
      expect.objectContaining({ ordenamiento: ['nombreRepositorio:ASC'] }),
    );
  });
});
