import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
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

const SOLO_HABILITADOS = {
  tipo: 'GRUPO',
  conector: 'AND',
  nodos: [
    { tipo: 'PREDICADO', campo: 'proyectoFinalizado', operador: 'ES', valor: 'false' },
    { tipo: 'PREDICADO', campo: 'proyectoCancelado', operador: 'ES', valor: 'false' },
  ],
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
        filtros: SOLO_HABILITADOS,
      },
    });
    expect(
      queryClient
        .getQueryCache()
        .getAll()
        .map((q) => q.queryKey)
        .find((k) => k[1] === 'asesor'),
    ).toEqual(['artefactos', 'asesor', 'sin-avance', 0, 15, '', '', 'fechaUltimaVersion:ASC', '']);
  });

  it('el estado del proyecto va dentro de criterio.filtros y limpiarFiltros vuelve a habilitados', async () => {
    // Arrange
    const { result } = renderHook(
      () => ({ listado: useArtefactosSinAvanceAsesor(), ubicacion: useLocation() }),
      {
        wrapper: crearWrapper(
          queryClient,
          '/artefactos?vista=sin-avance&estadoProyecto=finalizados',
        ),
      },
    );
    await waitFor(() => expect(result.current.listado.isSuccess).toBe(true));

    // Assert
    expect(result.current.listado.hayFiltros).toBe(true);
    expect(consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({
        criterio: expect.objectContaining({
          filtros: {
            tipo: 'PREDICADO',
            campo: 'proyectoFinalizado',
            operador: 'ES',
            valor: 'true',
          },
        }),
      }),
    );

    // Act
    act(() => result.current.listado.limpiarFiltros());

    // Assert
    await waitFor(() => expect(result.current.listado.hayFiltros).toBe(false));
    expect(result.current.ubicacion.search).not.toContain('estadoProyecto');
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          criterio: expect.objectContaining({ filtros: SOLO_HABILITADOS }),
        }),
      ),
    );
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
