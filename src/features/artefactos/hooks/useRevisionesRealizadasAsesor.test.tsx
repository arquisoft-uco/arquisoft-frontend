import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { artefactosService } from '../services/artefactosService';
import { useRevisionesRealizadasAsesor } from './useRevisionesRealizadasAsesor';

vi.mock('../services/artefactosService', () => ({
  artefactosService: {
    consultarRevisionesAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.consultarRevisionesAsesor);

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

describe('useRevisionesRealizadasAsesor', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(PAGINA_VACIA);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  it('consulta la página 0 con 10 por página, orden por defecto y sin filtros bajo la key de la feature', async () => {
    // Act
    const { result } = renderHook(() => useRevisionesRealizadasAsesor(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['estadoRevisionAsesor:ASC'],
      filtros: undefined,
    });
    expect(result.current.direccionOrden).toBe('ASC');
    expect(queryClient.getQueryCache().getAll()[0].queryKey).toEqual([
      'artefactos',
      'revisiones-asesor',
      'realizadas',
      0,
      [],
      'estadoRevisionAsesor:ASC',
    ]);
  });

  it('al alternar un estado la petición lleva el IN y vuelve a la página 0', async () => {
    // Arrange
    const { result } = renderHook(() => useRevisionesRealizadasAsesor(), {
      wrapper: crearWrapper(queryClient, '/artefactos?pagina=3'),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.toggleEstado('RESUELTA'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith({
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['estadoRevisionAsesor:ASC'],
        filtros: {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'estadoRevisionAsesor',
          operador: 'IN',
          valores: ['RESUELTA'],
        },
      }),
    );
    expect(result.current.estadoIds).toEqual(['RESUELTA']);
  });

  it('al cambiar la dirección del orden la petición lo refleja', async () => {
    // Arrange
    const { result } = renderHook(() => useRevisionesRealizadasAsesor(), {
      wrapper: crearWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.setDireccionOrden('DESC'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({ ordenamiento: ['estadoRevisionAsesor:DESC'] }),
      ),
    );
    expect(result.current.direccionOrden).toBe('DESC');
  });
});
