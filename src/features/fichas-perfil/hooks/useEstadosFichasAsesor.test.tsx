import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLocation } from 'react-router';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { EstadoFichaPerfilAsesor } from '../models/EstadoFichaPerfilAsesor';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { construirFiltros, useEstadosFichasAsesor } from './useEstadosFichasAsesor';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    getEstadosFichasAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(fichasPerfilService.getEstadosFichasAsesor);

const fila: EstadoFichaPerfilAsesor = {
  fichaPerfilId: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  estadoId: 'st-1',
  estadoNombre: 'En revisión',
  fechaActualizacion: '2026-09-01T10:00:00',
};

function crearPagina(
  numero: number,
  content: EstadoFichaPerfilAsesor[],
): Page<EstadoFichaPerfilAsesor> {
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

describe('construirFiltros', () => {
  it('devuelve undefined sin filtros, un predicado con uno solo y un grupo AND con ambos', () => {
    // Act / Assert
    expect(construirFiltros('', '   ')).toBeUndefined();
    expect(construirFiltros('st-1', '')).toEqual({
      tipo: 'PREDICADO',
      campo: 'estadoFicha',
      operador: 'ES',
      valor: 'st-1',
    });
    expect(construirFiltros('', '  monitoreo ')).toEqual({
      tipo: 'PREDICADO',
      campo: 'tituloProyecto',
      operador: 'CONTIENE',
      valor: 'monitoreo',
    });
    expect(construirFiltros('st-1', 'monitoreo')).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [
        { tipo: 'PREDICADO', campo: 'estadoFicha', operador: 'ES', valor: 'st-1' },
        { tipo: 'PREDICADO', campo: 'tituloProyecto', operador: 'CONTIENE', valor: 'monitoreo' },
      ],
    });
  });
});

describe('useEstadosFichasAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sin filtros consulta la página 0 con tamaño 10, orden por título ascendente y sin filtros, y expone los datos', async () => {
    // Arrange
    const pagina = crearPagina(0, [fila]);
    consultar.mockResolvedValue(pagina);

    // Act
    const { result } = renderHook(() => useEstadosFichasAsesor(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['tituloProyecto:ASC'],
      filtros: undefined,
    });
    expect(result.current.data).toEqual(pagina);
    expect(result.current.page).toBe(0);
    expect(result.current.pageSize).toBe(10);
  });

  it('el texto y el estado se combinan en un grupo AND y cada cambio vuelve a la página 0', async () => {
    // Arrange
    consultar.mockImplementation(({ pagina }) => Promise.resolve(crearPagina(pagina, [fila])));
    const { result } = renderHook(() => useEstadosFichasAsesor(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    act(() => result.current.goToPage(1));
    await waitFor(() => expect(result.current.page).toBe(1));

    // Act
    act(() => result.current.setEstadoId('st-1'));
    await waitFor(() => expect(result.current.page).toBe(0));
    act(() => result.current.goToPage(1));
    await waitFor(() => expect(result.current.page).toBe(1));
    act(() => result.current.setTexto(' monitoreo '));

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
            { tipo: 'PREDICADO', campo: 'estadoFicha', operador: 'ES', valor: 'st-1' },
            {
              tipo: 'PREDICADO',
              campo: 'tituloProyecto',
              operador: 'CONTIENE',
              valor: 'monitoreo',
            },
          ],
        },
      }),
    );
    expect(result.current.page).toBe(0);
    expect(result.current.estadoId).toBe('st-1');
  });

  it('setOrden cambia la dirección del título y limpiarFiltros vacía texto y estado', async () => {
    // Arrange
    consultar.mockImplementation(({ pagina }) => Promise.resolve(crearPagina(pagina, [fila])));
    const { result } = renderHook(() => useEstadosFichasAsesor(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    act(() => result.current.setTexto('monitoreo'));
    act(() => result.current.setEstadoId('st-1'));

    // Act
    act(() => result.current.setOrden('DESC'));
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({ ordenamiento: ['tituloProyecto:DESC'] }),
      ),
    );
    act(() => result.current.limpiarFiltros());

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith({
        pagina: 0,
        tamanio: 10,
        ordenamiento: ['tituloProyecto:DESC'],
        filtros: undefined,
      }),
    );
    expect(result.current.texto).toBe('');
    expect(result.current.estadoId).toBe('');
    expect(result.current.ordenDireccion).toBe('DESC');
  });

  it('vuelve a consultar con la página nueva cuando se llama a goToPage', async () => {
    // Arrange
    consultar.mockImplementation(({ pagina }) => Promise.resolve(crearPagina(pagina, [fila])));
    const { result } = renderHook(() => useEstadosFichasAsesor(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.goToPage(1));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ pagina: 1 })),
    );
    await waitFor(() => expect(result.current.data?.page).toBe(1));
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useEstadosFichasAsesor(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

describe('useEstadosFichasAsesor con la URL como estado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation(({ pagina }) => Promise.resolve(crearPagina(pagina, [fila])));
  });

  it('traduce q, estado, orden y pagina de la URL a lo que recibe el service', async () => {
    // Act
    const { result } = renderHook(() => useEstadosFichasAsesor(), {
      wrapper: crearWrapper('/?q=monitoreo&estado=st-1&orden=tituloProyecto:DESC&pagina=2'),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 1,
      tamanio: 10,
      ordenamiento: ['tituloProyecto:DESC'],
      filtros: construirFiltros('st-1', 'monitoreo'),
    });
  });

  it('cambiar filtro u orden escribe la URL y borra pagina; limpiarFiltros quita q y estado', async () => {
    // Arrange
    const { result } = renderHook(
      () => ({ hook: useEstadosFichasAsesor(), url: useLocation().search }),
      { wrapper: crearWrapper('/?pagina=3') },
    );
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.setEstadoId('st-1'));
    act(() => result.current.hook.setOrden('DESC'));

    // Assert
    expect(new URLSearchParams(result.current.url).get('estado')).toBe('st-1');
    expect(new URLSearchParams(result.current.url).get('orden')).toBe('tituloProyecto:DESC');
    expect(new URLSearchParams(result.current.url).has('pagina')).toBe(false);

    // Act
    act(() => result.current.hook.limpiarFiltros());

    // Assert
    expect(result.current.url).toBe('?orden=tituloProyecto%3ADESC');
  });
});
