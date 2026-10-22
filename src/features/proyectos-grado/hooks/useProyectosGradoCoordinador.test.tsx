import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { ProyectoGrado } from '../models/ProyectoGrado';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { useProyectosGradoCoordinador } from './useProyectosGradoCoordinador';

vi.mock('../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    getProyectosCoordinador: vi.fn(),
  },
}));

const consultar = vi.mocked(proyectosGradoService.getProyectosCoordinador);

const proyecto: ProyectoGrado = {
  id: 'p-1',
  fichaPerfil: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  estado: { id: 'EN_PROCESO', nombre: 'En proceso' },
};

function crearPagina(numero: number, content: ProyectoGrado[]): Page<ProyectoGrado> {
  return {
    content,
    page: numero,
    size: 10,
    totalElements: 12,
    totalPages: 2,
    first: numero === 0,
    last: numero === 1,
    empty: content.length === 0,
  };
}

function crearWrapper(entrada = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[entrada]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

function montarEn(entrada = '/') {
  return renderHook(() => ({ hook: useProyectosGradoCoordinador(), url: useLocation().search }), {
    wrapper: crearWrapper(entrada),
  });
}

describe('useProyectosGradoCoordinador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation(({ pagina }) => Promise.resolve(crearPagina(pagina, [proyecto])));
  });

  it('consulta la página 0 con orden por título ascendente y sin filtros', async () => {
    // Act
    const { result } = montarEn();
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['tituloProyecto:ASC'],
      filtros: undefined,
    });
    expect(result.current.hook.data?.content).toEqual([proyecto]);
  });

  it('buscar y alternar un estado vuelven a la página 0 y se reflejan en la URL', async () => {
    // Arrange
    const { result } = montarEn('/?pagina=2');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));
    expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 1 }));

    // Act
    act(() => result.current.hook.setTexto('  monitoreo '));
    act(() => result.current.hook.toggleEstado('ATRASADO'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith({
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['tituloProyecto:ASC'],
        filtros: {
          tipo: 'GRUPO',
          conector: 'AND',
          nodos: [
            {
              tipo: 'PREDICADO',
              campo: 'tituloProyecto',
              operador: 'CONTIENE',
              valor: 'monitoreo',
            },
            {
              tipo: 'PREDICADO_MULTIVALOR',
              campo: 'estadoProyectoGrado',
              operador: 'IN',
              valores: ['ATRASADO'],
            },
          ],
        },
      }),
    );
    expect(result.current.url).toContain('estado=ATRASADO');
    expect(result.current.url).not.toContain('pagina');
  });

  it('setOrden descendente consulta ordenado y limpiarFiltros quita búsqueda y estados', async () => {
    // Arrange
    const { result } = montarEn('/?q=monitoreo&estado=ATRASADO');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.setOrden('tituloProyecto', 'DESC'));
    act(() => result.current.hook.limpiarFiltros());

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith({
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['tituloProyecto:DESC'],
        filtros: undefined,
      }),
    );
    expect(result.current.hook.texto).toBe('');
    expect(result.current.hook.estadoIds).toEqual([]);
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = montarEn();

    // Assert
    await waitFor(() => expect(result.current.hook.isError).toBe(true));
    expect(result.current.hook.data).toBeUndefined();
  });
});
